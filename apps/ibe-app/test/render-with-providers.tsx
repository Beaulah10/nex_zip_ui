import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, type RenderResult, render } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { Provider } from "react-redux";
import passengerReducer from "@/store/slices/passenger/passenger.slice";

export const createTestStore = () =>
	configureStore({
		reducer: {
			passenger: passengerReducer,
		},
	});

type ExtendedRenderOptions = Omit<RenderOptions, "wrapper"> & {
	store?: ReturnType<typeof createTestStore>;
	queryClient?: QueryClient;
};

type RenderWithProvidersResult = RenderResult & {
	store: ReturnType<typeof createTestStore>;
	queryClient: QueryClient;
};

export const renderWithProviders = (
	ui: ReactElement,
	{
		store = createTestStore(),
		queryClient = new QueryClient(),
		...renderOptions
	}: ExtendedRenderOptions = {}
): RenderWithProvidersResult => {
	const Wrapper = ({ children }: PropsWithChildren) => (
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</Provider>
	);

	return {
		store,
		queryClient,
		...render(ui, { wrapper: Wrapper, ...renderOptions }),
	};
};
