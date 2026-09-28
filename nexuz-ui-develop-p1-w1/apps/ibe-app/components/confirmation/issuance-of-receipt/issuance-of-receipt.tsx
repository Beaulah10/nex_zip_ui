/**
 * File: issuance-of-receipt.tsx
 * Description: Receipt issuance form component that allows users to select a receipt recipient
 * or manually enter recipient details, including name and email information. Handles field validation,
 * error management, and receipt eligibility checks before allowing progression in the booking flow.
 */
import { Badge } from "@repo/ui/components/badge";
import { Field, FieldHeader, FieldLabel } from "@repo/ui/components/field";
import { InputField } from "@repo/ui/components/input-field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { usePassengerOrder } from "@/modules/hooks/common/passenger-order/passenger-order";
import {
	EMPTY_MANUAL_STATE,
	RECEIPT_REQUIRED_FIELDS,
} from "@/modules/utils/constants/confirmation/confirmation.constants";
import {
	buildReceiptPassengerOptions,
	RECEIPT_MANUAL_VALUE,
} from "@/modules/utils/helpers/confirmation/issuance-of-receipt-utils/issuance-of-receipt.utils";
import {
	hasUsCanadaItinerary,
	RECEIPT_MAX_NAME_LENGTH,
	validateReceiptEmail,
	validateReceiptEmailConfirmation,
	validateReceiptName,
} from "@/modules/utils/validations/confirmation/issuance-of-receipt";
import { useAppSelector } from "@/store/hooks";
import { selectConfirmedFlight } from "@/store/slices/flight-selection/flight-selection.slice";
import type {
	IssuanceOfReceiptHandle,
	IssuanceOfReceiptProps,
	ManualReceiptState,
	ReceiptFieldErrors,
	ReceiptFieldName,
	ReceiptRecipientInfo,
} from "@/types/confirmation/confirmation.types";

/** Issuance of receipt form section: recipient, passenger name, and email fields used for the receipt. */
export const IssuanceOfReceipt = forwardRef<IssuanceOfReceiptHandle, IssuanceOfReceiptProps>(
	(
		{
			title,
			recipientLabel,
			recipientManualOptionLabel,
			requiredBadgeLabel,
			optionalBadgeLabel,
			lastNameLabel,
			firstNameLabel,
			middleNameLabel,
			halfWidthAlphabetLabel,
			emailLabel,
			emailConfirmationLabel,
			halfWidthAlphanumericLabel,
			emailHelperText,
			className,
		},
		ref
	) => {
		const { orderedPassengersWithNames } = usePassengerOrder();
		const t = useTranslations("confirmation_page");
		const confirmedFlight = useAppSelector(selectConfirmedFlight);
		const [manualState, setManualState] = useState(EMPTY_MANUAL_STATE);
		const [receiptErrors, setReceiptErrors] = useState<ReceiptFieldErrors>({});
		const [touchedFields, setTouchedFields] = useState<Partial<Record<ReceiptFieldName, boolean>>>(
			{}
		);
		const [selectedPassenger, setSelectedPassenger] = useState(RECEIPT_MANUAL_VALUE);
		const [passengerEmail, setPassengerEmail] = useState("");
		const sectionRef = useRef<HTMLDivElement>(null);
		const passengerOptions = useMemo(
			() => buildReceiptPassengerOptions(orderedPassengersWithNames),
			[orderedPassengersWithNames]
		);

		const flightSegments = useMemo(
			() => [
				...(confirmedFlight?.flights.outbound.segments ?? []),
				...(confirmedFlight?.flights.inbound?.segments ?? []),
			],
			[confirmedFlight]
		);

		const isUsCanadaRoute = useMemo(() => hasUsCanadaItinerary(flightSegments), [flightSegments]);

		const isManualSelection = selectedPassenger === RECEIPT_MANUAL_VALUE;
		const selectedPassengerInfo = useMemo(
			() => orderedPassengersWithNames.find((passenger) => passenger.id === selectedPassenger),
			[orderedPassengersWithNames, selectedPassenger]
		);

		const getFieldErrors = (message?: string) => (message ? [{ message }] : undefined);

		const shouldValidateEmailConfirmation = (nextManualState: ManualReceiptState) =>
			!!touchedFields.emailConfirmation || nextManualState.emailConfirmation.trim() !== "";

		const validateField = useCallback(
			(fieldName: ReceiptFieldName, nextManualState: ManualReceiptState): string | undefined => {
				switch (fieldName) {
					case "lastName":
						return validateReceiptName(nextManualState.lastName, {
							required: true,
							requiredMessage: t("error_labels.issuance_receipt_last_name_required"),
							maxLengthMessage: t("error_labels.issuance_receipt_name_max_length", {
								maxLength: RECEIPT_MAX_NAME_LENGTH,
							}),
							invalidMessage: t("error_labels.invalid_name_error"),
						});
					case "firstName":
						return validateReceiptName(nextManualState.firstName, {
							required: true,
							requiredMessage: t("error_labels.issuance_receipt_first_name_required"),
							maxLengthMessage: t("error_labels.issuance_receipt_name_max_length", {
								maxLength: RECEIPT_MAX_NAME_LENGTH,
							}),
							invalidMessage: t("error_labels.invalid_name_error"),
						});
					case "middleName":
						return validateReceiptName(nextManualState.middleName, {
							invalidMessage: t("error_labels.invalid_name_error"),
							maxLengthMessage: t("error_labels.issuance_receipt_name_max_length", {
								maxLength: RECEIPT_MAX_NAME_LENGTH,
							}),
							requiredMessage: "",
						});
					case "emailAddress":
						return validateReceiptEmail(nextManualState.emailAddress, {
							requiredMessage: t("error_labels.issuance_receipt_email_required"),
							invalidMessage: t("error_labels.issuance_receipt_email_invalid"),
							isUsCanadaRoute,
						});
					case "emailConfirmation":
						return validateReceiptEmailConfirmation({
							emailAddress: nextManualState.emailAddress,
							emailConfirmation: nextManualState.emailConfirmation,
							requiredMessage: t("error_labels.issuance_receipt_email_confirmation_required"),
							invalidMessage: t("error_labels.issuance_receipt_email_confirmation_invalid"),
							mismatchMessage: t("error_labels.issuance_receipt_email_confirmation_mismatch"),
							isUsCanadaRoute,
						});
				}
			},
			[isUsCanadaRoute, t]
		);

		const updateFieldError = (
			fieldName: ReceiptFieldName,
			nextManualState: ManualReceiptState,
			shouldValidate: boolean
		) => {
			setReceiptErrors((currentErrors) => {
				const nextErrors = { ...currentErrors };
				const clearFieldError = (name: ReceiptFieldName) => {
					nextErrors[name] = undefined;
				};

				if (shouldValidate || currentErrors[fieldName]) {
					const fieldError = validateField(fieldName, nextManualState);

					if (fieldError) {
						nextErrors[fieldName] = fieldError;
					} else {
						clearFieldError(fieldName);
					}
				}

				if (fieldName === "emailAddress" && shouldValidateEmailConfirmation(nextManualState)) {
					const emailConfirmationError = validateField("emailConfirmation", nextManualState);

					if (emailConfirmationError) {
						nextErrors.emailConfirmation = emailConfirmationError;
					} else {
						clearFieldError("emailConfirmation");
					}
				}

				return nextErrors;
			});
		};

		const handleManualFieldChange = (fieldName: ReceiptFieldName, value: string) => {
			const nextManualState = { ...manualState, [fieldName]: value };

			setManualState(nextManualState);
			updateFieldError(fieldName, nextManualState, false);
		};

		const handleManualFieldBlur = (fieldName: ReceiptFieldName) => {
			setTouchedFields((currentTouchedFields) => ({
				...currentTouchedFields,
				[fieldName]: true,
			}));
			updateFieldError(fieldName, manualState, true);
		};

		const handleRecipientChange = (value: string) => {
			if (value === RECEIPT_MANUAL_VALUE) {
				setSelectedPassenger(RECEIPT_MANUAL_VALUE);
				setPassengerEmail("");
				setManualState(EMPTY_MANUAL_STATE);
				setReceiptErrors({});
				setTouchedFields({});
				return;
			}

			const nextPassenger = passengerOptions.find((passenger) => passenger.value === value);

			setSelectedPassenger(value);
			setPassengerEmail(nextPassenger?.email ?? "");
			setManualState(EMPTY_MANUAL_STATE);
			setReceiptErrors({});
			setTouchedFields({});
		};

		const validateManualSelection = useCallback(() => {
			const nextTouchedFields = RECEIPT_REQUIRED_FIELDS.reduce<
				Partial<Record<ReceiptFieldName, boolean>>
			>((fields, fieldName) => {
				fields[fieldName] = true;
				return fields;
			}, {});
			const nextErrors = RECEIPT_REQUIRED_FIELDS.reduce<ReceiptFieldErrors>((errors, fieldName) => {
				const fieldError = validateField(fieldName, manualState);

				if (fieldError) {
					errors[fieldName] = fieldError;
				}

				return errors;
			}, {});

			setTouchedFields(nextTouchedFields);
			setReceiptErrors(nextErrors);

			return Object.keys(nextErrors).length === 0;
		}, [manualState, validateField]);

		const getRecipientInfo = useCallback((): ReceiptRecipientInfo | null => {
			if (isManualSelection) {
				return {
					firstName: manualState.firstName.trim(),
					lastName: manualState.lastName.trim(),
					...(manualState.middleName.trim() ? { middleName: manualState.middleName.trim() } : {}),
					emailAddress: manualState.emailAddress.trim(),
				};
			}

			if (!selectedPassengerInfo) {
				return null;
			}

			return {
				firstName: selectedPassengerInfo.firstName?.trim() ?? "",
				lastName: selectedPassengerInfo.lastName?.trim() ?? "",
				...(selectedPassengerInfo.middleName?.trim()
					? { middleName: selectedPassengerInfo.middleName.trim() }
					: {}),
				emailAddress: passengerEmail.trim(),
			};
		}, [isManualSelection, manualState, passengerEmail, selectedPassengerInfo]);

		useImperativeHandle(
			ref,
			() => ({
				validateSelection: () => {
					if (!isManualSelection) {
						return true;
					}

					return validateManualSelection();
				},
				getRecipientInfo,
				focus: () => {
					sectionRef.current?.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
				},
			}),
			[getRecipientInfo, isManualSelection, validateManualSelection]
		);

		return (
			<div
				ref={sectionRef}
				className={cn("issuance-of-receipt flex w-full flex-col gap-6", className)}
			>
				<div className="flex flex-col gap-1">
					<span className="font-bold text-2xl text-primary-700 leading-9">{title}</span>
					<div className="h-px w-full bg-base-200" />
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Field>
						<FieldHeader>
							<FieldLabel id="receipt-recipient-label" htmlFor="receipt-recipient">
								{recipientLabel}
							</FieldLabel>
							<Badge variant="destructive">{requiredBadgeLabel}</Badge>
						</FieldHeader>
						<Select value={selectedPassenger} onValueChange={handleRecipientChange}>
							<SelectTrigger
								id="receipt-recipient"
								aria-labelledby="receipt-recipient-label"
								selectSize="md"
								className="w-full"
							>
								<SelectValue placeholder={recipientManualOptionLabel} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={RECEIPT_MANUAL_VALUE}>{recipientManualOptionLabel}</SelectItem>
								{passengerOptions.map((passenger) => (
									<SelectItem key={passenger.value} value={passenger.value}>
										{passenger.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
				</div>

				{isManualSelection ? (
					<>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<InputField
								id="receipt-last-name"
								label={lastNameLabel}
								labelHtmlFor="receipt-last-name"
								title={halfWidthAlphabetLabel}
								badge={{ variant: "destructive", text: requiredBadgeLabel }}
								value={manualState.lastName}
								errors={getFieldErrors(receiptErrors.lastName)}
								onChange={(event) => handleManualFieldChange("lastName", event.target.value)}
								onBlur={() => handleManualFieldBlur("lastName")}
							/>
							<InputField
								id="receipt-first-name"
								label={firstNameLabel}
								labelHtmlFor="receipt-first-name"
								title={halfWidthAlphabetLabel}
								badge={{ variant: "destructive", text: requiredBadgeLabel }}
								value={manualState.firstName}
								errors={getFieldErrors(receiptErrors.firstName)}
								onChange={(event) => handleManualFieldChange("firstName", event.target.value)}
								onBlur={() => handleManualFieldBlur("firstName")}
							/>
							<InputField
								id="receipt-middle-name"
								label={middleNameLabel}
								labelHtmlFor="receipt-middle-name"
								title={halfWidthAlphabetLabel}
								badge={{ variant: "secondary", text: optionalBadgeLabel }}
								value={manualState.middleName}
								errors={getFieldErrors(receiptErrors.middleName)}
								onChange={(event) => handleManualFieldChange("middleName", event.target.value)}
								onBlur={() => handleManualFieldBlur("middleName")}
							/>
						</div>

						<div className="flex flex-col gap-2">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="order-2 md:order-0">
									<InputField
										id="receipt-email"
										type="email"
										label={emailLabel}
										labelHtmlFor="receipt-email"
										title={halfWidthAlphanumericLabel}
										badge={{ variant: "destructive", text: requiredBadgeLabel }}
										value={manualState.emailAddress}
										errors={getFieldErrors(receiptErrors.emailAddress)}
										onChange={(event) =>
											handleManualFieldChange("emailAddress", event.target.value)
										}
										onBlur={() => handleManualFieldBlur("emailAddress")}
									/>
								</div>
								<div className="order-1 md:order-0">
									<InputField
										id="receipt-email-confirmation"
										type="email"
										label={emailConfirmationLabel}
										labelHtmlFor="receipt-email-confirmation"
										title={halfWidthAlphanumericLabel}
										badge={{ variant: "destructive", text: requiredBadgeLabel }}
										value={manualState.emailConfirmation}
										errors={getFieldErrors(receiptErrors.emailConfirmation)}
										onPaste={(event) => {
											event.preventDefault();
										}}
										onChange={(event) =>
											handleManualFieldChange("emailConfirmation", event.target.value)
										}
										onBlur={() => handleManualFieldBlur("emailConfirmation")}
									/>
								</div>
							</div>
							<p className="font-normal text-base-700 text-sm leading-6">{emailHelperText}</p>
						</div>
					</>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<InputField
							aria-label={t("aria_labels.receipt-passenger-email", {
								passengerName: `${selectedPassengerInfo?.lastName} ${selectedPassengerInfo?.firstName}`,
							})}
							id="receipt-passenger-email"
							type="email"
							label={emailLabel}
							labelHtmlFor="receipt-passenger-email"
							title={halfWidthAlphanumericLabel}
							badge={{ variant: "destructive", text: requiredBadgeLabel }}
							value={passengerEmail}
							readOnly
							aria-readonly="true"
							className="bg-base-200"
						/>
					</div>
				)}
			</div>
		);
	}
);

IssuanceOfReceipt.displayName = "IssuanceOfReceipt";
