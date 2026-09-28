# PaymentApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**paymentInitializePost**](PaymentApi.md#paymentinitializepost) | **POST** /payment/initialize | Initiate payment session |



## paymentInitializePost

> NEXUZR006PaymentInitializePaymentResponse paymentInitializePost(currency, language, nEXUZR006PaymentInitializePaymentRequest)

Initiate payment session

This endpoint is responsible for generating the Payment Reference ID, creating the POP Order ID, and obtaining the payment redirection URL from POP.

### Example

```ts
import {
  Configuration,
  PaymentApi,
} from '';
import type { PaymentInitializePostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new PaymentApi();

  const body = {
    // string | Represents the reservation currency.
    currency: JPY,
    // string | Represents the reservation language.
    language: en,
    // NEXUZR006PaymentInitializePaymentRequest
    nEXUZR006PaymentInitializePaymentRequest: ...,
  } satisfies PaymentInitializePostRequest;

  try {
    const data = await api.paymentInitializePost(body);
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
| **currency** | `string` | Represents the reservation currency. | [Defaults to `undefined`] |
| **language** | `string` | Represents the reservation language. | [Defaults to `undefined`] |
| **nEXUZR006PaymentInitializePaymentRequest** | [NEXUZR006PaymentInitializePaymentRequest](NEXUZR006PaymentInitializePaymentRequest.md) |  | |

### Return type

[**NEXUZR006PaymentInitializePaymentResponse**](NEXUZR006PaymentInitializePaymentResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Payment session initiated successfully. |  -  |
| **400** | Bad Request - Required input is missing. |  -  |
| **422** | Unprocessable Entity - downstream service processing failure. |  -  |
| **500** | Internal Server Error - downstream invocation/connection/execution failure. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

