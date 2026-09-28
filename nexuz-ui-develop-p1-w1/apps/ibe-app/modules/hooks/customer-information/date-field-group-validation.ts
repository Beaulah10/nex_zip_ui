import { useCallback, useEffect, useRef } from "react";
import type { FieldPath, FieldValues, UseFormTrigger } from "react-hook-form";

/**
 * Triggers validation only after focus leaves the complete grouped field.
 *
 * When focus moves between fields within the same group, the scheduled
 * validation is cancelled by the next focus event.
 */
export const useFieldGroupValidation = <TFieldValues extends FieldValues>(
	fieldName: FieldPath<TFieldValues>,
	trigger: UseFormTrigger<TFieldValues>
) => {
	const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleFocusCapture = useCallback(() => {
		// Focus moved to another field in the same group.
		if (blurTimerRef.current) {
			clearTimeout(blurTimerRef.current);
			blurTimerRef.current = null;
		}
	}, []);

	const handleBlurCapture = useCallback(() => {
		// Cancel any previously scheduled validation.
		if (blurTimerRef.current) {
			clearTimeout(blurTimerRef.current);
		}

		// Wait to see whether another field in the same group receives focus
		blurTimerRef.current = setTimeout(() => {
			void trigger(fieldName);
			blurTimerRef.current = null;
		}, 0);
	}, [fieldName, trigger]);

	useEffect(() => {
		return () => {
			if (blurTimerRef.current) {
				clearTimeout(blurTimerRef.current);
			}
		};
	}, []);

	return {
		onFocusCapture: handleFocusCapture,
		onBlurCapture: handleBlurCapture,
	};
};
