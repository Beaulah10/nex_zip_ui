
# NEXUZR003FlightsErrorResponse

Standard error response body.

## Properties

Name | Type
------------ | -------------
`code` | string
`description` | string

## Example

```typescript
import type { NEXUZR003FlightsErrorResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "code": NEXUZCMNE001,
  "description": Required Input is Missing,
} satisfies NEXUZR003FlightsErrorResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR003FlightsErrorResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


