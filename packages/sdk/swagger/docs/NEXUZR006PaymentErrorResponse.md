
# NEXUZR006PaymentErrorResponse

Standard error response body.

## Properties

Name | Type
------------ | -------------
`code` | string
`description` | string

## Example

```typescript
import type { NEXUZR006PaymentErrorResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "code": NEXUZCMNE001,
  "description": Required input is missing,
} satisfies NEXUZR006PaymentErrorResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR006PaymentErrorResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


