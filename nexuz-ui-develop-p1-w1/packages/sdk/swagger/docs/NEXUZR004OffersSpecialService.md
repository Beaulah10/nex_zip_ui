
# NEXUZR004OffersSpecialService


## Properties

Name | Type
------------ | -------------
`lfid` | number
`amount` | number
`currency` | string
`cutOffHours` | number
`description` | string
`maxCountServiceLevel` | number
`qtyAvailable` | number
`ssrCode` | string
`ssrId` | number
`startSalesDays` | number
`pfid` | number

## Example

```typescript
import type { NEXUZR004OffersSpecialService } from ''

// TODO: Update the object below with actual values
const example = {
  "lfid": 74286,
  "amount": 1500,
  "currency": JPY,
  "cutOffHours": 24,
  "description": Vegetarian Meal,
  "maxCountServiceLevel": 20,
  "qtyAvailable": 10,
  "ssrCode": VGML,
  "ssrId": 123,
  "startSalesDays": 0,
  "pfid": 69426,
} satisfies NEXUZR004OffersSpecialService

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR004OffersSpecialService
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


