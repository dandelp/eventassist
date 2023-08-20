import path from 'path'
import fs from 'fs'

export function getFilePathsRecursively(dir: string): string[] {
    const filePaths: string[] = []

    function traverseDirectory(currentPath: string) {
        const files = fs.readdirSync(currentPath)

        for (const file of files) {
            const fullPath = path.join(currentPath, file)

            if (fs.statSync(fullPath).isDirectory()) {
                traverseDirectory(fullPath)
            } else {
                filePaths.push(fullPath)
            }
        }
    }

    traverseDirectory(dir)
    return filePaths
}
