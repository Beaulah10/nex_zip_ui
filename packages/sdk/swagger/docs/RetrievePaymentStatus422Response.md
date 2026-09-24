
# RetrievePaymentStatus422Response


## Properties

Name | Type
------------ | -------------
`code` | string
`description` | string
`warning` | [NEXUZR006PaymentWarningItem](NEXUZR006PaymentWarningItem.md)
`data` | [NEXUZR006PaymentPaymentOrder](NEXUZR006PaymentPaymentOrder.md)

## Example

```typescript
import type { RetrievePaymentStatus422Response } from ''

// TODO: Update the object below with actual values
const example = {
  "code": NEXUZCMNE001,
  "description": Required input is missing,
  "warning": null,
  "data": null,
} satisfies RetrievePaymentStatus422Response

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RetrievePaymentStatus422Response
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


