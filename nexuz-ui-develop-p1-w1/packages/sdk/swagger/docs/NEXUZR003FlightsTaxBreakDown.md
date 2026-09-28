
# NEXUZR003FlightsTaxBreakDown

Tax detail broken down by tax code.

## Properties

Name | Type
------------ | -------------
`taxCode` | string
`description` | string
`taxAmount` | number
`passengerWiseTaxes` | [Array&lt;NEXUZR003FlightsPassengerWiseTax&gt;](NEXUZR003FlightsPassengerWiseTax.md)

## Example

```typescript
import type { NEXUZR003FlightsTaxBreakDown } from ''

// TODO: Update the object below with actual values
const example = {
  "taxCode": TK,
  "description": International Tourist Tax(JAPAN),
  "taxAmount": 4000,
  "passengerWiseTaxes": null,
} satisfies NEXUZR003FlightsTaxBreakDown

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR003FlightsTaxBreakDown
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


