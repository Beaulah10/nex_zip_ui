
# NEXUZR006PaymentPaymentStatusRequest

Request body for retrieving payment status.

## Properties

Name | Type
------------ | -------------
`paymentReferenceId` | number

## Example

```typescript
import type { NEXUZR006PaymentPaymentStatusRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "paymentReferenceId": 123,
} satisfies NEXUZR006PaymentPaymentStatusRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR006PaymentPaymentStatusRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


