# SeatMapApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**retrieveSeatMap**](SeatMapApi.md#retrieveseatmap) | **POST** /offers/seatMap | Search seat availability for requested cabin |



## retrieveSeatMap

> NEXUZR004OffersFlightSeatMapResponse retrieveSeatMap(nEXUZR004OffersSeatMapRequest)

Search seat availability for requested cabin

Provides the seat map details, including real-time seat availability, for a specified flight and cabin requested by the passenger.

### Example

```ts
import {
  Configuration,
  SeatMapApi,
} from '';
import type { RetrieveSeatMapRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SeatMapApi();

  const body = {
    // NEXUZR004OffersSeatMapRequest
    nEXUZR004OffersSeatMapRequest: ...,
  } satisfies RetrieveSeatMapRequest;

  try {
    const data = await api.retrieveSeatMap(body);
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
| **nEXUZR004OffersSeatMapRequest** | [NEXUZR004OffersSeatMapRequest](NEXUZR004OffersSeatMapRequest.md) |  | |

### Return type

[**NEXUZR004OffersFlightSeatMapResponse**](NEXUZR004OffersFlightSeatMapResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | SeatMap response received successfully. |  -  |
| **400** | Bad Request – input validation failed. |  -  |
| **404** | No valid data found |  -  |
| **422** | Unprocessable Entity. |  -  |
| **500** | Internal Server Error. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

