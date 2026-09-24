# OffersApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**retrieveOfferBundles**](OffersApi.md#retrieveofferbundles) | **POST** /offers/bundles | Retrieve bundles available for specified flight details |



## retrieveOfferBundles

> NEXUZR004OffersBundleResponse retrieveOfferBundles(currency, nEXUZR004OffersBundleRequest)

Retrieve bundles available for specified flight details

Returns available service bundles (e.g., meals+baggage, etc.) for given flight segments and passenger composition.

### Example

```ts
import {
  Configuration,
  OffersApi,
} from '';
import type { RetrieveOfferBundlesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new OffersApi();

  const body = {
    // string
    currency: JPY,
    // NEXUZR004OffersBundleRequest | Request payload containing route, passenger, and flight details.
    nEXUZR004OffersBundleRequest: ...,
  } satisfies RetrieveOfferBundlesRequest;

  try {
    const data = await api.retrieveOfferBundles(body);
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
| **currency** | `string` |  | [Defaults to `undefined`] |
| **nEXUZR004OffersBundleRequest** | [NEXUZR004OffersBundleRequest](NEXUZR004OffersBundleRequest.md) | Request payload containing route, passenger, and flight details. | |

### Return type

[**NEXUZR004OffersBundleResponse**](NEXUZR004OffersBundleResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Bundle retrieval successful |  -  |
| **400** | Bad Request - Required Input is Missing |  -  |
| **404** | Not found - Required Input is Missing |  -  |
| **422** | Unprocessable Entity - Request cannot be processed due to business validation issues. |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

