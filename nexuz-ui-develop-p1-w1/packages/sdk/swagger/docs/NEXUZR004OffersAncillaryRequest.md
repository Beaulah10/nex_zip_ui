
# NEXUZR004OffersAncillaryRequest


## Properties

Name | Type
------------ | -------------
`departureDate` | string
`lfid` | number
`origin` | string
`destination` | string
`serviceCategory` | string
`passengers` | [NEXUZR004OffersPassengers](NEXUZR004OffersPassengers.md)

## Example

```typescript
import type { NEXUZR004OffersAncillaryRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "departureDate": 2026-05-22,
  "lfid": 74286,
  "origin": BKK,
  "destination": NRT,
  "serviceCategory": null,
  "passengers": null,
} satisfies NEXUZR004OffersAncillaryRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR004OffersAncillaryRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


