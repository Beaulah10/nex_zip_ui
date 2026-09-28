
# NEXUZR006PaymentPaymentOrder

Payment order representing the current state of the payment.

## Properties

Name | Type
------------ | -------------
`status` | string
`confirmationNumber` | string

## Example

```typescript
import type { NEXUZR006PaymentPaymentOrder } from ''

// TODO: Update the object below with actual values
const example = {
  "status": null,
  "confirmationNumber": ABC123,
} satisfies NEXUZR006PaymentPaymentOrder

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR006PaymentPaymentOrder
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


