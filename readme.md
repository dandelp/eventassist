# Event Assist

Library used to automatically generate event based architecture using code comments in typescript.

Example

```typescript
/* 
    @trigger LoanApplicationDecisioned
    @filter {"approved": [true]}
    @event OnboardingEmailSent
*/
export function sendOnBoardingEmail({ approved }: LoanApplicationDecision) {
    console.log('Sending onboarding Email')
    return { success: true }
}
```

This code will create an aws lambda function called sendOnBoardingEmail. @trigger tells the library to generate an eventbridge rule that will call the lambda when an event with detailType LoanApplicationDecisioned is called. This particular case also filters the detail to only fire when approved = true in the event payload. Finally, the library will inject code into the lambda to fire a new event (OnboardingEmailSent) with the return value of the lambda function.

## Installation:

If you do not have cdk configure start with

```
npm i -g cdk
```

Follow the directions for [configuring cdk](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)

---

```
npm install
npm build
cdk bootstrap aws://#########/{region}`
cdk deploy
```

This will deploy the code in the example folder. Here is the generated gherkin for this sample project:

```gherkin
***************
Gherkin output:
***************

When [LoanApplicationDecisioned]
 When approved is true
   Then sendOnBoardingEmail() and fire [OnboardingEmailSent] with sendOnBoardingEmailResult
 When approved is false
   Then sendNOAA() and fire [NOAASent] with sendNOAAResult
 Then processCreditBureau() and fire [ProcessedCreditBureau] with CreditBureauData
 Then processFraud() and fire [ProcessedFraud] with FraudCheckData


When [LoanApplicationComplete]
 Then processLoanApp() and fire [LoanApplicationDecisioned] with LoanApplicationDecision


When [ProcessedFraud]
 Then updateFraudVelocityRules() and fire [UpdatedVelocityRules] with updateFraudVelocityRulesResult

```

**TODOS:**

-   [ ] Type validation at build time
-   [ ] Fix gherkin output ordering
-   [ ] Searchable DAG view
-   [ ] Type support for triggerTypes (
        When [LoanApplicationDecisioned]
        When approved is true
        Becomes
        When [LoanApplicationDecisioned] and {LoanApplication.approved} is true
        )
-   [ ] Support for arrow functions
-   [ ] Support for "definitions" as comments in type:
        @define {'approved application': {'approved': true}}

## Bi-directional Support

The system generates a json structure for each event then processes the json to create the gherkin. With bi-directional support, we can begin to create a domain specific language (in gherkin to begin) that can be used to generate code for new features.

**Current:** `Code -> Json -> Gherkin`\
**Bidirectional:** `Gherkin -> Json -> Code`

**TODOS:**

-   [ ] Given well-defined Gherkin, generate lambda and rule (create grammar/parser)
-   [ ] Code completion tool
-   [ ] NLP helpers - Example: user types "Approved loan application" and the NLP helper converts to "LoanApplication.approved is true"
