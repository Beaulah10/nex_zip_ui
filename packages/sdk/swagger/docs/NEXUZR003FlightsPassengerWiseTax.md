
# NEXUZR003FlightsPassengerWiseTax

Tax amount for a specific passenger type under a given tax code.

## Properties

Name | Type
------------ | -------------
`passengerType` | string
`passengerCount` | number
`amount` | number

## Example

```typescript
import type { NEXUZR003FlightsPassengerWiseTax } from ''

// TODO: Update the object below with actual values
const example = {
  "passengerType": null,
  "passengerCount": 2,
  "amount": 2000,
} satisfies NEXUZR003FlightsPassengerWiseTax

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR003FlightsPassengerWiseTax
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


