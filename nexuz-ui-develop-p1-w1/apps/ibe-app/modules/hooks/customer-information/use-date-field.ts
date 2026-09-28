import { useWatch } from "react-hook-form";
import {
	getAdjustedDay,
	getValidDaysForMonth,
	triggerFieldDateValidation,
} from "@/modules/utils/helpers/customer-information/customer-information-utils";
import type { UseDateFieldParams } from "@/types/customer-information/customer-information.types";

export const useDateField = ({
	fieldName,
	control,
	errors,
	trigger,
	getValues,
	setValue,
}: UseDateFieldParams) => {
	const dateValue = useWatch({
		control,
		name: fieldName,
	});

	const validDays = getValidDaysForMonth(dateValue?.year, dateValue?.month);

	const adjustSelectedDay = ({ year, month }: { year?: string; month?: string }) => {
		const currentDate = getValues(fieldName);
		const currentDay = currentDate?.day;

		if (!currentDay) {
			return;
		}

		const adjustedDay = getAdjustedDay({
			year,
			month,
			day: currentDay,
		});

		if (adjustedDay === currentDay) {
			return;
		}

		setValue(`${fieldName}.day`, adjustedDay, {
			shouldDirty: true,
			shouldTouch: false,
			shouldValidate: false,
		});
	};

	const handleYearChange = (value: unknown, onChange: (value: string) => void) => {
		if (typeof value !== "string") {
			return;
		}

		onChange(value);

		adjustSelectedDay({
			year: value,
			month: getValues(fieldName)?.month,
		});

		triggerFieldDateValidation(fieldName, errors, trigger, getValues);
	};

	const handleMonthChange = (value: unknown, onChange: (value: string) => void) => {
		if (typeof value !== "string") {
			return;
		}

		onChange(value);

		adjustSelectedDay({
			year: getValues(fieldName)?.year,
			month: value,
		});

		triggerFieldDateValidation(fieldName, errors, trigger, getValues);
	};

	const handleDayChange = (value: unknown, onChange: (value: string) => void) => {
		if (typeof value !== "string") {
			return;
		}

		onChange(value);

		triggerFieldDateValidation(fieldName, errors, trigger, getValues);
	};

	return {
		validDays,
		handleYearChange,
		handleMonthChange,
		handleDayChange,
	};
};
