
# NEXUZR003FlightsFareInfo

Fare detail grouped by cabin type.

## Properties

Name | Type
------------ | -------------
`cabin` | string
`boundSummary` | [NEXUZR003FlightsBoundSummary](NEXUZR003FlightsBoundSummary.md)
`fareDetails` | [Array&lt;NEXUZR003FlightsFareDetail&gt;](NEXUZR003FlightsFareDetail.md)

## Example

```typescript
import type { NEXUZR003FlightsFareInfo } from ''

// TODO: Update the object below with actual values
const example = {
  "cabin": STANDARD,
  "boundSummary": null,
  "fareDetails": null,
} satisfies NEXUZR003FlightsFareInfo

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR003FlightsFareInfo
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


