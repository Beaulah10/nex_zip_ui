/**
 * File: store/index.ts
 * Description: Configures the Redux store and enables state persistence using Redux Persist.
 * Persists selected application slices in browser storage and restores them after refresh.
 */

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
	FLUSH,
	PAUSE,
	PERSIST,
	PURGE,
	persistReducer,
	persistStore,
	REGISTER,
	REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import bundleOffersReducer from "@/store/slices/bundle-offers/bundle-offers.slice";
import calendarFaresReducer from "@/store/slices/calendar-fares/calendar-fares.slice";
import ancillaryOffersReducer from "@/store/slices/common/ancillary-offers/ancillary-offers";
import confirmationDisabledFlagsReducer from "@/store/slices/confirmation/confirmation-disabled-flags.slice";
import customerInformationReducer from "@/store/slices/customer-information/customer-information.slice";
import flightSelectionReducer from "@/store/slices/flight-selection/flight-selection.slice";
import orderCreateReducer from "@/store/slices/order-create/order-create.slice";
import orderPrepareReducer from "@/store/slices/order-prepare/order-prepare.slice";
import passengerReducer from "@/store/slices/passenger/passenger.slice";
import paymentStatusReducer from "@/store/slices/payment-status/payment-status.slice";
import seatMapReducer from "@/store/slices/seat-map/seat-map.slice";

const bundleOffersPersistConfig = {
	key: "bundleOffers",
	storage,
	whitelist: ["selectedBundlesBySegment"],
};

const persistedBundleOffersReducer = persistReducer(bundleOffersPersistConfig, bundleOffersReducer);

const seatMapPersistConfig = {
	key: "seatMap",
	storage,
	whitelist: ["outOfStockByScope", "request"],
};

const persistedSeatMapReducer = persistReducer(seatMapPersistConfig, seatMapReducer);

/**
 * Combines all feature reducers into a single root reducer.
 */
const rootReducer = combineReducers({
	flightSelection: flightSelectionReducer,
	calendarFares: calendarFaresReducer,
	ancillaryOffers: ancillaryOffersReducer,
	bundleOffers: persistedBundleOffersReducer,
	orderCreate: orderCreateReducer,
	orderPrepare: orderPrepareReducer,
	passenger: passengerReducer,
	customerInformation: customerInformationReducer,
	paymentStatus: paymentStatusReducer,
	seatMap: persistedSeatMapReducer,
	confirmationDisabledFlags: confirmationDisabledFlagsReducer,
});

/**
 * Configures Redux Persist and defines which slices are stored in browser storage.
 */
const persistConfig = {
	key: "root",
	storage,
	whitelist: [
		"searchRoutes",
		"flightSelection",
		"passenger",
		"customerInformation",
		"ancillaryOffers",
		"paymentStatus",
		"orderPrepare",
		"confirmationDisabledFlags",
	],
};

/**
 * Creates a persisted reducer that rehydrates stored state on application load.
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Creates and configures the Redux store with persistence support.
 */

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

/**
 * Controls the persistence lifecycle and restores persisted Redux state.
 */
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
