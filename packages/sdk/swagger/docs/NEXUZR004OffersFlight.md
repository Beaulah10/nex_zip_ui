
# NEXUZR004OffersFlight

Flight details including departure date, cabin class, logical flight ID, fare basis code, and fare class.

## Properties

Name | Type
------------ | -------------
`departureDate` | Date
`cabin` | string
`lfid` | number
`fareBasisCode` | string
`fareClass` | string

## Example

```typescript
import type { NEXUZR004OffersFlight } from ''

// TODO: Update the object below with actual values
const example = {
  "departureDate": Sun Jun 28 09:00:00 JST 2026,
  "cabin": null,
  "lfid": 12345,
  "fareBasisCode": FQYB45,
  "fareClass": U,
} satisfies NEXUZR004OffersFlight

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR004OffersFlight
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


