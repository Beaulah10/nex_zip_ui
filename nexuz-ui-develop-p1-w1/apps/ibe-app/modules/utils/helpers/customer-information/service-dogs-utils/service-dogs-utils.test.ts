/**
 * File: service-dogs-utils.test.ts
 * Description: Unit tests for service-dogs-utils helpers.
 */

import type { ChangeEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import {
	CAGE_DIMENSION_FIELDS,
	CAGE_DIMENSION_STATIC_PROPS,
	getCageDimensionHandlers,
} from "./service-dogs-utils";

describe("service-dogs-utils", () => {
	it("should expose correct cage dimension fields", () => {
		expect(CAGE_DIMENSION_FIELDS).toEqual([
			"serviceDogCageHeight",
			"serviceDogCageWidth",
			"serviceDogCageDepth",
		]);
	});

	it("should expose correct static props", () => {
		expect(CAGE_DIMENSION_STATIC_PROPS).toEqual({
			required: true,
			unit: "cm",
			min: 1,
			defaultValue: 0,
			placeholder: "0",
		});
	});

	it("should call triggerCageDimensions on blur", () => {
		const triggerCageDimensions = vi.fn();

		const handlers = getCageDimensionHandlers({
			fieldName: "serviceDogCageHeight",
			fieldReg: {
				onChange: vi.fn(),
			},
			setValue: vi.fn(),
			trigger: vi.fn(),
			errors: {},
			isSizeErrorActive: vi.fn().mockReturnValue(false),
			triggerCageDimensions,
		});

		handlers.onBlur();

		expect(triggerCageDimensions).toHaveBeenCalledTimes(1);
		expect(triggerCageDimensions).toHaveBeenCalledWith("serviceDogCageHeight");
	});

	it("should trigger all cage dimension fields when size error is active", () => {
		const fieldRegOnChange = vi.fn();
		const setValue = vi.fn();
		const trigger = vi.fn();
		const isSizeErrorActive = vi.fn().mockReturnValue(true);

		const handlers = getCageDimensionHandlers({
			fieldName: "serviceDogCageWidth",
			fieldReg: {
				onChange: fieldRegOnChange,
			},
			setValue,
			trigger,
			errors: {},
			isSizeErrorActive,
			triggerCageDimensions: vi.fn(),
		});

		const event = {
			target: {
				value: "100",
			},
		} as ChangeEvent<HTMLInputElement>;

		handlers.onChange(event);

		expect(fieldRegOnChange).toHaveBeenCalledWith(event);

		expect(setValue).toHaveBeenCalledWith("serviceDogCageWidth", "100", {
			shouldValidate: false,
		});

		expect(trigger).toHaveBeenCalledWith(CAGE_DIMENSION_FIELDS);
	});

	it("should trigger only current field when field has error and size error is inactive", () => {
		const trigger = vi.fn();

		const handlers = getCageDimensionHandlers({
			fieldName: "serviceDogCageDepth",
			fieldReg: {
				onChange: vi.fn(),
			},
			setValue: vi.fn(),
			trigger,
			errors: {
				serviceDogCageDepth: {
					type: "required",
				},
			},
			isSizeErrorActive: vi.fn().mockReturnValue(false),
			triggerCageDimensions: vi.fn(),
		});

		const event = {
			target: {
				value: "50",
			},
		} as ChangeEvent<HTMLInputElement>;

		handlers.onChange(event);

		expect(trigger).toHaveBeenCalledWith("serviceDogCageDepth");
	});

	it("should not trigger validation when no size error and no field error exist", () => {
		const trigger = vi.fn();

		const handlers = getCageDimensionHandlers({
			fieldName: "serviceDogCageHeight",
			fieldReg: {
				onChange: vi.fn(),
			},
			setValue: vi.fn(),
			trigger,
			errors: {},
			isSizeErrorActive: vi.fn().mockReturnValue(false),
			triggerCageDimensions: vi.fn(),
		});

		const event = {
			target: {
				value: "25",
			},
		} as ChangeEvent<HTMLInputElement>;

		handlers.onChange(event);

		expect(trigger).not.toHaveBeenCalled();
	});
});
