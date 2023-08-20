import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'
import { EventFunction } from '../src/types'
import pkg from '../package.json'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import funcs from '../eventBridgeRules.json'

function createLambdaEventTrigger(
    scope: Construct,
    id: string,
    props: EventFunction
): void {
    const lambdaFunction = new NodejsFunction(scope, id + 'LambdaFunction', {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'index.handler',
        entry: __dirname + '/../functionCode/' + props.functionName + '.ts',
        tracing: lambda.Tracing.ACTIVE,
    })

    lambdaFunction.addToRolePolicy(
        new iam.PolicyStatement({
            actions: ['events:PutEvents'],
            resources: ['*'], // Use config to restrict this
        })
    )

    const eventRule = new events.Rule(scope, id + 'EventRule', {
        eventPattern: {
            source: [pkg.name],
            detailType: [props.eventTrigger],
            detail: props.filter,
        },
    })

    eventRule.addTarget(new targets.LambdaFunction(lambdaFunction))
}

// Example usage
class MyStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)
        funcs.forEach((func: EventFunction) => {
            createLambdaEventTrigger(this, func.functionName, func)
        })
    }
}

const app = new cdk.App()
new MyStack(app, 'MyStack')
