import fs from 'fs'
import ts, {
    FunctionDeclaration,
    Node,
    VariableDeclarationList,
} from 'typescript'
import { EventFunction } from './types'
import { createLambdaCode } from './eventBridgeOutput'
import { getFilePathsRecursively } from './utils'
import { outputGherkin } from './gherkins'

function getReturnType(
    functionName: string,
    node: FunctionDeclaration,
    program: ts.Program
): [boolean, string] {
    const checker = program.getTypeChecker()
    const signature = checker.getSignatureFromDeclaration(node)
    if (!signature) return [false, '']
    const returnTypeNode = checker.getReturnTypeOfSignature(signature)
    if (
        ['__object', 'Array'].includes(
            returnTypeNode.symbol?.escapedName ?? ''
        ) ||
        returnTypeNode.isUnionOrIntersection()
    )
        return [false, functionName + 'Result']
    return [true, checker.typeToString(returnTypeNode)]
}

const parseFunctions = async (tsFile: string) => {
    const program = ts.createProgram([tsFile], {
        outDir: './cache',
        module: ts.ModuleKind.ES2015,
        target: ts.ScriptTarget.ES2017,
        sourceMap: false,
        include: [tsFile],
        exclude: ['node_modules'],
    })
    const sourceFile = program.getSourceFile(tsFile)
    if (!sourceFile) return []
    const events: EventFunction[] = []
    const promises: Promise<any>[] = []
    ts.forEachChild(sourceFile, (_node) => {
        let node: Node | undefined = _node
        const comments = ts.getLeadingCommentRanges(
            sourceFile.text,
            node.getFullStart()
        )
        if (ts.isVariableStatement(node)) {
            const declarationList: VariableDeclarationList =
                node.declarationList as VariableDeclarationList
            declarationList.declarations.forEach((node) => {
                if (node.initializer && ts.isArrowFunction(node.initializer)) {
                    const arrowFunction = node.initializer
                    //TODO: Fix this to work with arrow functions
                    /*if (arrowFunction)
                        promises.push(
                            createEventFromNode(
                                node.name?.text,
                                arrowFunction,
                                sourceFile,
                                program,
                                comments
                            )
                        )
                        */
                }
            })
        } else {
            if (
                node &&
                ts.isFunctionDeclaration(node) &&
                node.name &&
                node.name.text
            ) {
                promises.push(
                    createEventFromNode(
                        node.name?.text,
                        node,
                        sourceFile,
                        tsFile,
                        program,
                        comments
                    )
                )
            }
        }
    })
    const results = await Promise.all(promises)
    results.forEach((result) => events.push(...result))
    return events
}

const createEventFromNode = async (
    functionName: string,
    node: ts.FunctionDeclaration,
    sourceFile: ts.SourceFile,
    tsFile: string,
    program: ts.Program,
    comments?: ts.CommentRange[]
) => {
    const events: EventFunction[] = []
    let eventTrigger = ''
    let eventFire = ''
    let filter = undefined

    if (comments && comments.length > 0) {
        const commentText = sourceFile.text.substring(
            comments[0].pos,
            comments[0].end
        )
        const triggerMatch = commentText.match(/@trigger\s+(\w+)/)
        const eventFireMatch = commentText.match(/@event\s+(\w+)/)
        const eventFilterMatch = commentText.match(/@filter\s+(.*)/)
        if (triggerMatch && triggerMatch[1]) {
            eventTrigger = triggerMatch[1]
        }
        if (eventFireMatch && eventFireMatch[1]) {
            eventFire = eventFireMatch[1]
        }
        if (eventFilterMatch && eventFilterMatch[1]) {
            filter = JSON.parse(eventFilterMatch[1])
        }
    }

    if (eventTrigger) {
        const [returnTypeExists, returnType] = getReturnType(
            functionName,
            node,
            program
        )
        events.push({
            eventTrigger: eventTrigger,
            filter,
            functionName: functionName,
            code: createLambdaCode({
                functionName,
                returnType,
                filePath: tsFile,
            }),
            eventToFire: eventFire,
            returnType,
            returnTypeExists,
        })
    }
    return events
}

function generateJSONFile(events: EventFunction[], outputFilePath: string) {
    fs.writeFileSync(outputFilePath, JSON.stringify(events, null, 2))
    console.log(
        `EventBridge rules successfully generated and written to ${outputFilePath}`
    )
}

const run = async () => {
    const folder = __dirname + '/../example'
    const tsFiles = getFilePathsRecursively(folder).filter((file) =>
        file.endsWith('.ts')
    )
    const events: EventFunction[] = []
    const jsonOutputFilePath = './eventBridgeRules.json'
    const outputDirectory = './functionCode'
    for (const tsFile of tsFiles) {
        events.push(...(await parseFunctions(tsFile)))
    }
    generateJSONFile(events, jsonOutputFilePath)

    fs.mkdirSync(outputDirectory, { recursive: true })

    events.forEach((eventData) => {
        fs.writeFileSync(
            __dirname + '/../functionCode/' + eventData.functionName + '.ts',
            eventData.code
        )
    })
    outputGherkin(events)
}
run()
