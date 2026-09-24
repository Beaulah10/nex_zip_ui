
# NEXUZR005APIsDestinationAddress


## Properties

Name | Type
------------ | -------------
`country` | string
`postalCode` | string
`state` | string
`city` | string
`address` | string

## Example

```typescript
import type { NEXUZR005APIsDestinationAddress } from ''

// TODO: Update the object below with actual values
const example = {
  "country": JPN,
  "postalCode": 12345,
  "state": Tokyo,
  "city": Chiyoda,
  "address": Example Street,
} satisfies NEXUZR005APIsDestinationAddress

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR005APIsDestinationAddress
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


