# RetrievePNRApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**retrievePnrInfo**](RetrievePNRApi.md#retrievepnrinfo) | **POST** /orders/info | Retrieve PNR information for specified confirmation number. |



## retrievePnrInfo

> NEXUZR007OrderManagementPnrInfoResponse retrievePnrInfo(nEXUZR007OrderManagementPnrInfoRequest)

Retrieve PNR information for specified confirmation number.

Returns flight, passenger, ticket and related information for the specified PNR.

### Example

```ts
import {
  Configuration,
  RetrievePNRApi,
} from '';
import type { RetrievePnrInfoRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new RetrievePNRApi();

  const body = {
    // NEXUZR007OrderManagementPnrInfoRequest | Request body containing the confirmationNumber detail.
    nEXUZR007OrderManagementPnrInfoRequest: ...,
  } satisfies RetrievePnrInfoRequest;

  try {
    const data = await api.retrievePnrInfo(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **nEXUZR007OrderManagementPnrInfoRequest** | [NEXUZR007OrderManagementPnrInfoRequest](NEXUZR007OrderManagementPnrInfoRequest.md) | Request body containing the confirmationNumber detail. | |

### Return type

[**NEXUZR007OrderManagementPnrInfoResponse**](NEXUZR007OrderManagementPnrInfoResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful response with PNR information. |  -  |
| **400** | Bad request - Required Input is Missing |  -  |
| **404** | No valid data found. |  -  |
| **422** | Unprocessable Entity - Request cannot be processed due to business validation issues. |  -  |
| **500** | Internal or System Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

