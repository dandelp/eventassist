import { LoanApplicationDecision } from './loanApplicationService'

/* 
    @trigger LoanApplicationDecisioned
    @event ProcessedCreditBureau
*/
export function processCreditBureau({
    approved,
    loanApplication,
}: LoanApplicationDecision) {
    console.log(
        'Doing a lot of work to parse and push Credit Bureau data to the data warehouse'
    )
    return loanApplication.vendors.creditBureau
}

/* 
    @trigger LoanApplicationDecisioned
    @event ProcessedFraud
*/
export function processFraud({
    approved,
    loanApplication,
}: LoanApplicationDecision) {
    console.log(
        'Doing a lot of work to parse and push Fraud data to the data warehouse'
    )
    return loanApplication.vendors.fraudCheck
}
