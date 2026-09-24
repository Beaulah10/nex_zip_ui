
# NEXUZR003FlightsBoundSummary

Aggregated fare summary for a specific cabin, covering all requested passenger types. 

## Properties

Name | Type
------------ | -------------
`totalFlightAmount` | number
`promotionalAmount` | number
`passengerWiseFares` | [Array&lt;NEXUZR003FlightsPassengerWiseFare&gt;](NEXUZR003FlightsPassengerWiseFare.md)
`totalTaxAmount` | number
`taxBreakDown` | [Array&lt;NEXUZR003FlightsTaxBreakDown&gt;](NEXUZR003FlightsTaxBreakDown.md)

## Example

```typescript
import type { NEXUZR003FlightsBoundSummary } from ''

// TODO: Update the object below with actual values
const example = {
  "totalFlightAmount": 45000,
  "promotionalAmount": 3000,
  "passengerWiseFares": null,
  "totalTaxAmount": 5000,
  "taxBreakDown": null,
} satisfies NEXUZR003FlightsBoundSummary

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR003FlightsBoundSummary
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


