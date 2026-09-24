
# NEXUZR004OffersSegmentWiseBundle

Bundle information for a specific flight segment, identified by its Logical Flight ID (LFID).

## Properties

Name | Type
------------ | -------------
`lfid` | number
`bundles` | [Array&lt;NEXUZR004OffersBundle&gt;](NEXUZR004OffersBundle.md)

## Example

```typescript
import type { NEXUZR004OffersSegmentWiseBundle } from ''

// TODO: Update the object below with actual values
const example = {
  "lfid": 74982,
  "bundles": null,
} satisfies NEXUZR004OffersSegmentWiseBundle

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR004OffersSegmentWiseBundle
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


