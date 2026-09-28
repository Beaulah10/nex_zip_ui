
# NEXUZR005APIsBundle


## Properties

Name | Type
------------ | -------------
`lfid` | number
`pfid` | number
`bundleCode` | string
`amount` | number
`categoryId` | number
`serviceId` | number

## Example

```typescript
import type { NEXUZR005APIsBundle } from ''

// TODO: Update the object below with actual values
const example = {
  "lfid": 1232,
  "pfid": 2123,
  "bundleCode": STTR,
  "amount": 9000.12,
  "categoryId": 231,
  "serviceId": 123,
} satisfies NEXUZR005APIsBundle

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR005APIsBundle
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


