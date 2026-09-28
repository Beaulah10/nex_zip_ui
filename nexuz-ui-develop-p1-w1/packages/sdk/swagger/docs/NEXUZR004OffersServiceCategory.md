
# NEXUZR004OffersServiceCategory


## Properties

Name | Type
------------ | -------------
`title` | string
`categoryId` | number
`specialServices` | [Array&lt;NEXUZR004OffersSpecialService&gt;](NEXUZR004OffersSpecialService.md)

## Example

```typescript
import type { NEXUZR004OffersServiceCategory } from ''

// TODO: Update the object below with actual values
const example = {
  "title": In-Flight Meals,
  "categoryId": 6,
  "specialServices": null,
} satisfies NEXUZR004OffersServiceCategory

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR004OffersServiceCategory
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


