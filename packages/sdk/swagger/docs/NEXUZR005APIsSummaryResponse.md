
# NEXUZR005APIsSummaryResponse

Successful order preparation response.

## Properties

Name | Type
------------ | -------------
`data` | [NEXUZR005APIsResponseData](NEXUZR005APIsResponseData.md)
`warning` | [NEXUZR005APIsWarningMessage](NEXUZR005APIsWarningMessage.md)

## Example

```typescript
import type { NEXUZR005APIsSummaryResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "data": null,
  "warning": null,
} satisfies NEXUZR005APIsSummaryResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR005APIsSummaryResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


