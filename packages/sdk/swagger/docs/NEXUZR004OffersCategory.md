
# NEXUZR004OffersCategory

Information about a specific service category within a bundle, including the category name and associated services.

## Properties

Name | Type
------------ | -------------
`category` | string
`services` | [Array&lt;NEXUZR004OffersService&gt;](NEXUZR004OffersService.md)

## Example

```typescript
import type { NEXUZR004OffersCategory } from ''

// TODO: Update the object below with actual values
const example = {
  "category": meals,
  "services": null,
} satisfies NEXUZR004OffersCategory

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR004OffersCategory
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


