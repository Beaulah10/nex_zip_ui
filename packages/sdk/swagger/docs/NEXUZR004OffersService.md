
# NEXUZR004OffersService

Information about a specific service within a category, including the service code, quantity available, and description.

## Properties

Name | Type
------------ | -------------
`code` | string
`quantityAvailable` | number
`description` | string

## Example

```typescript
import type { NEXUZR004OffersService } from ''

// TODO: Update the object below with actual values
const example = {
  "code": MVAL,
  "quantityAvailable": 260,
  "description": Vegetarian meal option,
} satisfies NEXUZR004OffersService

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR004OffersService
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


