
# NEXUZR005APIsService


## Properties

Name | Type
------------ | -------------
`lfid` | number
`pfid` | number
`amount` | number
`categoryId` | number
`ssrCode` | string
`serviceID` | number
`chargeComment` | string
`bundleCode` | string

## Example

```typescript
import type { NEXUZR005APIsService } from ''

// TODO: Update the object below with actual values
const example = {
  "lfid": 1231,
  "pfid": 4123,
  "amount": 8721.23,
  "categoryId": 123,
  "ssrCode": STTR,
  "serviceID": 123,
  "chargeComment": test comment,
  "bundleCode": SRRD,
} satisfies NEXUZR005APIsService

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR005APIsService
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


