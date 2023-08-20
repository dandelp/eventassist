type CreditBureauData = { foo: string; score: number }
type FraudCheckData = { isFraud: boolean }

export interface LoanApplication {
    autoApprove: boolean
    vendors: {
        creditBureau: CreditBureauData
        fraudCheck: FraudCheckData
    }
}

export interface LoanApplicationDecision {
    approved: boolean
    loanApplication: LoanApplication
}

/* 
    @trigger LoanApplicationComplete
    @event LoanApplicationDecisioned 
*/
export function processLoanApp(
    loanApplication: LoanApplication
): LoanApplicationDecision {
    const score = loanApplication.vendors.creditBureau.score
    const isFraud = loanApplication.vendors.fraudCheck.isFraud
    const approved = score > 600 && !isFraud
    console.log('Processing loan application', { score, isFraud, approved })
    return { approved, loanApplication }
}
