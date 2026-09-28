# CoreApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**authTokenPost**](CoreApi.md#authtokenpost) | **POST** /auth/token | Retrieve security token |



## authTokenPost

> NEXUZR001CoreToken authTokenPost()

Retrieve security token

Generates and returns a security token.

### Example

```ts
import {
  Configuration,
  CoreApi,
} from '';
import type { AuthTokenPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new CoreApi();

  try {
    const data = await api.authTokenPost();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**NEXUZR001CoreToken**](NEXUZR001CoreToken.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successfully retrieved security token |  -  |
| **422** | Unprocessable Entity |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

