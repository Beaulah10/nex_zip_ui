
# NEXUZR007OrderManagementPnrData


## Properties

Name | Type
------------ | -------------
`airlineInfo` | [NEXUZR007OrderManagementAirlineInfo](NEXUZR007OrderManagementAirlineInfo.md)
`passenger` | [NEXUZR007OrderManagementPassenger](NEXUZR007OrderManagementPassenger.md)
`ticket` | [NEXUZR007OrderManagementTicket](NEXUZR007OrderManagementTicket.md)
`issuer` | [NEXUZR007OrderManagementIssuer](NEXUZR007OrderManagementIssuer.md)
`flight` | [Array&lt;NEXUZR007OrderManagementFlight&gt;](NEXUZR007OrderManagementFlight.md)
`invoiceNumber` | string
`agent` | [NEXUZR007OrderManagementAgent](NEXUZR007OrderManagementAgent.md)
`capture` | [NEXUZR007OrderManagementCapture](NEXUZR007OrderManagementCapture.md)

## Example

```typescript
import type { NEXUZR007OrderManagementPnrData } from ''

// TODO: Update the object below with actual values
const example = {
  "airlineInfo": null,
  "passenger": null,
  "ticket": null,
  "issuer": null,
  "flight": null,
  "invoiceNumber": ,
  "agent": null,
  "capture": null,
} satisfies NEXUZR007OrderManagementPnrData

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR007OrderManagementPnrData
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


