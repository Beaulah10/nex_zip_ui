
# NEXUZR005APIsCreateOrderRequest


## Properties

Name | Type
------------ | -------------
`verifyToken` | string
`passengers` | [Array&lt;NEXUZR005APIsPassenger&gt;](NEXUZR005APIsPassenger.md)
`recipientInfo` | [NEXUZR005APIsRecipientInfo](NEXUZR005APIsRecipientInfo.md)

## Example

```typescript
import type { NEXUZR005APIsCreateOrderRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "verifyToken": qnh+bFiw+Lytmlce.+tHLil0Off7v7oAFCICjF/,
  "passengers": null,
  "recipientInfo": null,
} satisfies NEXUZR005APIsCreateOrderRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR005APIsCreateOrderRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


