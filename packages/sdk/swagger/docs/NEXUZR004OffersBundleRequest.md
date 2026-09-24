
# NEXUZR004OffersBundleRequest

Request payload containing flight route, passenger composition, and flight segment details.

## Properties

Name | Type
------------ | -------------
`routes` | string
`adult` | number
`childA` | number
`childB` | number
`childC` | number
`infant` | number
`outbound` | [Array&lt;NEXUZR004OffersFlight&gt;](NEXUZR004OffersFlight.md)
`inbound` | [Array&lt;NEXUZR004OffersFlight&gt;](NEXUZR004OffersFlight.md)

## Example

```typescript
import type { NEXUZR004OffersBundleRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "routes": BKK,NRT,
  "adult": 1,
  "childA": 1,
  "childB": 1,
  "childC": 1,
  "infant": 1,
  "outbound": null,
  "inbound": null,
} satisfies NEXUZR004OffersBundleRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR004OffersBundleRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


