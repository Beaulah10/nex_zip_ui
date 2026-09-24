/**
 * Typed Redux Hooks
 *
 * Provides type-safe hooks for dispatching actions and selecting state.
 * Used throughout the app to interact with Redux store.
 *
 * Usage:
 * - const dispatch = useAppDispatch();
 * - const state = useAppSelector((state) => state.searchRoutes);
 */

"use client";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
