
# NEXUZR007OrderManagementIssuer


## Properties

Name | Type
------------ | -------------
`address1` | string
`postalCode` | string
`city` | string
`countryCode` | string

## Example

```typescript
import type { NEXUZR007OrderManagementIssuer } from ''

// TODO: Update the object below with actual values
const example = {
  "address1": ZipAir,
  "postalCode": 1400002,
  "city": Tokyo,
  "countryCode": JP,
} satisfies NEXUZR007OrderManagementIssuer

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR007OrderManagementIssuer
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


