/**
 * File: store/hooks.ts
 * Description: Typed Redux hooks for the IBE application.
 * These hooks provide type-safe access to the Redux store's
 * dispatch function and state selector.
 */

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./index";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
