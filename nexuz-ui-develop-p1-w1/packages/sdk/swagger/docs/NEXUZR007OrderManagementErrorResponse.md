
# NEXUZR007OrderManagementErrorResponse

Standard error response body returned when the API fails.

## Properties

Name | Type
------------ | -------------
`code` | string
`description` | string

## Example

```typescript
import type { NEXUZR007OrderManagementErrorResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "code": NEXUZCMNE001,
  "description": Required input is missing,
} satisfies NEXUZR007OrderManagementErrorResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR007OrderManagementErrorResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


