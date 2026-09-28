
# NEXUZR004OffersPassengerType

Information about a specific passenger type within a bundle, including the type, quantity, and associated services.

## Properties

Name | Type
------------ | -------------
`type` | string
`amount` | number
`bundleQuantity` | number
`actualQuantity` | number
`categoryId` | number
`serviceId` | number
`cutoffHours` | number
`categories` | [Array&lt;NEXUZR004OffersCategory&gt;](NEXUZR004OffersCategory.md)

## Example

```typescript
import type { NEXUZR004OffersPassengerType } from ''

// TODO: Update the object below with actual values
const example = {
  "type": adult,
  "amount": 25001,
  "bundleQuantity": 1,
  "actualQuantity": 10,
  "categoryId": 142,
  "serviceId": 3,
  "cutoffHours": 290,
  "categories": null,
} satisfies NEXUZR004OffersPassengerType

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR004OffersPassengerType
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


