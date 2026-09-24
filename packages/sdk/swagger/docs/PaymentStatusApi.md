# PaymentStatusApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**retrievePaymentStatus**](PaymentStatusApi.md#retrievepaymentstatus) | **POST** /payment/{statusCheckKey}/status | Retrieve payment status |



## retrievePaymentStatus

> NEXUZR006PaymentPaymentStatusResponse retrievePaymentStatus(statusCheckKey, currency, language, nEXUZR006PaymentPaymentStatusRequest)

Retrieve payment status

This endpoint is responsible for retrieving the payment status from POP and updating other systems based on the status, and returning a consolidated status to the UI. 

### Example

```ts
import {
  Configuration,
  PaymentStatusApi,
} from '';
import type { RetrievePaymentStatusRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new PaymentStatusApi();

  const body = {
    // string | Represents order identifier to look up the payment order in POP.
    statusCheckKey: statusCheckKey_example,
    // string | Represents reservation currency.
    currency: JPY,
    // string | Represents reservation language.
    language: ja,
    // NEXUZR006PaymentPaymentStatusRequest
    nEXUZR006PaymentPaymentStatusRequest: ...,
  } satisfies RetrievePaymentStatusRequest;

  try {
    const data = await api.retrievePaymentStatus(body);
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
| **statusCheckKey** | `string` | Represents order identifier to look up the payment order in POP. | [Defaults to `undefined`] |
| **currency** | `string` | Represents reservation currency. | [Defaults to `undefined`] |
| **language** | `string` | Represents reservation language. | [Defaults to `undefined`] |
| **nEXUZR006PaymentPaymentStatusRequest** | [NEXUZR006PaymentPaymentStatusRequest](NEXUZR006PaymentPaymentStatusRequest.md) |  | |

### Return type

[**NEXUZR006PaymentPaymentStatusResponse**](NEXUZR006PaymentPaymentStatusResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Consolidated response returned to UI. |  -  |
| **400** | Bad Request |  -  |
| **422** | Unprocessable Content |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

