
# NEXUZR007OrderManagementTicket


## Properties

Name | Type
------------ | -------------
`code` | string
`adultCount` | number
`childCount` | number
`restricted` | number
`issueDate` | [NEXUZR007OrderManagementDateParts](NEXUZR007OrderManagementDateParts.md)

## Example

```typescript
import type { NEXUZR007OrderManagementTicket } from ''

// TODO: Update the object below with actual values
const example = {
  "code": 2X7IVO,
  "adultCount": 1,
  "childCount": 3,
  "restricted": 0,
  "issueDate": null,
} satisfies NEXUZR007OrderManagementTicket

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR007OrderManagementTicket
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


