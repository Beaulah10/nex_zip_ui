
# NEXUZR006PaymentInitializePaymentRequest


## Properties

Name | Type
------------ | -------------
`confirmationNumber` | string
`baseAmount` | number
`datePaid` | string
`exchangeRate` | number
`exchangeRateDate` | string
`expirationDate` | string
`originalAmount` | number
`paymentAmount` | number
`personOrgID` | number
`dob` | Date
`age` | number
`firstName` | string
`middleName` | string
`gender` | string
`lastName` | string
`marketingOptIn` | boolean
`nationality` | string
`contactInfos` | [Array&lt;NEXUZR006PaymentContactInfo&gt;](NEXUZR006PaymentContactInfo.md)
`recipientInfo` | [NEXUZR006PaymentRecipientInfo](NEXUZR006PaymentRecipientInfo.md)

## Example

```typescript
import type { NEXUZR006PaymentInitializePaymentRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "confirmationNumber": 6RIZGP,
  "baseAmount": 12345.12,
  "datePaid": 2026-05-21T11:55:12,
  "exchangeRate": 1,
  "exchangeRateDate": 2026-05-21T11:55:12,
  "expirationDate": 2026-05-21T11:55:12,
  "originalAmount": 12346.12,
  "paymentAmount": 12345.12,
  "personOrgID": 123,
  "dob": Thu May 21 09:00:00 JST 2026,
  "age": 25,
  "firstName": JAMES,
  "middleName": PETER,
  "gender": M,
  "lastName": PETER,
  "marketingOptIn": false,
  "nationality": JPN,
  "contactInfos": null,
  "recipientInfo": null,
} satisfies NEXUZR006PaymentInitializePaymentRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR006PaymentInitializePaymentRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


