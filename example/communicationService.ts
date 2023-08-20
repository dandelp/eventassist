import { LoanApplicationDecision } from './loanApplicationService'

/* 
    @trigger LoanApplicationDecisioned
    @filter {"approved": [true]}
    @event OnboardingEmailSent
*/
export function sendOnBoardingEmail({ approved }: LoanApplicationDecision) {
    console.log('Sending onboarding Email')
    return { success: true }
}

/* 
    @trigger LoanApplicationDecisioned
    @filter {"approved": [false]}
    @event NOAASent
*/
export function sendNOAA({ approved }: LoanApplicationDecision) {
    console.log('Sending NOAA')
    return { success: true }
}
