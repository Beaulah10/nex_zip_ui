
# NEXUZR006PaymentWarningItem

Standard warning returned when the API encounters partial failures.

## Properties

Name | Type
------------ | -------------
`code` | string
`description` | string

## Example

```typescript
import type { NEXUZR006PaymentWarningItem } from ''

// TODO: Update the object below with actual values
const example = {
  "code": NEXUZR006W001,
  "description": Unable to proceed further,
} satisfies NEXUZR006PaymentWarningItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR006PaymentWarningItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


