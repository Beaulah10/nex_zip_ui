
# NEXUZR005APIsDocument


## Properties

Name | Type
------------ | -------------
`documentId` | number
`documentNumber` | string
`issuedCountry` | string
`expiryDate` | string
`isScanned` | boolean

## Example

```typescript
import type { NEXUZR005APIsDocument } from ''

// TODO: Update the object below with actual values
const example = {
  "documentId": 1,
  "documentNumber": HUF13345,
  "issuedCountry": JPN,
  "expiryDate": 2026-06-06,
  "isScanned": true,
} satisfies NEXUZR005APIsDocument

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR005APIsDocument
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


