
# NEXUZR003FlightsTax

Individual tax detail applied to a fare.

## Properties

Name | Type
------------ | -------------
`id` | number
`amount` | number
`taxCode` | string
`taxDesc` | string

## Example

```typescript
import type { NEXUZR003FlightsTax } from ''

// TODO: Update the object below with actual values
const example = {
  "id": 582,
  "amount": 1200,
  "taxCode": TK,
  "taxDesc": International Tourist Tax(JAPAN),
} satisfies NEXUZR003FlightsTax

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR003FlightsTax
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


