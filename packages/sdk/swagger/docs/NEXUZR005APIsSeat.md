
# NEXUZR005APIsSeat


## Properties

Name | Type
------------ | -------------
`lfid` | number
`pfid` | number
`row` | number
`column` | string
`serviceCode` | string
`amount` | number
`bundleCode` | string

## Example

```typescript
import type { NEXUZR005APIsSeat } from ''

// TODO: Update the object below with actual values
const example = {
  "lfid": 1234,
  "pfid": 1222,
  "row": 2,
  "column": A,
  "serviceCode": STEA,
  "amount": 1232.12,
  "bundleCode": STTR,
} satisfies NEXUZR005APIsSeat

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR005APIsSeat
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


