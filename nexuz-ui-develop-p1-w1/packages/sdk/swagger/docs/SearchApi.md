# SearchApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**searchCalendarFaresGet**](SearchApi.md#searchcalendarfaresget) | **GET** /search/calendar-fares | Retrieve calendar fare date range |
| [**searchFlights**](SearchApi.md#searchflights) | **GET** /search/flights | Search available flights and retrieve fare quotes |
| [**searchRoutesGet**](SearchApi.md#searchroutesget) | **GET** /search/routes | Retrieve airport route |



## searchCalendarFaresGet

> NEXUZR002SearchCalendarFaresResponse searchCalendarFaresGet(routes, departureDateFrom, language, currency, promotionCode, departureDateTo)

Retrieve calendar fare date range

Retrieves the lowest fare details for each date and cabin within a specified calendar date range.

### Example

```ts
import {
  Configuration,
  SearchApi,
} from '';
import type { SearchCalendarFaresGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SearchApi();

  const body = {
    // string | Comma-separated airport codes representing the route. - One-way / Round-trip: `\"NRT,BKK\"` (origin,destination) - Connecting: `\"BKK,NRT,SIN\"` (origin,stopover,destination) 
    routes: NRT,BKK,
    // string | Outbound departure date in `yyyy-MM-dd` format
    departureDateFrom: 2026-06-01,
    // string | Language code
    language: en,
    // string | Currency code
    currency: JPY,
    // string | Promotional code (optional)
    promotionCode: ABC123,
    // string | Inbound date in `yyyy-MM-dd` format for round-trips  (optional)
    departureDateTo: 2026-06-02,
  } satisfies SearchCalendarFaresGetRequest;

  try {
    const data = await api.searchCalendarFaresGet(body);
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
| **routes** | `string` | Comma-separated airport codes representing the route. - One-way / Round-trip: &#x60;\&quot;NRT,BKK\&quot;&#x60; (origin,destination) - Connecting: &#x60;\&quot;BKK,NRT,SIN\&quot;&#x60; (origin,stopover,destination)  | [Defaults to `undefined`] |
| **departureDateFrom** | `string` | Outbound departure date in &#x60;yyyy-MM-dd&#x60; format | [Defaults to `undefined`] |
| **language** | `string` | Language code | [Defaults to `undefined`] |
| **currency** | `string` | Currency code | [Defaults to `undefined`] |
| **promotionCode** | `string` | Promotional code | [Optional] [Defaults to `undefined`] |
| **departureDateTo** | `string` | Inbound date in &#x60;yyyy-MM-dd&#x60; format for round-trips  | [Optional] [Defaults to `undefined`] |

### Return type

[**NEXUZR002SearchCalendarFaresResponse**](NEXUZR002SearchCalendarFaresResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful response |  -  |
| **400** | Bad Request |  -  |
| **404** | Not found |  -  |
| **422** | Unprocessable Entity |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## searchFlights

> NEXUZR003FlightsFlightSearchResponse searchFlights(routes, departureDateFrom, adult, language, currency, departureDateTo, childA, childB, childC, infant, promotionCode)

Search available flights and retrieve fare quotes

Retrieves available flights and fare quotes.

### Example

```ts
import {
  Configuration,
  SearchApi,
} from '';
import type { SearchFlightsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SearchApi();

  const body = {
    // string | Comma-separated airport codes representing the route.
    routes: NRT,BKK,
    // string | Outbound departure date in `yyyy-MM-dd` format.
    departureDateFrom: 2026-10-05,
    // string | Number of adult passengers.
    adult: 2,
    // string | Language code for response content.
    language: ja,
    // string | Currency code for fare amounts.
    currency: JPY,
    // string | Return departure date in `yyyy-MM-dd` format for round-trips. (optional)
    departureDateTo: 2026-10-14,
    // string | Number of Child A passengers. (optional)
    childA: 1,
    // string | Number of Child B passengers. (optional)
    childB: 1,
    // string | Number of Child C passengers. (optional)
    childC: 1,
    // string | Number of infant passengers. (optional)
    infant: 1,
    // string | Promotional code to apply discounts. (optional)
    promotionCode: PROMO2026,
  } satisfies SearchFlightsRequest;

  try {
    const data = await api.searchFlights(body);
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
| **routes** | `string` | Comma-separated airport codes representing the route. | [Defaults to `undefined`] |
| **departureDateFrom** | `string` | Outbound departure date in &#x60;yyyy-MM-dd&#x60; format. | [Defaults to `undefined`] |
| **adult** | `string` | Number of adult passengers. | [Defaults to `undefined`] |
| **language** | `string` | Language code for response content. | [Defaults to `undefined`] |
| **currency** | `string` | Currency code for fare amounts. | [Defaults to `undefined`] |
| **departureDateTo** | `string` | Return departure date in &#x60;yyyy-MM-dd&#x60; format for round-trips. | [Optional] [Defaults to `undefined`] |
| **childA** | `string` | Number of Child A passengers. | [Optional] [Defaults to `undefined`] |
| **childB** | `string` | Number of Child B passengers. | [Optional] [Defaults to `undefined`] |
| **childC** | `string` | Number of Child C passengers. | [Optional] [Defaults to `undefined`] |
| **infant** | `string` | Number of infant passengers. | [Optional] [Defaults to `undefined`] |
| **promotionCode** | `string` | Promotional code to apply discounts. | [Optional] [Defaults to `undefined`] |

### Return type

[**NEXUZR003FlightsFlightSearchResponse**](NEXUZR003FlightsFlightSearchResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Flights retrieved successfully. |  -  |
| **400** | Bad Request – input validation failed. |  -  |
| **404** | Not Found |  -  |
| **422** | Unprocessable Entity – error occurred during fare quote retrieval. |  -  |
| **500** | Internal Server Error. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## searchRoutesGet

> NEXUZR002SearchAirportRouteResponse searchRoutesGet(language)

Retrieve airport route

To retrieve travel routes from the Radixx System and return valid origin and destination airport codes as the response.

### Example

```ts
import {
  Configuration,
  SearchApi,
} from '';
import type { SearchRoutesGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SearchApi();

  const body = {
    // string | language code is required.
    language: en,
  } satisfies SearchRoutesGetRequest;

  try {
    const data = await api.searchRoutesGet(body);
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
| **language** | `string` | language code is required. | [Defaults to `undefined`] |

### Return type

[**NEXUZR002SearchAirportRouteResponse**](NEXUZR002SearchAirportRouteResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful response |  -  |
| **400** | Bad Request |  -  |
| **422** | Unprocessable Entity |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

