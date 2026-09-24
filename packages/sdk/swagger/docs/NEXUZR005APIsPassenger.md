
# NEXUZR005APIsPassenger


## Properties

Name | Type
------------ | -------------
`id` | number
`passengerType` | string
`firstName` | string
`middleName` | string
`lastName` | string
`gender` | string
`dateOfBirth` | string
`nationality` | string
`residenceCountry` | string
`destinationAddress` | [NEXUZR005APIsDestinationAddress](NEXUZR005APIsDestinationAddress.md)
`documents` | [Array&lt;NEXUZR005APIsDocument&gt;](NEXUZR005APIsDocument.md)

## Example

```typescript
import type { NEXUZR005APIsPassenger } from ''

// TODO: Update the object below with actual values
const example = {
  "id": 1,
  "passengerType": Adult,
  "firstName": PETER,
  "middleName": JOHN,
  "lastName": JAMES,
  "gender": M,
  "dateOfBirth": 2000-07-11,
  "nationality": JPN,
  "residenceCountry": JPN,
  "destinationAddress": null,
  "documents": null,
} satisfies NEXUZR005APIsPassenger

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR005APIsPassenger
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


