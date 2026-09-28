# CreateOrderApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createOrder**](CreateOrderApi.md#createorder) | **POST** /orders | Create Order |



## createOrder

> NEXUZR005APIsCreateOrderResponse createOrder(currency, language, nEXUZR005APIsCreateOrderRequest)

Create Order

### Example

```ts
import {
  Configuration,
  CreateOrderApi,
} from '';
import type { CreateOrderRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new CreateOrderApi();

  const body = {
    // string | Represents the reservation currency.
    currency: JPY,
    // string | Represents the reservation language.
    language: en,
    // NEXUZR005APIsCreateOrderRequest | Request payload containing the arkose token, passengers, and recipient information.
    nEXUZR005APIsCreateOrderRequest: ...,
  } satisfies CreateOrderRequest;

  try {
    const data = await api.createOrder(body);
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
| **nEXUZR005APIsCreateOrderRequest** | [NEXUZR005APIsCreateOrderRequest](NEXUZR005APIsCreateOrderRequest.md) | Request payload containing the arkose token, passengers, and recipient information. | |

### Return type

[**NEXUZR005APIsCreateOrderResponse**](NEXUZR005APIsCreateOrderResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful order creation |  -  |
| **400** | Required Input is Missing or Invalid value |  -  |
| **422** | Unprocessable Entity - Request cannot be processed due to business validation issues. |  -  |
| **500** | Internal server error or system error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

