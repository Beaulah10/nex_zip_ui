
# NEXUZR006PaymentContactInfo


## Properties

Name | Type
------------ | -------------
`contactID` | number
`personOrgID` | number
`contactField` | string
`contactType` | string

## Example

```typescript
import type { NEXUZR006PaymentContactInfo } from ''

// TODO: Update the object below with actual values
const example = {
  "contactID": 1,
  "personOrgID": 123,
  "contactField": +81078625673,
  "contactType": Workphone,
} satisfies NEXUZR006PaymentContactInfo

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR006PaymentContactInfo
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


