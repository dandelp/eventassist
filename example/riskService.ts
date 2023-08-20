import { LoanApplicationDecision } from './loanApplicationService'

/* 
    @trigger ProcessedFraud
    @event UpdatedVelocityRules
*/
export function updateFraudVelocityRules({
    approved,
    loanApplication,
}: LoanApplicationDecision) {
    console.log(
        'Update fraud velocity rules based on fraud data from the data warehouse'
    )
    return { status: true }
}
