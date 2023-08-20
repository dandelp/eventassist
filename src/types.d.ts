import { Rule, RuleProps } from 'aws-cdk-lib/aws-events'

export interface EventFunction {
    eventTrigger: string
    filter?: { [key: string]: any }
    functionName: string
    code: string
    eventToFire: string
    returnType: string
    returnTypeExists: boolean
}
