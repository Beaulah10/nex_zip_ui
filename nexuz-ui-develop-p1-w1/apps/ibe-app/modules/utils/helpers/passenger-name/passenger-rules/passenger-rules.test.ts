import { beforeEach, describe, expect, it, vi } from "vitest";
import { setFocusOnInvalidInput } from "@/modules/utils/helpers/common/field-focus/field-focus";
import {
	getAdultAssignmentMap,
	isValidateAdultAssignment,
	shouldHaveAccompanyingAdult,
} from "@/modules/utils/helpers/passenger-name/passenger-rules/passenger-rules";

describe("passenger-rules", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
		if (!HTMLElement.prototype.scrollIntoView) {
			HTMLElement.prototype.scrollIntoView = vi.fn();
		}
	});

	it("builds assignment map with infant, childC and total child counters", () => {
		const map = getAdultAssignmentMap([
			{
				id: "p1",
				passengerTypeCode: "infant",
				firstName: "A",
				lastName: "B",
				hasAccompanyingAdult: true,
				accompanyingAdult: "adult-1",
			},
			{
				id: "p2",
				passengerTypeCode: "childC",
				firstName: "C",
				lastName: "D",
				hasAccompanyingAdult: true,
				accompanyingAdult: "adult-1",
			},
			{
				id: "p3",
				passengerTypeCode: "childA",
				firstName: "E",
				lastName: "F",
				hasAccompanyingAdult: false,
				accompanyingAdult: "adult-2",
			},
			{
				id: "p4",
				passengerTypeCode: "adult",
				firstName: "G",
				lastName: "H",
				hasAccompanyingAdult: false,
			},
		]);

		expect(map).toEqual({
			"adult-1": { infant_Count: 1, CHILD_TOTAL: 1, childC_Count: 1 },
			"adult-2": { infant_Count: 0, CHILD_TOTAL: 1, childC_Count: 0 },
		});
	});

	it("enforces common infant limit across routes", () => {
		expect(
			isValidateAdultAssignment({
				adultId: "a1",
				passengerType: "infant",
				map: { a1: { infant_Count: 1, CHILD_TOTAL: 0, childC_Count: 0 } },
				isYvr: true,
			})
		).toBe(false);
	});

	it("enforces YVR capacity rules", () => {
		expect(
			isValidateAdultAssignment({
				adultId: "a1",
				passengerType: "infant",
				map: { a1: { infant_Count: 0, CHILD_TOTAL: 2, childC_Count: 0 } },
				isYvr: true,
			})
		).toBe(false);

		expect(
			isValidateAdultAssignment({
				adultId: "a1",
				passengerType: "childA",
				map: { a1: { infant_Count: 1, CHILD_TOTAL: 1, childC_Count: 0 } },
				isYvr: true,
			})
		).toBe(false);

		expect(
			isValidateAdultAssignment({
				adultId: "a1",
				passengerType: "childB",
				map: { a1: { infant_Count: 0, CHILD_TOTAL: 2, childC_Count: 0 } },
				isYvr: true,
			})
		).toBe(false);

		expect(
			isValidateAdultAssignment({
				adultId: "a2",
				passengerType: "childC",
				map: {},
				isYvr: true,
			})
		).toBe(true);
	});

	it("enforces non-YVR dependent total rule", () => {
		expect(
			isValidateAdultAssignment({
				adultId: "a1",
				passengerType: "childC",
				map: { a1: { infant_Count: 1, CHILD_TOTAL: 0, childC_Count: 1 } },
				isYvr: false,
			})
		).toBe(false);

		expect(
			isValidateAdultAssignment({
				adultId: "a1",
				passengerType: "infant",
				map: { a1: { infant_Count: 0, CHILD_TOTAL: 0, childC_Count: 1 } },
				isYvr: false,
			})
		).toBe(true);

		expect(
			isValidateAdultAssignment({
				adultId: "a1",
				passengerType: "childA",
				map: { a1: { infant_Count: 1, CHILD_TOTAL: 0, childC_Count: 1 } },
				isYvr: false,
			})
		).toBe(true);
	});

	it("checks whether accompanying adult is required by route and passenger type", () => {
		expect(shouldHaveAccompanyingAdult("childA", true)).toBe(true);
		expect(shouldHaveAccompanyingAdult("childB", true)).toBe(true);
		expect(shouldHaveAccompanyingAdult("childC", true)).toBe(true);
		expect(shouldHaveAccompanyingAdult("infant", true)).toBe(true);
		expect(shouldHaveAccompanyingAdult("adult", true)).toBe(false);

		expect(shouldHaveAccompanyingAdult("childA", false)).toBe(false);
		expect(shouldHaveAccompanyingAdult("childC", false)).toBe(true);
		expect(shouldHaveAccompanyingAdult("infant", false)).toBe(true);
	});

	it("focuses first invalid field when directly focusable", () => {
		const field = document.createElement("input");
		field.setAttribute("aria-invalid", "true");
		document.body.appendChild(field);

		const scrollSpy = vi.spyOn(field, "scrollIntoView").mockImplementation(() => undefined);
		const focusSpy = vi.spyOn(field, "focus").mockImplementation(() => undefined);

		setFocusOnInvalidInput();

		expect(scrollSpy).toHaveBeenCalled();
		expect(focusSpy).toHaveBeenCalledOnce();

		document.body.innerHTML = "";
	});

	it("focuses nested focusable element when first invalid wrapper is not focusable", () => {
		const wrapper = document.createElement("div");
		wrapper.setAttribute("aria-invalid", "true");
		const nested = document.createElement("button");
		wrapper.appendChild(nested);
		document.body.appendChild(wrapper);

		const scrollSpy = vi.spyOn(wrapper, "scrollIntoView").mockImplementation(() => undefined);
		const focusSpy = vi.spyOn(nested, "focus").mockImplementation(() => undefined);

		setFocusOnInvalidInput();

		expect(scrollSpy).toHaveBeenCalled();
		expect(focusSpy).toHaveBeenCalledOnce();

		document.body.innerHTML = "";
	});

	it("does nothing when there are no invalid fields", () => {
		document.body.innerHTML = "";
		expect(() => setFocusOnInvalidInput()).not.toThrow();
	});
});
