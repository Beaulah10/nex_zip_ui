
# NEXUZR003FlightsPassengerWiseFare

Fare amount for a specific passenger type.

## Properties

Name | Type
------------ | -------------
`passengerType` | string
`count` | number
`amount` | number

## Example

```typescript
import type { NEXUZR003FlightsPassengerWiseFare } from ''

// TODO: Update the object below with actual values
const example = {
  "passengerType": null,
  "count": 2,
  "amount": 46924,
} satisfies NEXUZR003FlightsPassengerWiseFare

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR003FlightsPassengerWiseFare
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


