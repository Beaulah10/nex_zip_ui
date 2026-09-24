# AncillariesApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**offersAncillariesPost**](AncillariesApi.md#offersancillariespost) | **POST** /offers/ancillaries | Retrieve ancillaries |



## offersAncillariesPost

> NEXUZR004OffersAncillaryResponse offersAncillariesPost(currency, nEXUZR004OffersAncillaryRequest)

Retrieve ancillaries

Retrieves ancillary services for a given flight based on service category and passenger details. 

### Example

```ts
import {
  Configuration,
  AncillariesApi,
} from '';
import type { OffersAncillariesPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AncillariesApi();

  const body = {
    // string | Currency code for retrieving ancillaries amount.
    currency: JPY,
    // NEXUZR004OffersAncillaryRequest | Request payload containing flight details, service category and number of passengers.
    nEXUZR004OffersAncillaryRequest: ...,
  } satisfies OffersAncillariesPostRequest;

  try {
    const data = await api.offersAncillariesPost(body);
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
| **currency** | `string` | Currency code for retrieving ancillaries amount. | [Defaults to `undefined`] |
| **nEXUZR004OffersAncillaryRequest** | [NEXUZR004OffersAncillaryRequest](NEXUZR004OffersAncillaryRequest.md) | Request payload containing flight details, service category and number of passengers. | |

### Return type

[**NEXUZR004OffersAncillaryResponse**](NEXUZR004OffersAncillaryResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Ancillaries retrieved Successfully |  -  |
| **400** | Bad Request - Required Input is Missing |  -  |
| **404** | Not found - No valid data / No valid ancillaries |  -  |
| **422** | Unprocessable Content |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

