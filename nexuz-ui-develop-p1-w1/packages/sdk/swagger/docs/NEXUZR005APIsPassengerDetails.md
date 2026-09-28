
# NEXUZR005APIsPassengerDetails


## Properties

Name | Type
------------ | -------------
`id` | number
`passengerType` | string
`associateWithPassengerId` | number
`firstName` | string
`middleName` | string
`lastName` | string
`dateOfBirth` | string
`gender` | string
`redressNumber` | string
`knownTravelerNumber` | string
`nationality` | string
`isPrimaryPassenger` | boolean
`height` | number
`weight` | number
`contactInformation` | [NEXUZR005APIsContactInformation](NEXUZR005APIsContactInformation.md)
`emergencyContact` | [NEXUZR005APIsEmergencyContact](NEXUZR005APIsEmergencyContact.md)
`marketingMails` | boolean
`seats` | [Array&lt;NEXUZR005APIsSeat&gt;](NEXUZR005APIsSeat.md)
`services` | [Array&lt;NEXUZR005APIsService&gt;](NEXUZR005APIsService.md)
`bundles` | [Array&lt;NEXUZR005APIsBundle&gt;](NEXUZR005APIsBundle.md)

## Example

```typescript
import type { NEXUZR005APIsPassengerDetails } from ''

// TODO: Update the object below with actual values
const example = {
  "id": 2,
  "passengerType": Adult,
  "associateWithPassengerId": 1,
  "firstName": PETER,
  "middleName": DRAKE,
  "lastName": PARKER,
  "dateOfBirth": 2000-07-20,
  "gender": M,
  "redressNumber": RED12345,
  "knownTravelerNumber": KTN12345,
  "nationality": JPN,
  "isPrimaryPassenger": true,
  "height": 170,
  "weight": 70,
  "contactInformation": null,
  "emergencyContact": null,
  "marketingMails": true,
  "seats": null,
  "services": null,
  "bundles": null,
} satisfies NEXUZR005APIsPassengerDetails

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR005APIsPassengerDetails
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


