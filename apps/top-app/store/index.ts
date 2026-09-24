import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
	createTransform,
	FLUSH,
	PAUSE,
	PERSIST,
	PURGE,
	persistReducer,
	persistStore,
	REGISTER,
	REHYDRATE,
} from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import calendarFaresReducer from "@/store/slices/calendar-fares/calendar-fares.slice";
import flightSearchFormReducer from "@/store/slices/flight-search-form/flight-search-form.slice";

const FLIGHT_SEARCH_DRAFT_TTL_MS = 60 * 60 * 1000;
const FLIGHT_SEARCH_DRAFT_SCHEMA_VERSION = 1;

const createNoopStorage = () => {
	return {
		getItem(_key: string) {
			return Promise.resolve(null);
		},
		setItem(_key: string, value: string) {
			return Promise.resolve(value);
		},
		removeItem(_key: string) {
			return Promise.resolve();
		},
	};
};

const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

type PersistedFlightSearchFormState = {
	data: RootReducerState["flightSearchForm"]["data"];
	hasSubmittedSearch?: RootReducerState["flightSearchForm"]["hasSubmittedSearch"];
	_persistedAt?: number;
	_expiresAt?: number;
	_schemaVersion?: number;
};

const draftExpiryTransform = createTransform<
	PersistedFlightSearchFormState,
	PersistedFlightSearchFormState,
	RootReducerState
>(
	(inboundState: PersistedFlightSearchFormState | undefined): PersistedFlightSearchFormState => {
		if (!inboundState?.hasSubmittedSearch || !inboundState.data) {
			return { data: null };
		}

		const now = Date.now();
		return {
			...inboundState,
			_persistedAt: now,
			_expiresAt: now + FLIGHT_SEARCH_DRAFT_TTL_MS,
			_schemaVersion: FLIGHT_SEARCH_DRAFT_SCHEMA_VERSION,
		};
	},
	(outboundState: PersistedFlightSearchFormState | undefined): PersistedFlightSearchFormState => {
		if (!outboundState || typeof outboundState !== "object") {
			return { data: null };
		}

		if (outboundState._schemaVersion !== FLIGHT_SEARCH_DRAFT_SCHEMA_VERSION) {
			return { data: null };
		}

		if (typeof outboundState._expiresAt !== "number" || Date.now() >= outboundState._expiresAt) {
			return { data: null };
		}

		return {
			data: outboundState.data ?? null,
			hasSubmittedSearch: Boolean(outboundState.data),
		};
	},
	{ whitelist: ["flightSearchForm"] }
);

const rootReducer = combineReducers({
	flightSearchForm: flightSearchFormReducer,
	calendarFares: calendarFaresReducer,
});

type RootReducerState = ReturnType<typeof rootReducer>;

const persistedReducer = persistReducer(
	{
		key: "top-app-store",
		storage,
		version: FLIGHT_SEARCH_DRAFT_SCHEMA_VERSION,
		whitelist: ["flightSearchForm"],
		transforms: [draftExpiryTransform],
	},
	rootReducer
);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
