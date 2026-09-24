
# NEXUZR006PaymentInitializePaymentResponseData


## Properties

Name | Type
------------ | -------------
`statusCheckKey` | string
`paymentReferenceId` | number
`redirectionUrl` | string

## Example

```typescript
import type { NEXUZR006PaymentInitializePaymentResponseData } from ''

// TODO: Update the object below with actual values
const example = {
  "statusCheckKey": qytwdqytwcqtwbcbequyuqyhehuyq12,
  "paymentReferenceId": 1275136,
  "redirectionUrl": https://pop-payment-redirect.example.com/order/xyz,
} satisfies NEXUZR006PaymentInitializePaymentResponseData

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR006PaymentInitializePaymentResponseData
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


