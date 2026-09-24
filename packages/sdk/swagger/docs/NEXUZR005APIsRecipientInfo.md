
# NEXUZR005APIsRecipientInfo


## Properties

Name | Type
------------ | -------------
`firstName` | string
`lastName` | string
`middleName` | string
`emailAddress` | string

## Example

```typescript
import type { NEXUZR005APIsRecipientInfo } from ''

// TODO: Update the object below with actual values
const example = {
  "firstName": TEST,
  "lastName": TEST,
  "middleName": TEST,
  "emailAddress": abc@gmail.com,
} satisfies NEXUZR005APIsRecipientInfo

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR005APIsRecipientInfo
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


