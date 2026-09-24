
# NEXUZR006PaymentPaymentStatusResponse

Response body for retrieving payment status.

## Properties

Name | Type
------------ | -------------
`warning` | [NEXUZR006PaymentWarningItem](NEXUZR006PaymentWarningItem.md)
`data` | [NEXUZR006PaymentPaymentOrder](NEXUZR006PaymentPaymentOrder.md)

## Example

```typescript
import type { NEXUZR006PaymentPaymentStatusResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "warning": null,
  "data": null,
} satisfies NEXUZR006PaymentPaymentStatusResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR006PaymentPaymentStatusResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


