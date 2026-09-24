# SummaryPNRApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**summaryPNR**](SummaryPNRApi.md#summarypnr) | **POST** /orders/prepare | Summary PNR |



## summaryPNR

> NEXUZR005APIsSummaryResponse summaryPNR(currency, language, nEXUZR005APIsSummaryRequest)

Summary PNR

Prepares a summary PNR by validating inputs, retrieving fare quotes, processing ancillary services, bundles and seat selections, and generating an encrypted Arkose token. 

### Example

```ts
import {
  Configuration,
  SummaryPNRApi,
} from '';
import type { SummaryPNRRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SummaryPNRApi();

  const body = {
    // string | currency code.
    currency: JPY,
    // string | language code.
    language: en,
    // NEXUZR005APIsSummaryRequest | Summary PNR preparation request containing flight and passenger details.
    nEXUZR005APIsSummaryRequest: ...,
  } satisfies SummaryPNRRequest;

  try {
    const data = await api.summaryPNR(body);
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
| **currency** | `string` | currency code. | [Defaults to `undefined`] |
| **language** | `string` | language code. | [Defaults to `undefined`] |
| **nEXUZR005APIsSummaryRequest** | [NEXUZR005APIsSummaryRequest](NEXUZR005APIsSummaryRequest.md) | Summary PNR preparation request containing flight and passenger details. | |

### Return type

[**NEXUZR005APIsSummaryResponse**](NEXUZR005APIsSummaryResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Summary PNR prepared successfully. Returns encrypted Arkose token for fraud detection. |  -  |
| **400** | Input parameter validation failed. |  -  |
| **422** | Retrieve FareQuote Failed. |  -  |
| **500** | Downstream service call failure. Indicates system error during token generation, fare quote retrieval, or other critical operations. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

