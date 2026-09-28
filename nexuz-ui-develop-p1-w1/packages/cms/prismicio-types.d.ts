import type * as prismic from "@prismicio/client";

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };

type PickContentRelationshipFieldData<
	TRelationship extends
		| prismic.CustomTypeModelFetchCustomTypeLevel1
		| prismic.CustomTypeModelFetchCustomTypeLevel2
		| prismic.CustomTypeModelFetchGroupLevel1
		| prismic.CustomTypeModelFetchGroupLevel2,
	TData extends Record<
		string,
		prismic.AnyRegularField | prismic.GroupField | prismic.NestedGroupField | prismic.SliceZone
	>,
	TLang extends string,
> = {
	// Content relationship fields
	[TSubRelationship in Extract<
		TRelationship["fields"][number],
		prismic.CustomTypeModelFetchContentRelationshipLevel1
	> as TSubRelationship["id"]]: ContentRelationshipFieldWithData<
		TSubRelationship["customtypes"],
		TLang
	>;
} & {
	// Group
	[TGroup in Extract<
		TRelationship["fields"][number],
		prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2
	> as TGroup["id"]]: TData[TGroup["id"]] extends prismic.GroupField<infer TGroupData>
		? prismic.GroupField<PickContentRelationshipFieldData<TGroup, TGroupData, TLang>>
		: never;
} & {
	// Other fields
	[TFieldKey in Extract<TRelationship["fields"][number], string>]: TFieldKey extends keyof TData
		? TData[TFieldKey]
		: never;
};

type ContentRelationshipFieldWithData<
	TCustomType extends
		| readonly (prismic.CustomTypeModelFetchCustomTypeLevel1 | string)[]
		| readonly (prismic.CustomTypeModelFetchCustomTypeLevel2 | string)[],
	TLang extends string = string,
> = {
	[ID in Exclude<TCustomType[number], string>["id"]]: prismic.ContentRelationshipField<
		ID,
		TLang,
		PickContentRelationshipFieldData<
			Extract<TCustomType[number], { id: ID }>,
			Extract<prismic.Content.AllDocumentTypes, { type: ID }>["data"],
			TLang
		>
	>;
}[Exclude<TCustomType[number], string>["id"]];

/**
 * Content for Ancillary Page documents
 */
interface AncillaryPageDocumentData {
	/**
	 * Ancillary Page Title field in *Ancillary Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_page.ancillary_page_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	ancillary_page_title: prismic.KeyTextField;

	/**
	 * Ancillary Page Description field in *Ancillary Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_page.ancillary_page_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	ancillary_page_description: prismic.KeyTextField;

	/**
	 * Alerts Deadline Title field in *Ancillary Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_page.alerts_deadline_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	alerts_deadline_title: prismic.KeyTextField;

	/**
	 * Alerts Deadline Description field in *Ancillary Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_page.alerts_deadline_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	alerts_deadline_description: prismic.KeyTextField;

	/**
	 * All Ancillary Services Disabled field in *Ancillary Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_page.all_ancillary_services_disabled
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	all_ancillary_services_disabled: prismic.KeyTextField;

	/**
	 * Popup Error Message field in *Ancillary Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_page.popup_error_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	popup_error_message: prismic.KeyTextField;

	/**
	 * Mandatory Bundle Selection Error Title field in *Ancillary Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_page.mandatory_bundle_selection_error_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	mandatory_bundle_selection_error_title: prismic.KeyTextField;

	/**
	 * Adjacent Seat Error Title field in *Ancillary Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_page.adjacent_seat_error_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	adjacent_seat_error_title: prismic.KeyTextField;

	/**
	 * Deadline Error Title field in *Ancillary Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_page.deadline_error_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	deadline_error_title: prismic.KeyTextField;

	/**
	 * Meal Service Name field in *Ancillary Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_page.meal_service_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meal_service_name: prismic.KeyTextField;

	/**
	 * Airport Lounge Name field in *Ancillary Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_page.airport_lounge_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	airport_lounge_name: prismic.KeyTextField;

	/**
	 * Seat Service Name field in *Ancillary Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_page.seat_service_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_service_name: prismic.KeyTextField;

	/**
	 * Priority Service Name field in *Ancillary Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_page.priority_service_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	priority_service_name: prismic.KeyTextField;

	/**
	 * Transportation Service Name field in *Ancillary Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_page.transportation_service_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	transportation_service_name: prismic.KeyTextField;

	/**
	 * Baggage Service Name field in *Ancillary Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_page.baggage_service_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	baggage_service_name: prismic.KeyTextField;
}

/**
 * Ancillary Page document from Prismic
 *
 * - **API ID**: `ancillary_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type AncillaryPageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<
	Simplify<AncillaryPageDocumentData>,
	"ancillary_page",
	Lang
>;

/**
 * Content for Ancillary Service documents
 */
interface AncillaryServiceDocumentData {
	/**
	 * Value Label field in *Ancillary Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_service.value_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	value_label: prismic.KeyTextField;

	/**
	 * Premium Label field in *Ancillary Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_service.premium_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	premium_label: prismic.KeyTextField;

	/**
	 * Flexbiz Label field in *Ancillary Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_service.flexbiz_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	flexbiz_label: prismic.KeyTextField;

	/**
	 * Nobundle Label field in *Ancillary Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_service.nobundle_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	nobundle_label: prismic.KeyTextField;

	/**
	 * Add Button field in *Ancillary Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_service.add_button
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	add_button: prismic.KeyTextField;

	/**
	 * Change Button field in *Ancillary Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_service.change_button
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	change_button: prismic.KeyTextField;

	/**
	 * Meal Feature field in *Ancillary Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_service.meal_feature
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meal_feature: prismic.KeyTextField;

	/**
	 * Baggage Feature Carryon No Bundle field in *Ancillary Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_service.baggage_feature_carryon_no_bundle
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	baggage_feature_carryon_no_bundle: prismic.KeyTextField;

	/**
	 * Baggage Feature Checkin field in *Ancillary Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_service.baggage_feature_checkin
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	baggage_feature_checkin: prismic.KeyTextField;

	/**
	 * Baggage Feature Carryon Bundle field in *Ancillary Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_service.baggage_feature_carryon_bundle
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	baggage_feature_carryon_bundle: prismic.KeyTextField;

	/**
	 * Service Unavailable Title field in *Ancillary Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_service.service_unavailable_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_unavailable_title: prismic.KeyTextField;

	/**
	 * Service Unavailable Message field in *Ancillary Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ancillary_service.service_unavailable_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_unavailable_message: prismic.KeyTextField;
}

/**
 * Ancillary Service document from Prismic
 *
 * - **API ID**: `ancillary_service`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type AncillaryServiceDocument<Lang extends string = string> =
	prismic.PrismicDocumentWithoutUID<
		Simplify<AncillaryServiceDocumentData>,
		"ancillary_service",
		Lang
	>;

/**
 * Content for App documents
 */
interface AppDocumentData {
	/**
	 * Flight Search Title field in *App*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: app.flight_search_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	flight_search_title: prismic.KeyTextField;
}

/**
 * App document from Prismic
 *
 * - **API ID**: `app`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type AppDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<
	Simplify<AppDocumentData>,
	"app",
	Lang
>;

/**
 * Content for Baggage Service documents
 */
interface BaggageServiceDocumentData {
	/**
	 * Title Baggage Services field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.title_baggage_services
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title_baggage_services: prismic.KeyTextField;

	/**
	 * Baggage Button Add field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.baggage_button_add
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	baggage_button_add: prismic.KeyTextField;

	/**
	 * Baggage-Button Change field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.baggage-button_change
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	"baggage-button_change": prismic.KeyTextField;

	/**
	 * Baggage Total Amount field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.baggage_total_amount
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	baggage_total_amount: prismic.KeyTextField;

	/**
	 * Baggage Confirm Selection field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.baggage_confirm_selection
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	baggage_confirm_selection: prismic.KeyTextField;

	/**
	 * Passenger List Carry On Baggage field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.passenger_list_carry_on_baggage
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_list_carry_on_baggage: prismic.KeyTextField;

	/**
	 * Select Carry On Baggage 7kg field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.select_carry_on_baggage_7kg
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	select_carry_on_baggage_7kg: prismic.KeyTextField;

	/**
	 * Select Carry On Baggage 15kg field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.select_carry_on_baggage_15kg
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	select_carry_on_baggage_15kg: prismic.KeyTextField;

	/**
	 * Passenger List Checked In Baggage field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.passenger_list_checked_in_baggage
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_list_checked_in_baggage: prismic.KeyTextField;

	/**
	 * Passenger List Sports Equipment field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.passenger_list_sports_equipment
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_list_sports_equipment: prismic.KeyTextField;

	/**
	 * Select Checked In Baggage field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.select_checked_in_baggage
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	select_checked_in_baggage: prismic.KeyTextField;

	/**
	 * Select Checked In Baggages field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.select_checked_in_baggages
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	select_checked_in_baggages: prismic.KeyTextField;

	/**
	 * Baggage Selection Carry On Baggage field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.baggage_selection_carry_on_baggage
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	baggage_selection_carry_on_baggage: prismic.KeyTextField;

	/**
	 * Baggage Selection Checked In Baggage field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.baggage_selection_checked_in_baggage
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	baggage_selection_checked_in_baggage: prismic.KeyTextField;

	/**
	 * Baggage Selection Sports Equipments field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.baggage_selection_sports_equipments
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	baggage_selection_sports_equipments: prismic.KeyTextField;

	/**
	 * Select Sports Equipment field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.select_sports_equipment
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	select_sports_equipment: prismic.KeyTextField;

	/**
	 * Label Carry On Label 7 Kg field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.label_carry_on_label_7_kg
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_carry_on_label_7_kg: prismic.KeyTextField;

	/**
	 * Label Carry On Label 15 Kg field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.label_carry_on_label_15_kg
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_carry_on_label_15_kg: prismic.KeyTextField;

	/**
	 * Add Baggage field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.add_baggage
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	add_baggage: prismic.KeyTextField;

	/**
	 * Current Number field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.current_number
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	current_number: prismic.KeyTextField;

	/**
	 * Max Checked In Baggage Info field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.max_checked_in_baggage_info
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	max_checked_in_baggage_info: prismic.KeyTextField;

	/**
	 * Selected Items field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.selected_items
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	selected_items: prismic.KeyTextField;

	/**
	 * Label Ski Equipment field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.label_ski_equipment
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_ski_equipment: prismic.KeyTextField;

	/**
	 * Label Golf field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.label_golf
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_golf: prismic.KeyTextField;

	/**
	 * Label Bicycle Equipment field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.label_bicycle_equipment
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_bicycle_equipment: prismic.KeyTextField;

	/**
	 * Label Surfboard Equipment field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.label_surfboard_equipment
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_surfboard_equipment: prismic.KeyTextField;

	/**
	 * Label Surfboard Equipment Large field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.label_surfboard_equipment_large
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_surfboard_equipment_large: prismic.KeyTextField;

	/**
	 * Label Snow Board field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.label_snow_board
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_snow_board: prismic.KeyTextField;

	/**
	 * Label Value field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.label_value
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_value: prismic.KeyTextField;

	/**
	 * Label Premium field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.label_premium
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_premium: prismic.KeyTextField;

	/**
	 * Label Flexbiz field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.label_flexbiz
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_flexbiz: prismic.KeyTextField;

	/**
	 * Label Nobundle field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.label_nobundle
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_nobundle: prismic.KeyTextField;

	/**
	 * Button Ok field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.button_ok
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_ok: prismic.KeyTextField;

	/**
	 * Segment Mismatch Dialog Description field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.segment_mismatch_dialog_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	segment_mismatch_dialog_description: prismic.KeyTextField;

	/**
	 * Dialog Title Out Of Stock field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.dialog_title_out_of_stock
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dialog_title_out_of_stock: prismic.KeyTextField;

	/**
	 * Dialog Description Out Of Stock field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.dialog_description_out_of_stock
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dialog_description_out_of_stock: prismic.KeyTextField;

	/**
	 * Button Return To Top field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.button_return_to_top
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_return_to_top: prismic.KeyTextField;

	/**
	 * Remaining Available Stocks field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.remaining_available_stocks
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	remaining_available_stocks: prismic.KeyTextField /**
	 * Error Max Checked In Baggage field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.error_max_checked_in_baggage
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	error_max_checked_in_baggage: prismic.KeyTextField;

	/**
	 * Error Title Exceeds Available Stock field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.error_title_exceeds_available_stock
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_title_exceeds_available_stock: prismic.KeyTextField;

	/**
	 * Error Description Out Of Stock field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.error_description_out_of_stock
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_description_out_of_stock: prismic.KeyTextField;

	/**
	 * Error Description Limited Stock field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.error_description_limited_stock
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_description_limited_stock: prismic.KeyTextField;

	/**
	 * Error Title Segment Mismatch field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.error_title_segment_mismatch
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_title_segment_mismatch: prismic.KeyTextField;

	/**
	 * Error Description Segment Mismatch field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.error_description_segment_mismatch
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_description_segment_mismatch: prismic.KeyTextField /**
	 * Label Back field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.label_back
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	label_back: prismic.KeyTextField;

	/**
	 * Label Decrease Quantity field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.label_decrease_quantity
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_decrease_quantity: prismic.KeyTextField;

	/**
	 * Label Increase Quantity field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.label_increase_quantity
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_increase_quantity: prismic.KeyTextField;

	/**
	 * Label Quantity field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.label_quantity
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_quantity: prismic.KeyTextField;

	/**
	 * Selected Amount field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.selected_amount
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	selected_amount: prismic.KeyTextField;

	/**
	 * Carry On Baggage field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.carry_on_baggage
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	carry_on_baggage: prismic.KeyTextField;

	/**
	 * Checked In Baggage field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.checked_in_baggage
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	checked_in_baggage: prismic.KeyTextField;

	/**
	 * Sports Equipment field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.sports_equipment
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	sports_equipment: prismic.KeyTextField;

	/**
	 * Passenger Baggage Card field in *Baggage Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: baggage_service.passenger_baggage_card
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_baggage_card: prismic.KeyTextField;
}

/**
 * Baggage Service document from Prismic
 *
 * - **API ID**: `baggage_service`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type BaggageServiceDocument<Lang extends string = string> =
	prismic.PrismicDocumentWithoutUID<Simplify<BaggageServiceDocumentData>, "baggage_service", Lang>;

/**
 * Content for Bundle Page documents
 */
interface BundlePageDocumentData {
	/**
	 * Stage Labels Outbound field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.stage_labels_outbound
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	stage_labels_outbound: prismic.KeyTextField;

	/**
	 * Stage Labels Inbound field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.stage_labels_inbound
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	stage_labels_inbound: prismic.KeyTextField;

	/**
	 * Stage Labels Segment1 field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.stage_labels_segment1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	stage_labels_segment1: prismic.KeyTextField;

	/**
	 * Stage Labels Segment2 field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.stage_labels_segment2
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	stage_labels_segment2: prismic.KeyTextField;

	/**
	 * Bundle Names No Bundle field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_names_no_bundle
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_names_no_bundle: prismic.KeyTextField;

	/**
	 * Bundle Names Flex Biz field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_names_flex_biz
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_names_flex_biz: prismic.KeyTextField;

	/**
	 * Bundle Names Premium field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_names_premium
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_names_premium: prismic.KeyTextField;

	/**
	 * Bundle Names Value field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_names_value
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_names_value: prismic.KeyTextField;

	/**
	 * Bundle Options No Bundle Description Line 1 field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_options_no_bundle_description_line_1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_options_no_bundle_description_line_1: prismic.KeyTextField;

	/**
	 * Bundle Options No Bundle Description Line 2 field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_options_no_bundle_description_line_2
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_options_no_bundle_description_line_2: prismic.KeyTextField;

	/**
	 * Bundle Options Flex Biz Description Line 1 field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_options_flex_biz_description_line_1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_options_flex_biz_description_line_1: prismic.KeyTextField;

	/**
	 * Bundle Options Value Description Line 1 field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_options_value_description_line_1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_options_value_description_line_1: prismic.KeyTextField;

	/**
	 * Bundle Options Premium Description Line 1 field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_options_premium_description_line_1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_options_premium_description_line_1: prismic.KeyTextField;

	/**
	 * Bundle Options Most Popular Badge field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_options_most_popular_badge
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_options_most_popular_badge: prismic.KeyTextField;

	/**
	 * Bundle Features Feature field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_feature
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_feature: prismic.KeyTextField;

	/**
	 * Bundle Features View Features field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_view_features
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_view_features: prismic.KeyTextField;

	/**
	 * Bundle Features Seat field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_seat
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_seat: prismic.KeyTextField;

	/**
	 * Bundle Features Seat No Bundle field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_seat_no_bundle
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_seat_no_bundle: prismic.KeyTextField;

	/**
	 * Bundle Features Seat Included field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_seat_included
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_seat_included: prismic.KeyTextField;

	/**
	 * Bundle Features Meal field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_meal
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_meal: prismic.KeyTextField;

	/**
	 * Bundle Features Included field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_included
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_included: prismic.KeyTextField;

	/**
	 * Bundle Features Carry On field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_carry_on
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_carry_on: prismic.KeyTextField;

	/**
	 * Bundle Features Carry On No Bundle field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_carry_on_no_bundle
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_carry_on_no_bundle: prismic.KeyTextField;

	/**
	 * Bundle Features Carry On Flex Biz field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_carry_on_flex_biz
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_carry_on_flex_biz: prismic.KeyTextField;

	/**
	 * Bundle Features Carry On Premium field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_carry_on_premium
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_carry_on_premium: prismic.KeyTextField;

	/**
	 * Bundle Features Carry On Value field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_carry_on_value
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_carry_on_value: prismic.KeyTextField;

	/**
	 * Bundle Features Checked Baggage field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_checked_baggage
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_checked_baggage: prismic.KeyTextField;

	/**
	 * Bundle Features Refund field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_refund
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_refund: prismic.KeyTextField;

	/**
	 * Bundle Features Amenities field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_amenities
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_amenities: prismic.KeyTextField;

	/**
	 * Bundle Features Wifi field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_wifi
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_wifi: prismic.KeyTextField;

	/**
	 * Bundle Features Free field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_features_free
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_features_free: prismic.KeyTextField;

	/**
	 * Bundle Selection Title field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_selection_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_selection_title: prismic.KeyTextField;

	/**
	 * Bundle Section Helper Sports Equipment field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_section_helper_sports_equipment
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_section_helper_sports_equipment: prismic.KeyTextField;

	/**
	 * Bundle Section Helper Service Package field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.bundle_section_helper_service_package
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_section_helper_service_package: prismic.KeyTextField;

	/**
	 * Booking Footer Total Amount field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.booking_footer_total_amount
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	booking_footer_total_amount: prismic.KeyTextField;

	/**
	 * Booking Footer Proceed field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.booking_footer_proceed
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	booking_footer_proceed: prismic.KeyTextField;

	/**
	 * Selection Table Apply To All field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.selection_table_apply_to_all
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	selection_table_apply_to_all: prismic.KeyTextField;

	/**
	 * Selection Table Bundle Selection Unavailable field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.selection_table_bundle_selection_unavailable
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	selection_table_bundle_selection_unavailable: prismic.KeyTextField;

	/**
	 * Selection Table Only No Bundle Available For These Passengers field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.selection_table_only_no_bundle_available_for_these_passengers
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	selection_table_only_no_bundle_available_for_these_passengers: prismic.KeyTextField;

	/**
	 * Selection Table Passenger field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.selection_table_passenger
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	selection_table_passenger: prismic.KeyTextField;

	/**
	 * Selection Table Passengers field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.selection_table_passengers
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	selection_table_passengers: prismic.KeyTextField;

	/**
	 * Selection Table Other Passengers field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.selection_table_other_passengers
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	selection_table_other_passengers: prismic.KeyTextField;

	/**
	 * Selection Table Other Passengers One field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.selection_table_other_passengers_one
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	selection_table_other_passengers_one: prismic.KeyTextField;

	/**
	 * Selection Table Other Passengers Many field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.selection_table_other_passengers_many
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	selection_table_other_passengers_many: prismic.KeyTextField;

	/**
	 * Alerts No Bundles Available Title field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.alerts_no_bundles_available_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	alerts_no_bundles_available_title: prismic.KeyTextField;

	/**
	 * Alerts No Bundles Available Description field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.alerts_no_bundles_available_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	alerts_no_bundles_available_description: prismic.KeyTextField;

	/**
	 * Alerts Deadline Title field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.alerts_deadline_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	alerts_deadline_title: prismic.KeyTextField;

	/**
	 * Alerts Deadline Description field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.alerts_deadline_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	alerts_deadline_description: prismic.KeyTextField;

	/**
	 * Alerts Out Of Stock Title field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.alerts_out_of_stock_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	alerts_out_of_stock_title: prismic.KeyTextField;

	/**
	 * Alerts Out Of Stock Description field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.alerts_out_of_stock_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	alerts_out_of_stock_description: prismic.KeyTextField;

	/**
	 * Alerts Limited Title field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.alerts_limited_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	alerts_limited_title: prismic.KeyTextField;

	/**
	 * Alerts Limited Description Apply To All field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.alerts_limited_description_apply_to_all
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	alerts_limited_description_apply_to_all: prismic.KeyTextField;

	/**
	 * Alerts Limited Description Other field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.alerts_limited_description_other
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	alerts_limited_description_other: prismic.KeyTextField;

	/**
	 * Alerts Unavailable Banner Title field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.alerts_unavailable_banner_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	alerts_unavailable_banner_title: prismic.KeyTextField;

	/**
	 * Alerts Unavailable Banner Description field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.alerts_unavailable_banner_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	alerts_unavailable_banner_description: prismic.KeyTextField;

	/**
	 * Dialog Trigger field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.dialog_trigger
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dialog_trigger: prismic.KeyTextField;

	/**
	 * Dialog Title field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.dialog_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dialog_title: prismic.KeyTextField;

	/**
	 * Dialog Bullet 1 field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.dialog_bullet_1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dialog_bullet_1: prismic.KeyTextField;

	/**
	 * Dialog Bullet 2 field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.dialog_bullet_2
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dialog_bullet_2: prismic.KeyTextField;

	/**
	 * Dialog Learn More field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.dialog_learn_more
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dialog_learn_more: prismic.KeyTextField;

	/**
	 * Dialog Close field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.dialog_close
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dialog_close: prismic.KeyTextField;

	/**
	 * Dialog Confirm field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.dialog_confirm
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dialog_confirm: prismic.KeyTextField /**
	 * NEXUZCMNE001 field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.NEXUZCMNE001
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	NEXUZCMNE001: prismic.KeyTextField;

	/**
	 * NEXUZCMNE002 field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.NEXUZCMNE002
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZCMNE002: prismic.KeyTextField;

	/**
	 * NEXUZCMNE003 field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.NEXUZCMNE003
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZCMNE003: prismic.KeyTextField;

	/**
	 * NEXUZR004E001 field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.NEXUZR004E001
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZR004E001: prismic.KeyTextField;

	/**
	 * NEXUZR004E002 field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.NEXUZR004E002
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZR004E002: prismic.KeyTextField;

	/**
	 * NEXUZCMNE004 field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.NEXUZCMNE004
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZCMNE004: prismic.KeyTextField;

	/**
	 * NEXUZR004E003 field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.NEXUZR004E003
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZR004E003: prismic.KeyTextField;

	/**
	 * Select Any Bundle To Proceed field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.select_any_bundle_to_proceed
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	select_any_bundle_to_proceed: prismic.KeyTextField;

	/**
	 * Select Bundle For Passengers field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.select_bundle_for_passengers
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	select_bundle_for_passengers: prismic.KeyTextField /**
	 * Collapse Information field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.collapse_information
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	collapse_information: prismic.KeyTextField;

	/**
	 * Expand Information field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.expand_information
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	expand_information: prismic.KeyTextField;

	/**
	 * Select Bundle For All Travellers field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.select_bundle_for_all_travellers
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	select_bundle_for_all_travellers: prismic.KeyTextField;

	/**
	 * No Bundle field in *Bundle Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: bundle_page.no_bundle
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	no_bundle: prismic.KeyTextField;
}

/**
 * Bundle Page document from Prismic
 *
 * - **API ID**: `bundle_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type BundlePageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<
	Simplify<BundlePageDocumentData>,
	"bundle_page",
	Lang
>;

type BundlesDocumentData = {};

/**
 * Bundles document from Prismic
 *
 * - **API ID**: `bundles`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type BundlesDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<
	Simplify<BundlesDocumentData>,
	"bundles",
	Lang
>;

/**
 * Content for Common documents
 */
interface CommonDocumentData {
	/**
	 * Flight Selection field in *Common*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: common.flight_selection
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	flight_selection: prismic.KeyTextField;

	/**
	 * Bundle Selection field in *Common*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: common.bundle_selection
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_selection: prismic.KeyTextField;

	/**
	 * Customize Selection field in *Common*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: common.customize_selection
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	customize_selection: prismic.KeyTextField;

	/**
	 * Extras Selection field in *Common*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: common.extras_selection
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	extras_selection: prismic.KeyTextField;

	/**
	 * Customer Information field in *Common*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: common.customer_information
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	customer_information: prismic.KeyTextField;

	/**
	 * Insurance Selection field in *Common*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: common.insurance_selection
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	insurance_selection: prismic.KeyTextField;

	/**
	 * Review Confirm Selection field in *Common*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: common.review_confirm_selection
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	review_confirm_selection: prismic.KeyTextField;

	/**
	 * Payment Selection field in *Common*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: common.payment_selection
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	payment_selection: prismic.KeyTextField;

	/**
	 * Inbound Options field in *Common*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: common.inbound_options
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	inbound_options: prismic.KeyTextField;

	/**
	 * Outbound Options field in *Common*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: common.outbound_options
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	outbound_options: prismic.KeyTextField;

	/**
	 * Segment1 Options field in *Common*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: common.segment1_options
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	segment1_options: prismic.KeyTextField;

	/**
	 * Segment2 Options field in *Common*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: common.segment2_options
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	segment2_options: prismic.KeyTextField;

	/**
	 * Go To Top Page field in *Common*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: common.go_to_top_page
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	go_to_top_page: prismic.KeyTextField;

	/**
	 * Exceeds Available Stock Title field in *Common*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: common.exceeds_available_stock_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	exceeds_available_stock_title: prismic.KeyTextField;

	/**
	 * Exceeds Available Stock Message field in *Common*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: common.exceeds_available_stock_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	exceeds_available_stock_message: prismic.KeyTextField;
}

/**
 * Common document from Prismic
 *
 * - **API ID**: `common`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type CommonDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<
	Simplify<CommonDocumentData>,
	"common",
	Lang
>;

type ContentPageDocumentDataSlicesSlice = RichTextSlice | TestSliceSlice;

/**
 * Content for Content Page documents
 */
interface ContentPageDocumentData {
	/**
	 * Title field in *Content Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_page.title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;

	/**
	 * SEO Title field in *Content Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_page.seo_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seo_title: prismic.KeyTextField;

	/**
	 * SEO Description field in *Content Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_page.seo_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seo_description: prismic.KeyTextField;

	/**
	 * `slices` field in *Content Page*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_page.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<ContentPageDocumentDataSlicesSlice>;
}

/**
 * Content Page document from Prismic
 *
 * - **API ID**: `content_page`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type ContentPageDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<
	Simplify<ContentPageDocumentData>,
	"content_page",
	Lang
>;

/**
 * Content for Customer Information Page documents
 */
interface CustomerInformationPageDocumentData {
	/**
	 * Section Contact Information field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.section_contact_information
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	section_contact_information: prismic.KeyTextField;

	/**
	 * Button Copy Primary Passenger field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.button_copy_primary_passenger
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_copy_primary_passenger: prismic.KeyTextField;

	/**
	 * Label Phone Number field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_phone_number
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_phone_number: prismic.KeyTextField;

	/**
	 * Label Emergency Contact field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_emergency_contact
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_emergency_contact: prismic.KeyTextField;

	/**
	 * Title Half Width Digits field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.title_half_width_digits
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title_half_width_digits: prismic.KeyTextField;

	/**
	 * Title Half Width Alphanumeric field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.title_half_width_alphanumeric
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title_half_width_alphanumeric: prismic.KeyTextField;

	/**
	 * Label Email field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_email
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_email: prismic.KeyTextField;

	/**
	 * Label Email Confirmation field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_email_confirmation
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_email_confirmation: prismic.KeyTextField;

	/**
	 * Placeholder Email field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.placeholder_email
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_email: prismic.KeyTextField;

	/**
	 * Placeholder Email Confirmation field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.placeholder_email_confirmation
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_email_confirmation: prismic.KeyTextField;

	/**
	 * Required Badge field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.required_badge
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	required_badge: prismic.KeyTextField;

	/**
	 * Email Helper Text field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.email_helper_text
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	email_helper_text: prismic.KeyTextField;

	/**
	 * Section Destination Address field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.section_destination_address
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	section_destination_address: prismic.KeyTextField;

	/**
	 * Destination Deadline Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.destination_deadline_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	destination_deadline_title: prismic.KeyTextField;

	/**
	 * Destination Deadline Message field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.destination_deadline_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	destination_deadline_message: prismic.KeyTextField;

	/**
	 * Destination Info Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.destination_info_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	destination_info_title: prismic.KeyTextField;

	/**
	 * Destination Info Message field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.destination_info_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	destination_info_message: prismic.KeyTextField;

	/**
	 * Label Hotel Name field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_hotel_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_hotel_name: prismic.KeyTextField;

	/**
	 * Label Country Of Stay field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_country_of_stay
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_country_of_stay: prismic.KeyTextField;

	/**
	 * Label Postal Code field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_postal_code
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_postal_code: prismic.KeyTextField;

	/**
	 * Label City field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_city
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_city: prismic.KeyTextField;

	/**
	 * Label State field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_state
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_state: prismic.KeyTextField;

	/**
	 * Title Half Width Numbers field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.title_half_width_numbers
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title_half_width_numbers: prismic.KeyTextField;

	/**
	 * Placeholder Selection field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.placeholder_selection
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_selection: prismic.KeyTextField;

	/**
	 * Badge Optional field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.badge_optional
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	badge_optional: prismic.KeyTextField;

	/**
	 * Combobox No Options Found field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.combobox_no_options_found
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	combobox_no_options_found: prismic.KeyTextField;

	/**
	 * Button Copy To Other Passenger field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.button_copy_to_other_passenger
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_copy_to_other_passenger: prismic.KeyTextField;

	/**
	 * Passport Scanner Dialog Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_dialog_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_dialog_label: prismic.KeyTextField;

	/**
	 * Passport Scanner Close Aria Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_close_aria_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_close_aria_label: prismic.KeyTextField;

	/**
	 * Passport Scanner Scan Button field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_scan_button
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_scan_button: prismic.KeyTextField;

	/**
	 * Passport Scanner Instruction field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_instruction
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_instruction: prismic.KeyTextField;

	/**
	 * Passport Scanner Passport Icon Aria Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_passport_icon_aria_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_passport_icon_aria_label: prismic.KeyTextField;

	/**
	 * Passport Scanner Permission Denied Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_permission_denied_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_permission_denied_title: prismic.KeyTextField;

	/**
	 * Passport Scanner Permission Denied Message field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_permission_denied_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_permission_denied_message: prismic.KeyTextField;

	/**
	 * Passport Scanner Scan Failed Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_scan_failed_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_scan_failed_title: prismic.KeyTextField;

	/**
	 * Passport Scanner Scan Failed Message field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_scan_failed_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_scan_failed_message: prismic.KeyTextField;

	/**
	 * Passport Scanner Scan Complete Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_scan_complete_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_scan_complete_title: prismic.KeyTextField;

	/**
	 * Passport Scanner Scan Complete Message field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_scan_complete_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_scan_complete_message: prismic.KeyTextField;

	/**
	 * Passport Scanner Ok Button field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_ok_button
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_ok_button: prismic.KeyTextField;

	/**
	 * Passport Scanner Sr Camera Access Denied field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_sr_camera_access_denied
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_sr_camera_access_denied: prismic.KeyTextField;

	/**
	 * Passport Scanner Sr Scan Failed field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_sr_scan_failed
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_sr_scan_failed: prismic.KeyTextField;

	/**
	 * Passport Scanner Sr Scan Complete field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_sr_scan_complete
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_sr_scan_complete: prismic.KeyTextField;

	/**
	 * Passport Scanner Sr Processing field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_sr_processing
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_sr_processing: prismic.KeyTextField;

	/**
	 * Button Scan Passport field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.button_scan_passport
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_scan_passport: prismic.KeyTextField;

	/**
	 * Camera Access Denied Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.camera_access_denied_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	camera_access_denied_title: prismic.KeyTextField;

	/**
	 * Camera Access Denied Message field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.camera_access_denied_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	camera_access_denied_message: prismic.KeyTextField;

	/**
	 * Button Ok field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.button_ok
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_ok: prismic.KeyTextField;

	/**
	 * Section Passport Information field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.section_passport_information
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	section_passport_information: prismic.KeyTextField;

	/**
	 * Passport Scanner Reading Information field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scanner_reading_information
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scanner_reading_information: prismic.KeyTextField;

	/**
	 * Passport Scan Description field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_scan_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_scan_description: prismic.KeyTextField;

	/**
	 * Label Passport Number field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_passport_number
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_passport_number: prismic.KeyTextField;

	/**
	 * Passport Expiry Year Aria Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_expiry_year_aria_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_expiry_year_aria_label: prismic.KeyTextField;

	/**
	 * Passport Expiry Month Aria Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_expiry_month_aria_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_expiry_month_aria_label: prismic.KeyTextField;

	/**
	 * Passport Expiry Day Aria Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passport_expiry_day_aria_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_expiry_day_aria_label: prismic.KeyTextField;

	/**
	 * Date Of Birth Year Aria Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.date_of_birth_year_aria_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	date_of_birth_year_aria_label: prismic.KeyTextField;

	/**
	 * Date Of Birth Month Aria Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.date_of_birth_month_aria_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	date_of_birth_month_aria_label: prismic.KeyTextField;

	/**
	 * Date Of Birth Day Aria Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.date_of_birth_day_aria_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	date_of_birth_day_aria_label: prismic.KeyTextField;

	/**
	 * Label Expiry Date field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_expiry_date
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_expiry_date: prismic.KeyTextField;

	/**
	 * Badge Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.badge_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	badge_required: prismic.KeyTextField;

	/**
	 * Placeholder Year field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.placeholder_year
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_year: prismic.KeyTextField;

	/**
	 * Placeholder Month field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.placeholder_month
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_month: prismic.KeyTextField;

	/**
	 * Placeholder Day field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.placeholder_day
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_day: prismic.KeyTextField;

	/**
	 * Error Passport Expiry Date Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_passport_expiry_date_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_passport_expiry_date_required: prismic.KeyTextField;

	/**
	 * Label Last Name field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_last_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_last_name: prismic.KeyTextField;

	/**
	 * Label First Name field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_first_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_first_name: prismic.KeyTextField;

	/**
	 * Label Middle Name field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_middle_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_middle_name: prismic.KeyTextField;

	/**
	 * Label Gender field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_gender
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_gender: prismic.KeyTextField;

	/**
	 * Label Date Of Birth field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_date_of_birth
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_date_of_birth: prismic.KeyTextField;

	/**
	 * Label Nationality Region field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_nationality_region
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_nationality_region: prismic.KeyTextField;

	/**
	 * Label Country Of Residence field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_country_of_residence
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_country_of_residence: prismic.KeyTextField;

	/**
	 * Label Body Weight field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_body_weight
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_body_weight: prismic.KeyTextField;

	/**
	 * Label Body Height field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_body_height
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_body_height: prismic.KeyTextField;

	/**
	 * Label Male field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_male
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_male: prismic.KeyTextField;

	/**
	 * Label Female field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_female
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_female: prismic.KeyTextField;

	/**
	 * Title Half Width Alphabet field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.title_half_width_alphabet
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title_half_width_alphabet: prismic.KeyTextField;

	/**
	 * Placeholder Select field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.placeholder_select
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_select: prismic.KeyTextField;

	/**
	 * Helper Middle Name field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.helper_middle_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	helper_middle_name: prismic.KeyTextField;

	/**
	 * Error Date Of Birth Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_date_of_birth_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_date_of_birth_required: prismic.KeyTextField;

	/**
	 * Body Weight Less Than 9kg field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.body_weight_less_than_9kg
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	body_weight_less_than_9kg: prismic.KeyTextField;

	/**
	 * Body Weight Less Than 9kg Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.body_weight_less_than_9kg_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	body_weight_less_than_9kg_label: prismic.KeyTextField;

	/**
	 * Body Weight 9kg To 18kg field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.body_weight_9kg_to_18kg
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	body_weight_9kg_to_18kg: prismic.KeyTextField;

	/**
	 * Body Weight 9kg To 18kg Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.body_weight_9kg_to_18kg_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	body_weight_9kg_to_18kg_label: prismic.KeyTextField;

	/**
	 * Body Weight 18kg Or More field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.body_weight_18kg_or_more
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	body_weight_18kg_or_more: prismic.KeyTextField;

	/**
	 * Body Weight 18kg Or More Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.body_weight_18kg_or_more_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	body_weight_18kg_or_more_label: prismic.KeyTextField;

	/**
	 * Body Height 72 81 field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.body_height_72_81
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	body_height_72_81: prismic.KeyTextField;

	/**
	 * Body Height 72 81 Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.body_height_72_81_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	body_height_72_81_label: prismic.KeyTextField;

	/**
	 * Body Height 82 91 field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.body_height_82_91
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	body_height_82_91: prismic.KeyTextField;

	/**
	 * Body Height 82 91 Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.body_height_82_91_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	body_height_82_91_label: prismic.KeyTextField;

	/**
	 * Body Height 92 101 field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.body_height_92_101
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	body_height_92_101: prismic.KeyTextField;

	/**
	 * Body Height 92 101 Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.body_height_92_101_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	body_height_92_101_label: prismic.KeyTextField;

	/**
	 * Infant Contact Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.infant_contact_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	infant_contact_title: prismic.KeyTextField;

	/**
	 * Infant Contact Message field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.infant_contact_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	infant_contact_message: prismic.KeyTextField;

	/**
	 * Button Contact Us field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.button_contact_us
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_contact_us: prismic.KeyTextField;

	/**
	 * Infant Warning Message field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.infant_warning_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	infant_warning_message: prismic.KeyTextField;

	/**
	 * Section Customers Needing Assistance field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.section_customers_needing_assistance
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	section_customers_needing_assistance: prismic.KeyTextField;

	/**
	 * Assistance Description field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.assistance_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	assistance_description: prismic.KeyTextField;

	/**
	 * Checkbox Requesting Assistance field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.checkbox_requesting_assistance
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	checkbox_requesting_assistance: prismic.KeyTextField;

	/**
	 * Assistance Questions Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.assistance_questions_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	assistance_questions_title: prismic.KeyTextField;

	/**
	 * Question Manage Personal Needs field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.question_manage_personal_needs
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	question_manage_personal_needs: prismic.KeyTextField;

	/**
	 * Question Boarding With Accompanying Person field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.question_boarding_with_accompanying_person
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	question_boarding_with_accompanying_person: prismic.KeyTextField;

	/**
	 * Label Accompanying Person Name field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_accompanying_person_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_accompanying_person_name: prismic.KeyTextField;

	/**
	 * Placeholder Accompanying Person Name field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.placeholder_accompanying_person_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_accompanying_person_name: prismic.KeyTextField;

	/**
	 * Accompanying Warning Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.accompanying_warning_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	accompanying_warning_title: prismic.KeyTextField;

	/**
	 * Accompanying Warning Description field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.accompanying_warning_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	accompanying_warning_description: prismic.KeyTextField;

	/**
	 * Label Assistance Reason field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_assistance_reason
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_assistance_reason: prismic.KeyTextField;

	/**
	 * Multiple Selections Allowed field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.multiple_selections_allowed
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	multiple_selections_allowed: prismic.KeyTextField;

	/**
	 * Contact Required Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.contact_required_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	contact_required_title: prismic.KeyTextField;

	/**
	 * Contact Required Description field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.contact_required_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	contact_required_description: prismic.KeyTextField;

	/**
	 * Special Support Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.special_support_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	special_support_title: prismic.KeyTextField;

	/**
	 * Special Support Description field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.special_support_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	special_support_description: prismic.KeyTextField;

	/**
	 * Wheelchair Questions Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.wheelchair_questions_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	wheelchair_questions_title: prismic.KeyTextField;

	/**
	 * Question Can Walk field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.question_can_walk
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	question_can_walk: prismic.KeyTextField;

	/**
	 * Question Can Use Stairs field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.question_can_use_stairs
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	question_can_use_stairs: prismic.KeyTextField;

	/**
	 * Question Need Onboard Wheelchair field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.question_need_onboard_wheelchair
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	question_need_onboard_wheelchair: prismic.KeyTextField;

	/**
	 * Question Reason For Wheelchair field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.question_reason_for_wheelchair
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	question_reason_for_wheelchair: prismic.KeyTextField;

	/**
	 * Question Bring Own Wheelchair field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.question_bring_own_wheelchair
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	question_bring_own_wheelchair: prismic.KeyTextField;

	/**
	 * Question Wheelchair Type field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.question_wheelchair_type
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	question_wheelchair_type: prismic.KeyTextField;

	/**
	 * Label Electric field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_electric
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_electric: prismic.KeyTextField;

	/**
	 * Label Manual field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_manual
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_manual: prismic.KeyTextField;

	/**
	 * Question Battery Removable field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.question_battery_removable
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	question_battery_removable: prismic.KeyTextField;

	/**
	 * Question Battery Type field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.question_battery_type
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	question_battery_type: prismic.KeyTextField;

	/**
	 * Question Wheelchair Foldable field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.question_wheelchair_foldable
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	question_wheelchair_foldable: prismic.KeyTextField;

	/**
	 * Wheelchair Dimensions Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.wheelchair_dimensions_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	wheelchair_dimensions_title: prismic.KeyTextField;

	/**
	 * Assistance Reason Illness field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.assistance_reason_illness
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	assistance_reason_illness: prismic.KeyTextField;

	/**
	 * Assistance Reason Visual field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.assistance_reason_visual
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	assistance_reason_visual: prismic.KeyTextField;

	/**
	 * Assistance Reason Medical Devices field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.assistance_reason_medical_devices
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	assistance_reason_medical_devices: prismic.KeyTextField;

	/**
	 * Assistance Reason Hearing field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.assistance_reason_hearing
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	assistance_reason_hearing: prismic.KeyTextField;

	/**
	 * Assistance Reason Wheelchair field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.assistance_reason_wheelchair
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	assistance_reason_wheelchair: prismic.KeyTextField;

	/**
	 * Assistance Reason Intellectual field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.assistance_reason_intellectual
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	assistance_reason_intellectual: prismic.KeyTextField;

	/**
	 * Wheelchair Reason Aftereffects field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.wheelchair_reason_aftereffects
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	wheelchair_reason_aftereffects: prismic.KeyTextField;

	/**
	 * Wheelchair Reason Illness field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.wheelchair_reason_illness
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	wheelchair_reason_illness: prismic.KeyTextField;

	/**
	 * Wheelchair Reason Old Age field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.wheelchair_reason_old_age
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	wheelchair_reason_old_age: prismic.KeyTextField;

	/**
	 * Wheelchair Reason Injury field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.wheelchair_reason_injury
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	wheelchair_reason_injury: prismic.KeyTextField;

	/**
	 * Wheelchair Reason Physical Disability field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.wheelchair_reason_physical_disability
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	wheelchair_reason_physical_disability: prismic.KeyTextField;

	/**
	 * Wheelchair Reason Weak Legs field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.wheelchair_reason_weak_legs
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	wheelchair_reason_weak_legs: prismic.KeyTextField;

	/**
	 * Battery Type Nickel Cadmium field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.battery_type_nickel_cadmium
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	battery_type_nickel_cadmium: prismic.KeyTextField;

	/**
	 * Battery Type Nickel Metal Hydride field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.battery_type_nickel_metal_hydride
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	battery_type_nickel_metal_hydride: prismic.KeyTextField;

	/**
	 * Battery Type Lithium Ion field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.battery_type_lithium_ion
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	battery_type_lithium_ion: prismic.KeyTextField;

	/**
	 * Battery Type Lead Acid field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.battery_type_lead_acid
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	battery_type_lead_acid: prismic.KeyTextField;

	/**
	 * Battery Type Gel Battery field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.battery_type_gel_battery
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	battery_type_gel_battery: prismic.KeyTextField;

	/**
	 * Battery Type Silicon Battery field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.battery_type_silicon_battery
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	battery_type_silicon_battery: prismic.KeyTextField;

	/**
	 * Label Yes field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_yes
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_yes: prismic.KeyTextField;

	/**
	 * Label No field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_no
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_no: prismic.KeyTextField;

	/**
	 * Title Numeric Characters Only field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.title_numeric_characters_only
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title_numeric_characters_only: prismic.KeyTextField;

	/**
	 * Title Uppercase Letters Only field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.title_uppercase_letters_only
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title_uppercase_letters_only: prismic.KeyTextField;

	/**
	 * Section Pregnant Customers field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.section_pregnant_customers
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	section_pregnant_customers: prismic.KeyTextField;

	/**
	 * Label Are You Pregnant field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_are_you_pregnant
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_are_you_pregnant: prismic.KeyTextField;

	/**
	 * Label Pregnancy Weeks field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_pregnancy_weeks
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_pregnancy_weeks: prismic.KeyTextField;

	/**
	 * Pregnancy Notice Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.pregnancy_notice_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	pregnancy_notice_title: prismic.KeyTextField;

	/**
	 * Pregnancy Notice 1 field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.pregnancy_notice_1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	pregnancy_notice_1: prismic.KeyTextField;

	/**
	 * Pregnancy Notice 2 field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.pregnancy_notice_2
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	pregnancy_notice_2: prismic.KeyTextField;

	/**
	 * Pregnancy Notice 3 field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.pregnancy_notice_3
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	pregnancy_notice_3: prismic.KeyTextField;

	/**
	 * Pregnancy Notice 4 field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.pregnancy_notice_4
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	pregnancy_notice_4: prismic.KeyTextField;

	/**
	 * Pregnancy Notice 5 field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.pregnancy_notice_5
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	pregnancy_notice_5: prismic.KeyTextField;

	/**
	 * Pregnancy Notice 6 field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.pregnancy_notice_6
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	pregnancy_notice_6: prismic.KeyTextField;

	/**
	 * Section Service Dogs field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.section_service_dogs
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	section_service_dogs: prismic.KeyTextField;

	/**
	 * Label Assistance Dogs field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_assistance_dogs
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_assistance_dogs: prismic.KeyTextField;

	/**
	 * Label Accompanied By Service Dog field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_accompanied_by_service_dog
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_accompanied_by_service_dog: prismic.KeyTextField;

	/**
	 * Label Service Dog Type field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_service_dog_type
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_service_dog_type: prismic.KeyTextField;

	/**
	 * Service Dog Type Guide field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_type_guide
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_type_guide: prismic.KeyTextField;

	/**
	 * Service Dog Type Assistance field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_type_assistance
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_type_assistance: prismic.KeyTextField;

	/**
	 * Service Dog Type Hearing field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_type_hearing
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_type_hearing: prismic.KeyTextField;

	/**
	 * Service Dog Type Psychiatric field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_type_psychiatric
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_type_psychiatric: prismic.KeyTextField;

	/**
	 * Service Dog Type Alert field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_type_alert
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_type_alert: prismic.KeyTextField;

	/**
	 * Service Dog Us Route Notice field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_us_route_notice
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_us_route_notice: prismic.KeyTextField;

	/**
	 * Label Dog Breed field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_dog_breed
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_dog_breed: prismic.KeyTextField;

	/**
	 * Label Dog Weight field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_dog_weight
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_dog_weight: prismic.KeyTextField;

	/**
	 * Label Cage Presence field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_cage_presence
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_cage_presence: prismic.KeyTextField;

	/**
	 * Label With Cage field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_with_cage
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_with_cage: prismic.KeyTextField;

	/**
	 * Label Without Cage field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_without_cage
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_without_cage: prismic.KeyTextField;

	/**
	 * Section Cage Size field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.section_cage_size
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	section_cage_size: prismic.KeyTextField;

	/**
	 * Label Height field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_height
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_height: prismic.KeyTextField;

	/**
	 * Label Width field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_width
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_width: prismic.KeyTextField;

	/**
	 * Label Depth field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_depth
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_depth: prismic.KeyTextField;

	/**
	 * Label Weight field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_weight
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_weight: prismic.KeyTextField;

	/**
	 * Error Service Dog Cage Height Min field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_cage_height_min
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_cage_height_min: prismic.KeyTextField;

	/**
	 * Error Service Dog Cage Width Min field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_cage_width_min
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_cage_width_min: prismic.KeyTextField;

	/**
	 * Error Service Dog Cage Depth Min field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_cage_depth_min
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_cage_depth_min: prismic.KeyTextField;

	/**
	 * Service Dog Note 1 field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_1: prismic.KeyTextField;

	/**
	 * Service Dog Note 2 Prefix field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_2_prefix
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_2_prefix: prismic.KeyTextField;

	/**
	 * Service Dog Note 2 Us Dot field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_2_us_dot
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_2_us_dot: prismic.KeyTextField;

	/**
	 * Service Dog Note 2 Middle field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_2_middle
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_2_middle: prismic.KeyTextField;

	/**
	 * Service Dog Note 2 Consent Form field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_2_consent_form
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_2_consent_form: prismic.KeyTextField;

	/**
	 * Service Dog Note 2 Suffix field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_2_suffix
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_2_suffix: prismic.KeyTextField;

	/**
	 * Service Dog Note 3 Prefix field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_3_prefix
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_3_prefix: prismic.KeyTextField;

	/**
	 * Service Dog Note 3 Us Dot field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_3_us_dot
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_3_us_dot: prismic.KeyTextField;

	/**
	 * Service Dog Note 3 Excretion field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_3_excretion
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_3_excretion: prismic.KeyTextField;

	/**
	 * Service Dog Note 3 Us Route field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_3_us_route
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_3_us_route: prismic.KeyTextField;

	/**
	 * Service Dog Note 3 Consent Form field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_3_consent_form
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_3_consent_form: prismic.KeyTextField;

	/**
	 * Service Dog Note 3 Canada Route field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_3_canada_route
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_3_canada_route: prismic.KeyTextField;

	/**
	 * Service Dog Note 3 Contact Center field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_3_contact_center
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_3_contact_center: prismic.KeyTextField;

	/**
	 * Service Dog Note 3 Suffix field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_3_suffix
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_3_suffix: prismic.KeyTextField;

	/**
	 * Service Dog Note 4 Prefix field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_4_prefix
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_4_prefix: prismic.KeyTextField;

	/**
	 * Service Dog Note 4 Cdc field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_4_cdc
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_4_cdc: prismic.KeyTextField;

	/**
	 * Service Dog Note 4 Suffix field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.service_dog_note_4_suffix
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_dog_note_4_suffix: prismic.KeyTextField;

	/**
	 * Section Other Travel Documents field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.section_other_travel_documents
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	section_other_travel_documents: prismic.KeyTextField;

	/**
	 * Travel Documents Description field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.travel_documents_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	travel_documents_description: prismic.KeyTextField;

	/**
	 * Travel Documents Deadline Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.travel_documents_deadline_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	travel_documents_deadline_title: prismic.KeyTextField;

	/**
	 * Travel Documents Deadline Message field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.travel_documents_deadline_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	travel_documents_deadline_message: prismic.KeyTextField;

	/**
	 * Label Redress Number field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_redress_number
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_redress_number: prismic.KeyTextField;

	/**
	 * Label Known Traveler Number field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_known_traveler_number
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_known_traveler_number: prismic.KeyTextField;

	/**
	 * Label Travel Documents field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_travel_documents
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_travel_documents: prismic.KeyTextField;

	/**
	 * Checkbox Other Travel Documents field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.checkbox_other_travel_documents
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	checkbox_other_travel_documents: prismic.KeyTextField;

	/**
	 * Label Document Type field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_document_type
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_document_type: prismic.KeyTextField;

	/**
	 * Label Document Number field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_document_number
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_document_number: prismic.KeyTextField;

	/**
	 * Placeholder Document Number field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.placeholder_document_number
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_document_number: prismic.KeyTextField;

	/**
	 * Placeholder Hotel Name field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.placeholder_hotel_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_hotel_name: prismic.KeyTextField;

	/**
	 * Placeholder City field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.placeholder_city
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_city: prismic.KeyTextField;

	/**
	 * Placeholder Postal Code field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.placeholder_postal_code
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_postal_code: prismic.KeyTextField;

	/**
	 * Placeholder State field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.placeholder_state
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_state: prismic.KeyTextField;

	/**
	 * Label Evus Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_evus_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_evus_required: prismic.KeyTextField;

	/**
	 * Label Document Expiry Date field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_document_expiry_date
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_document_expiry_date: prismic.KeyTextField;

	/**
	 * Label Issuing Country Region field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_issuing_country_region
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_issuing_country_region: prismic.KeyTextField;

	/**
	 * Label Purpose Of Travel field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_purpose_of_travel
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_purpose_of_travel: prismic.KeyTextField;

	/**
	 * Checkbox Evus Obtained field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.checkbox_evus_obtained
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	checkbox_evus_obtained: prismic.KeyTextField;

	/**
	 * Travel Document Us Route Notice field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.travel_document_us_route_notice
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	travel_document_us_route_notice: prismic.KeyTextField;

	/**
	 * Evus Warning 1 Prefix field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.evus_warning_1_prefix
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	evus_warning_1_prefix: prismic.KeyTextField;

	/**
	 * Evus Warning 1 Link field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.evus_warning_1_link
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	evus_warning_1_link: prismic.KeyTextField;

	/**
	 * Evus Warning 1 Suffix field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.evus_warning_1_suffix
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	evus_warning_1_suffix: prismic.KeyTextField;

	/**
	 * Evus Warning 2 field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.evus_warning_2
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	evus_warning_2: prismic.KeyTextField;

	/**
	 * Link Official Evus Website field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.link_official_evus_website
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	link_official_evus_website: prismic.KeyTextField;

	/**
	 * Error Document Expiry Date field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_document_expiry_date
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_document_expiry_date: prismic.KeyTextField;

	/**
	 * Placeholder Dd field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.placeholder_dd
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_dd: prismic.KeyTextField;

	/**
	 * Placeholder Mm field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.placeholder_mm
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_mm: prismic.KeyTextField;

	/**
	 * Placeholder Yyyy field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.placeholder_yyyy
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_yyyy: prismic.KeyTextField;

	/**
	 * Button Add Info field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.button_add_info
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_add_info: prismic.KeyTextField;

	/**
	 * Button Edit Info field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.button_edit_info
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_edit_info: prismic.KeyTextField;

	/**
	 * Visa Dialog Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.visa_dialog_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	visa_dialog_title: prismic.KeyTextField;

	/**
	 * Visa Dialog Description field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.visa_dialog_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	visa_dialog_description: prismic.KeyTextField;

	/**
	 * Button Enter Visa Information field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.button_enter_visa_information
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_enter_visa_information: prismic.KeyTextField;

	/**
	 * Button Confirmed Proceed Next Step field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.button_confirmed_proceed_next_step
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_confirmed_proceed_next_step: prismic.KeyTextField;

	/**
	 * Dialog Customer Information field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.dialog_customer_information
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dialog_customer_information: prismic.KeyTextField;

	/**
	 * Badge Primary Passenger field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.badge_primary_passenger
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	badge_primary_passenger: prismic.KeyTextField;

	/**
	 * Global Error Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.global_error_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	global_error_title: prismic.KeyTextField;

	/**
	 * Global Error Message field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.global_error_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	global_error_message: prismic.KeyTextField;

	/**
	 * Button Cancel field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.button_cancel
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_cancel: prismic.KeyTextField;

	/**
	 * Button Save Details field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.button_save_details
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_save_details: prismic.KeyTextField;

	/**
	 * Status Completed field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.status_completed
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	status_completed: prismic.KeyTextField;

	/**
	 * Customer Info Validation Error field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.customer_info_validation_error
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	customer_info_validation_error: prismic.KeyTextField;

	/**
	 * Section Precautions field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.section_precautions
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	section_precautions: prismic.KeyTextField;

	/**
	 * Precaution 1 field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.precaution_1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	precaution_1: prismic.KeyTextField;

	/**
	 * Precaution 2 field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.precaution_2
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	precaution_2: prismic.KeyTextField;

	/**
	 * Confirmation Passenger Details field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.confirmation_passenger_details
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	confirmation_passenger_details: prismic.KeyTextField;

	/**
	 * Confirmation Checkbox Error field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.confirmation_checkbox_error
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	confirmation_checkbox_error: prismic.KeyTextField;

	/**
	 * Label Total Amount field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.label_total_amount
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_total_amount: prismic.KeyTextField;

	/**
	 * Button Proceed field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.button_proceed
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_proceed: prismic.KeyTextField;

	/**
	 * Unsaved Changes Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.unsaved_changes_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	unsaved_changes_title: prismic.KeyTextField;

	/**
	 * Unsaved Changes Description field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.unsaved_changes_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	unsaved_changes_description: prismic.KeyTextField;

	/**
	 * Button Leave field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.button_leave
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_leave: prismic.KeyTextField;

	/**
	 * Passenger Type Code Adt field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passenger_type_code_adt
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_type_code_adt: prismic.KeyTextField;

	/**
	 * Passenger Type Code Chda field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passenger_type_code_chda
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_type_code_chda: prismic.KeyTextField;

	/**
	 * Passenger Type Code Chdb field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passenger_type_code_chdb
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_type_code_chdb: prismic.KeyTextField;

	/**
	 * Passenger Type Code Chdc field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passenger_type_code_chdc
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_type_code_chdc: prismic.KeyTextField;

	/**
	 * Passenger Type Code Inf field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.passenger_type_code_inf
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_type_code_inf: prismic.KeyTextField;

	/**
	 * Purpose Travel Study Abroad field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.purpose_travel_study_abroad
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	purpose_travel_study_abroad: prismic.KeyTextField;

	/**
	 * Purpose Travel Family Us Citizen field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.purpose_travel_family_us_citizen
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	purpose_travel_family_us_citizen: prismic.KeyTextField;

	/**
	 * Purpose Travel Exchange Visits field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.purpose_travel_exchange_visits
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	purpose_travel_exchange_visits: prismic.KeyTextField;

	/**
	 * Purpose Travel B1 B2 field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.purpose_travel_b1_b2
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	purpose_travel_b1_b2: prismic.KeyTextField;

	/**
	 * Purpose Travel Other field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.purpose_travel_other
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	purpose_travel_other: prismic.KeyTextField;

	/**
	 * Document Type Visa field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.document_type_visa
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	document_type_visa: prismic.KeyTextField;

	/**
	 * Document Type Permanent Residence field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.document_type_permanent_residence
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	document_type_permanent_residence: prismic.KeyTextField;

	/**
	 * Document Type Resident Alien Card field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.document_type_resident_alien_card
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	document_type_resident_alien_card: prismic.KeyTextField;

	/**
	 * Document Type Us Military Id field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.document_type_us_military_id
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	document_type_us_military_id: prismic.KeyTextField;

	/**
	 * Document Expiry Day Aria Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.document_expiry_day_aria_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	document_expiry_day_aria_label: prismic.KeyTextField;

	/**
	 * Document Expiry Month Aria Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.document_expiry_month_aria_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	document_expiry_month_aria_label: prismic.KeyTextField;

	/**
	 * Document Expiry Year Aria Label field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.document_expiry_year_aria_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	document_expiry_year_aria_label: prismic.KeyTextField;

	/**
	 * Error Last Name Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_last_name_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_last_name_required: prismic.KeyTextField;

	/**
	 * Error Input Max Length field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_input_max_length
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_input_max_length: prismic.KeyTextField;

	/**
	 * Error Input Half Width Alphabet field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_input_half_width_alphabet
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_input_half_width_alphabet: prismic.KeyTextField;

	/**
	 * Error Input Alpha Numeric Characters field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_input_alpha_numeric_characters
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_input_alpha_numeric_characters: prismic.KeyTextField;

	/**
	 * Error Input Half Width Number field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_input_half_width_number
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_input_half_width_number: prismic.KeyTextField;

	/**
	 * Error First Name Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_first_name_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_first_name_required: prismic.KeyTextField;

	/**
	 * Error Gender Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_gender_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_gender_required: prismic.KeyTextField;

	/**
	 * Error Nationality Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_nationality_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_nationality_required: prismic.KeyTextField;

	/**
	 * Error Passport Number Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_passport_number_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_passport_number_required: prismic.KeyTextField;

	/**
	 * Error Passport Number Min Max Length field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_passport_number_min_max_length
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_passport_number_min_max_length: prismic.KeyTextField;

	/**
	 * Error Email Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_email_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_email_required: prismic.KeyTextField;

	/**
	 * Error Email Invalid field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_email_invalid
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_email_invalid: prismic.KeyTextField;

	/**
	 * Error Email Confirmation Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_email_confirmation_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_email_confirmation_required: prismic.KeyTextField;

	/**
	 * Error Email Confirmation Not Equal field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_email_confirmation_not_equal
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_email_confirmation_not_equal: prismic.KeyTextField;

	/**
	 * Error Date Of Birth Incorrect field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_date_of_birth_incorrect
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_date_of_birth_incorrect: prismic.KeyTextField;

	/**
	 * Error Date Of Birth Under 1 Year field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_date_of_birth_under_1_year
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_date_of_birth_under_1_year: prismic.KeyTextField;

	/**
	 * Error Body Weight Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_body_weight_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_body_weight_required: prismic.KeyTextField;

	/**
	 * Error Body Height Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_body_height_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_body_height_required: prismic.KeyTextField;

	/**
	 * Error Phone Extension Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_phone_extension_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_phone_extension_required: prismic.KeyTextField;

	/**
	 * Error Phone Number Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_phone_number_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_phone_number_required: prismic.KeyTextField;

	/**
	 * Error Phone Number Min Max Length field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_phone_number_min_max_length
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_phone_number_min_max_length: prismic.KeyTextField;

	/**
	 * Error Emergency Number Same As Phone Number field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_emergency_number_same_as_phone_number
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_emergency_number_same_as_phone_number: prismic.KeyTextField;

	/**
	 * Error Email Invalid For Us Canada field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_email_invalid_for_us_canada
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_email_invalid_for_us_canada: prismic.KeyTextField;

	/**
	 * Error Input Half Width Alpha Numeric With Space field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_input_half_width_alpha_numeric_with_space
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_input_half_width_alpha_numeric_with_space: prismic.KeyTextField;

	/**
	 * Error Address Input Max Length field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_address_input_max_length
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_address_input_max_length: prismic.KeyTextField;

	/**
	 * Error Address Input Half Width Number field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_address_input_half_width_number
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_address_input_half_width_number: prismic.KeyTextField;

	/**
	 * Error Postal Code Length field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_postal_code_length
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_postal_code_length: prismic.KeyTextField;

	/**
	 * Error City Length field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_city_length
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_city_length: prismic.KeyTextField;

	/**
	 * Error State Length field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_state_length
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_state_length: prismic.KeyTextField;

	/**
	 * Error Emergency Number Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_emergency_number_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_emergency_number_required: prismic.KeyTextField;

	/**
	 * Error County Of Residence Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_county_of_residence_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_county_of_residence_required: prismic.KeyTextField;

	/**
	 * Error Input Alpha Numeric Only field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_input_alpha_numeric_only
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_input_alpha_numeric_only: prismic.KeyTextField;

	/**
	 * Error Redress Number Length field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_redress_number_length
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_redress_number_length: prismic.KeyTextField;

	/**
	 * Error Known Traveler Number Length field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_known_traveler_number_length
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_known_traveler_number_length: prismic.KeyTextField;

	/**
	 * Error Evus Obtained Check Box field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_evus_obtained_check_box
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_evus_obtained_check_box: prismic.KeyTextField;

	/**
	 * Error Purpose Of Travel Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_purpose_of_travel_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_purpose_of_travel_required: prismic.KeyTextField;

	/**
	 * Error Issuing Country Privacy Policy field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_issuing_country_privacy_policy
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_issuing_country_privacy_policy: prismic.KeyTextField;

	/**
	 * Error Document Expiry Date After Arrival field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_document_expiry_date_after_arrival
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_document_expiry_date_after_arrival: prismic.KeyTextField;

	/**
	 * Error Document Expiry Date Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_document_expiry_date_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_document_expiry_date_required: prismic.KeyTextField;

	/**
	 * Error Document Number Min Max Length field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_document_number_min_max_length
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_document_number_min_max_length: prismic.KeyTextField;

	/**
	 * Error Document Number Alpha Numeric field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_document_number_alpha_numeric
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_document_number_alpha_numeric: prismic.KeyTextField;

	/**
	 * Error Document Number Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_document_number_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_document_number_required: prismic.KeyTextField;

	/**
	 * Error Document Type Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_document_type_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_document_type_required: prismic.KeyTextField;

	/**
	 * Error Passport Expiry Date Past Date field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_passport_expiry_date_past_date
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_passport_expiry_date_past_date: prismic.KeyTextField;

	/**
	 * Error Pregnancy Gestational Weeks Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_pregnancy_gestational_weeks_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_pregnancy_gestational_weeks_required: prismic.KeyTextField;

	/**
	 * Error Pregnany Gestational Weeks Only Numbers field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_pregnany_gestational_weeks_only_numbers
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_pregnany_gestational_weeks_only_numbers: prismic.KeyTextField;

	/**
	 * Error Pregnancy Gestational Weeks Length field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_pregnancy_gestational_weeks_length
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_pregnancy_gestational_weeks_length: prismic.KeyTextField;

	/**
	 * Error Can Manage Personal Needs Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_can_manage_personal_needs_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_can_manage_personal_needs_required: prismic.KeyTextField;

	/**
	 * Error Boarding With Accompanion Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_boarding_with_accompanion_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_boarding_with_accompanion_required: prismic.KeyTextField;

	/**
	 * Error Boarding With Accompanion Block Proceed field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_boarding_with_accompanion_block_proceed
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_boarding_with_accompanion_block_proceed: prismic.KeyTextField;

	/**
	 * Error Assistance Reasons Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_assistance_reasons_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_assistance_reasons_required: prismic.KeyTextField;

	/**
	 * Error Assistance Reason Block Proceed field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_assistance_reason_block_proceed
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_assistance_reason_block_proceed: prismic.KeyTextField;

	/**
	 * Error Accompanying Person Name Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_accompanying_person_name_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_accompanying_person_name_required: prismic.KeyTextField;

	/**
	 * Error Accompanying Person Name Uppercase field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_accompanying_person_name_uppercase
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_accompanying_person_name_uppercase: prismic.KeyTextField;

	/**
	 * Error Accompanying Person Name Length field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_accompanying_person_name_length
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_accompanying_person_name_length: prismic.KeyTextField;

	/**
	 * Error Can Walk Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_can_walk_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_can_walk_required: prismic.KeyTextField;

	/**
	 * Error Can Go Upstairs Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_can_go_upstairs_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_can_go_upstairs_required: prismic.KeyTextField;

	/**
	 * Error Needs Onboard Wheelchair Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_needs_onboard_wheelchair_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_needs_onboard_wheelchair_required: prismic.KeyTextField;

	/**
	 * Error Reason For Wheelchair Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_reason_for_wheelchair_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_reason_for_wheelchair_required: prismic.KeyTextField;

	/**
	 * Error Bringing Own Wheelchair Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_bringing_own_wheelchair_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_bringing_own_wheelchair_required: prismic.KeyTextField;

	/**
	 * Error Wheelchair Type Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_wheelchair_type_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_wheelchair_type_required: prismic.KeyTextField;

	/**
	 * Error Is Foldable Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_is_foldable_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_is_foldable_required: prismic.KeyTextField;

	/**
	 * Error Wheelchair Battery Removable Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_wheelchair_battery_removable_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_wheelchair_battery_removable_required: prismic.KeyTextField;

	/**
	 * Error Wheelchair Battery Type Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_wheelchair_battery_type_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_wheelchair_battery_type_required: prismic.KeyTextField;

	/**
	 * Error Service Dog Cage Height Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_cage_height_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_cage_height_required: prismic.KeyTextField;

	/**
	 * Error Service Dog Cage Height Numbers Only field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_cage_height_numbers_only
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_cage_height_numbers_only: prismic.KeyTextField;

	/**
	 * Error Service Dog Cage Width Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_cage_width_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_cage_width_required: prismic.KeyTextField;

	/**
	 * Error Service Dog Cage Width Numbers Only field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_cage_width_numbers_only
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_cage_width_numbers_only: prismic.KeyTextField;

	/**
	 * Error Service Dog Cage Depth Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_cage_depth_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_cage_depth_required: prismic.KeyTextField;

	/**
	 * Error Service Dog Cage Depth Numbers Only field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_cage_depth_numbers_only
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_cage_depth_numbers_only: prismic.KeyTextField;

	/**
	 * Error Service Dog Cage Weight Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_cage_weight_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_cage_weight_required: prismic.KeyTextField;

	/**
	 * Error Service Dog Cage Weight Numbers Only field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_cage_weight_numbers_only
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_cage_weight_numbers_only: prismic.KeyTextField;

	/**
	 * Error Service Dog Cage Weight Range field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_cage_weight_range
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_cage_weight_range: prismic.KeyTextField;

	/**
	 * Error Service Dog Type Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_type_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_type_required: prismic.KeyTextField;

	/**
	 * Error Service Dog Breed Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_breed_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_breed_required: prismic.KeyTextField;

	/**
	 * Error Service Dog Breed Uppercase field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_breed_uppercase
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_breed_uppercase: prismic.KeyTextField;

	/**
	 * Error Service Dog Breed Length field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_breed_length
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_breed_length: prismic.KeyTextField;

	/**
	 * Error Service Dog Weight Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_weight_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_weight_required: prismic.KeyTextField;

	/**
	 * Error Service Dog Weight Only Numbers field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_weight_only_numbers
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_weight_only_numbers: prismic.KeyTextField;

	/**
	 * Error Service Dog Weight Min field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_weight_min
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_weight_min: prismic.KeyTextField;

	/**
	 * Error Service Dog Weight Min Max field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_weight_min_max
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_weight_min_max: prismic.KeyTextField;

	/**
	 * Error Service Dog Presence Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_presence_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_presence_required: prismic.KeyTextField;

	/**
	 * Error Wheel Chair Dimension Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_wheel_chair_dimension_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_wheel_chair_dimension_required: prismic.KeyTextField;

	/**
	 * Error Wheel Chair Dimension Only Numbers field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_wheel_chair_dimension_only_numbers
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_wheel_chair_dimension_only_numbers: prismic.KeyTextField;

	/**
	 * Error Wheel Chair Dimension Min Max field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_wheel_chair_dimension_min_max
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_wheel_chair_dimension_min_max: prismic.KeyTextField;

	/**
	 * Error Service Dog Cage Dimensions Sum Exceeded field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.error_service_dog_cage_dimensions_sum_exceeded
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_service_dog_cage_dimensions_sum_exceeded: prismic.KeyTextField;

	/**
	 * Title Service Dog Cage Required field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.title_service_dog_cage_required
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title_service_dog_cage_required: prismic.KeyTextField;

	/**
	 * Title field in *Customer Information Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customer_information_page.title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
}

/**
 * Customer Information Page document from Prismic
 *
 * - **API ID**: `customer_information_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type CustomerInformationPageDocument<Lang extends string = string> =
	prismic.PrismicDocumentWithoutUID<
		Simplify<CustomerInformationPageDocumentData>,
		"customer_information_page",
		Lang
	>;

/**
 * Content for Customize documents
 */
interface CustomizeDocumentData {
	/**
	 * Lounge Title field in *Customize*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customize.lounge_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	lounge_title: prismic.KeyTextField;

	/**
	 * Lounge Description field in *Customize*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: customize.lounge_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	lounge_description: prismic.KeyTextField;
}

/**
 * Customize document from Prismic
 *
 * - **API ID**: `customize`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type CustomizeDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<
	Simplify<CustomizeDocumentData>,
	"customize",
	Lang
>;

/**
 * Content for Express Service documents
 */
interface ExpressServiceDocumentData {
	/**
	 * Express Title field in *Express Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: express_service.express_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	express_title: prismic.KeyTextField;

	/**
	 * Express Dialog Title field in *Express Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: express_service.express_dialog_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	express_dialog_title: prismic.KeyTextField;

	/**
	 * Express Bullet 1 field in *Express Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: express_service.express_bullet_1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	express_bullet_1: prismic.KeyTextField;

	/**
	 * Express Bullet 2 field in *Express Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: express_service.express_bullet_2
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	express_bullet_2: prismic.KeyTextField;

	/**
	 * Express Bullet 3 field in *Express Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: express_service.express_bullet_3
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	express_bullet_3: prismic.KeyTextField;

	/**
	 * Express Bullet 4 field in *Express Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: express_service.express_bullet_4
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	express_bullet_4: prismic.KeyTextField;

	/**
	 * Express Bullet 5 field in *Express Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: express_service.express_bullet_5
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	express_bullet_5: prismic.KeyTextField;

	/**
	 * Express Bullet 6 field in *Express Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: express_service.express_bullet_6
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	express_bullet_6: prismic.KeyTextField;

	/**
	 * Express Note field in *Express Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: express_service.express_note
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	express_note: prismic.KeyTextField;

	/**
	 * Express Confirm field in *Express Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: express_service.express_confirm
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	express_confirm: prismic.KeyTextField;

	/**
	 * Remaining Stocks Label field in *Express Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: express_service.remaining_stocks_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	remaining_stocks_label: prismic.KeyTextField;

	/**
	 * Out Of Stock Message field in *Express Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: express_service.out_of_stock_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	out_of_stock_message: prismic.KeyTextField;

	/**
	 * Express Warning Title field in *Express Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: express_service.express_warning_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	express_warning_title: prismic.KeyTextField;

	/**
	 * Express Warning Message1 field in *Express Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: express_service.express_warning_message1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	express_warning_message1: prismic.KeyTextField;

	/**
	 * Express Warning Message2 field in *Express Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: express_service.express_warning_message2
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	express_warning_message2: prismic.KeyTextField;
}

/**
 * Express Service document from Prismic
 *
 * - **API ID**: `express_service`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type ExpressServiceDocument<Lang extends string = string> =
	prismic.PrismicDocumentWithoutUID<Simplify<ExpressServiceDocumentData>, "express_service", Lang>;

/**
 * Content for Extras Page documents
 */
interface ExtrasPageDocumentData {
	/**
	 * Choose By Category field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.choose_by_category
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	choose_by_category: prismic.KeyTextField;

	/**
	 * Choose Ancillary Services field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.choose_ancillary_services
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	choose_ancillary_services: prismic.KeyTextField;

	/**
	 * Category All field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.category_all
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	category_all: prismic.KeyTextField;

	/**
	 * Category Special Offers field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.category_special_offers
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	category_special_offers: prismic.KeyTextField;

	/**
	 * Category Airport Services field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.category_airport_services
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	category_airport_services: prismic.KeyTextField;

	/**
	 * Category Amenities field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.category_amenities
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	category_amenities: prismic.KeyTextField;

	/**
	 * Category Food Souvenirs field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.category_food_souvenirs
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	category_food_souvenirs: prismic.KeyTextField;

	/**
	 * Category Snacks Souvenirs field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.category_snacks_souvenirs
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	category_snacks_souvenirs: prismic.KeyTextField;

	/**
	 * Category Clothes Cosmetics field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.category_clothes_cosmetics
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	category_clothes_cosmetics: prismic.KeyTextField;

	/**
	 * Category Others field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.category_others
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	category_others: prismic.KeyTextField;

	/**
	 * Modal Title field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.modal_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	modal_title: prismic.KeyTextField;

	/**
	 * For Information field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.for_information
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	for_information: prismic.KeyTextField;

	/**
	 * Select Customers field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.select_customers
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	select_customers: prismic.KeyTextField;

	/**
	 * Confirm Selection field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.confirm_selection
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	confirm_selection: prismic.KeyTextField;

	/**
	 * Total Amount field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.total_amount
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	total_amount: prismic.KeyTextField;

	/**
	 * Proceed field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.proceed
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	proceed: prismic.KeyTextField;

	/**
	 * Page Title Outbound field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.page_title_outbound
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	page_title_outbound: prismic.KeyTextField;

	/**
	 * Page Title Inbound field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.page_title_inbound
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	page_title_inbound: prismic.KeyTextField;

	/**
	 * Page Title Segment1 field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.page_title_segment1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	page_title_segment1: prismic.KeyTextField;

	/**
	 * Page Title Segment2 field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.page_title_segment2
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	page_title_segment2: prismic.KeyTextField;

	/**
	 * Included In Set field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.included_in_set
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	included_in_set: prismic.KeyTextField /**
	 * Deadline Error field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.deadline_error
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	deadline_error: prismic.KeyTextField;

	/**
	 * Bundle Ancillary Deadline Error field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.bundle_ancillary_deadline_error
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_ancillary_deadline_error: prismic.KeyTextField;

	/**
	 * Service Unavailable Title field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.service_unavailable_title
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_unavailable_title: prismic.KeyTextField;

	/**
	 * Service Unavailable Description field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.service_unavailable_description
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_unavailable_description: prismic.KeyTextField;

	/**
	 * Exceeds Available Stock Title field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.exceeds_available_stock_title
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	exceeds_available_stock_title: prismic.KeyTextField;

	/**
	 * Out Of Stock Description field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.out_of_stock_description
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	out_of_stock_description: prismic.KeyTextField;

	/**
	 * Empty Response field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.empty_response
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	empty_response: prismic.KeyTextField;

	/**
	 * Out Of Stock field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.out_of_stock
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	out_of_stock: prismic.KeyTextField /**
	 * Back Button field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.back_button
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	back_button: prismic.KeyTextField;

	/**
	 * Previous Image Button field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.previous_image_button
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	previous_image_button: prismic.KeyTextField;

	/**
	 * Next Image Button field in *Extras Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: extras_page.next_image_button
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	next_image_button: prismic.KeyTextField;
}

/**
 * Extras Page document from Prismic
 *
 * - **API ID**: `extras_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type ExtrasPageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<
	Simplify<ExtrasPageDocumentData>,
	"extras_page",
	Lang
>;

/**
 * Item in *Flight Search Page → Airports*
 */
export interface FlightSearchPageDocumentDataAirportsItem {
	/**
	 * Iata Code field in *Flight Search Page → Airports*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.airports[].iata_code
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	iata_code: prismic.KeyTextField;

	/**
	 * Airport field in *Flight Search Page → Airports*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.airports[].airport
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	airport: prismic.KeyTextField;

	/**
	 * City field in *Flight Search Page → Airports*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.airports[].city
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	city: prismic.KeyTextField;

	/**
	 * Country field in *Flight Search Page → Airports*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.airports[].country
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	country: prismic.KeyTextField;

	/**
	 * Display Order field in *Flight Search Page → Airports*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.airports[].display_order
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	display_order: prismic.KeyTextField;
}

/**
 * Content for Flight Search Page documents
 */
interface FlightSearchPageDocumentData {
	/**
	 * Label Promocode field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.label_promocode
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_promocode: prismic.KeyTextField;

	/**
	 * Label Search field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.label_search
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_search: prismic.KeyTextField;

	/**
	 * System Error Title field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.system_error_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	system_error_title: prismic.KeyTextField;

	/**
	 * Airports field in *Flight Search Page*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.airports[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	airports: prismic.GroupField<Simplify<FlightSearchPageDocumentDataAirportsItem>>;

	/**
	 * Error Description field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.error_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_description: prismic.KeyTextField;

	/**
	 * Error Reload field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.error_reload
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_reload: prismic.KeyTextField;

	/**
	 * Label Round Trip field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.label_round_trip
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_round_trip: prismic.KeyTextField;

	/**
	 * Label One Way field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.label_one_way
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_one_way: prismic.KeyTextField;

	/**
	 * Placeholder Departure field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.placeholder_departure
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_departure: prismic.KeyTextField;

	/**
	 * Placeholder Arrival field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.placeholder_arrival
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_arrival: prismic.KeyTextField;

	/**
	 * Placeholder Promotion Code field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.placeholder_promotion_code
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_promotion_code: prismic.KeyTextField;

	/**
	 * Departure Modal Heading field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.departure_modal_heading
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	departure_modal_heading: prismic.KeyTextField;

	/**
	 * Arrival Modal Heading field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.arrival_modal_heading
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	arrival_modal_heading: prismic.KeyTextField /**
	 * NEXUZR002E050 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.NEXUZR002E050
	 * - **Tab**: Error Titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	NEXUZR002E050: prismic.KeyTextField;

	/**
	 * NEXUZR002E051 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.NEXUZR002E051
	 * - **Tab**: Error Titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZR002E051: prismic.KeyTextField;

	/**
	 * NEXUZR002E052 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.NEXUZR002E052
	 * - **Tab**: Error Titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZR002E052: prismic.KeyTextField;

	/**
	 * NEXUZCMNE001 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.NEXUZCMNE001
	 * - **Tab**: Error Titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZCMNE001: prismic.KeyTextField;

	/**
	 * NEXUZCMNE002 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.NEXUZCMNE002
	 * - **Tab**: Error Titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZCMNE002: prismic.KeyTextField;

	/**
	 * NEXUZCMNE003 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.NEXUZCMNE003
	 * - **Tab**: Error Titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZCMNE003: prismic.KeyTextField;

	/**
	 * NEXUZR001E001 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.NEXUZR001E001
	 * - **Tab**: Error Titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZR001E001: prismic.KeyTextField;

	/**
	 * NEXUZR002E001 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.NEXUZR002E001
	 * - **Tab**: Error Titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZR002E001: prismic.KeyTextField /**
	 * Max Passengers Error field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.max_passengers_error
	 * - **Tab**: Validation
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	max_passengers_error: prismic.KeyTextField;

	/**
	 * Infant Per Adult Error field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.infant_per_adult_error
	 * - **Tab**: Validation
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	infant_per_adult_error: prismic.KeyTextField;

	/**
	 * Child Infant Per Adult Error field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.child_infant_per_adult_error
	 * - **Tab**: Validation
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	child_infant_per_adult_error: prismic.KeyTextField;

	/**
	 * Combined Children Per Adult Error field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.combined_children_per_adult_error
	 * - **Tab**: Validation
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	combined_children_per_adult_error: prismic.KeyTextField;

	/**
	 * Combined Infant Per Adult Error field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.combined_infant_per_adult_error
	 * - **Tab**: Validation
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	combined_infant_per_adult_error: prismic.KeyTextField;

	/**
	 * Vancouver Route Error field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.vancouver_route_error
	 * - **Tab**: Validation
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	vancouver_route_error: prismic.KeyTextField;

	/**
	 * Validation Travel Dates Error field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.validation_travel_dates_error
	 * - **Tab**: Validation
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	validation_travel_dates_error: prismic.KeyTextField;

	/**
	 * Passenger Error Heading field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.passenger_error_heading
	 * - **Tab**: Validation
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_error_heading: prismic.KeyTextField;

	/**
	 * Origin Required field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.origin_required
	 * - **Tab**: Validation
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	origin_required: prismic.KeyTextField;

	/**
	 * Destination Required field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.destination_required
	 * - **Tab**: Validation
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	destination_required: prismic.KeyTextField;

	/**
	 * Promotion Code Max field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.promotion_code_max
	 * - **Tab**: Validation
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	promotion_code_max: prismic.KeyTextField;

	/**
	 * Promotion Code Pattern field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.promotion_code_pattern
	 * - **Tab**: Validation
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	promotion_code_pattern: prismic.KeyTextField /**
	 * Label Enter Code field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.label_enter_code
	 * - **Tab**: Promo Code
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	label_enter_code: prismic.KeyTextField /**
	 * Via Tokyo Narita field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.via_tokyo_narita
	 * - **Tab**: Menu Item
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	via_tokyo_narita: prismic.KeyTextField /**
	 * Default Origin Title field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.default_origin_title
	 * - **Tab**: Location Section
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	default_origin_title: prismic.KeyTextField;

	/**
	 * Default Origin Subtitle field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.default_origin_subtitle
	 * - **Tab**: Location Section
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	default_origin_subtitle: prismic.KeyTextField;

	/**
	 * Default Arrival Title field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.default_arrival_title
	 * - **Tab**: Location Section
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	default_arrival_title: prismic.KeyTextField;

	/**
	 * Error Select Arrival field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.error_select_arrival
	 * - **Tab**: Location Section
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_select_arrival: prismic.KeyTextField /**
	 * Arrival Not Selected field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.arrival_not_selected
	 * - **Tab**: Tooltip
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	arrival_not_selected: prismic.KeyTextField;

	/**
	 * Arrival Selected field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.arrival_selected
	 * - **Tab**: Tooltip
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	arrival_selected: prismic.KeyTextField;

	/**
	 * Departure Selected field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.departure_selected
	 * - **Tab**: Tooltip
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	departure_selected: prismic.KeyTextField /**
	 * Passenger Modal Heading field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.passenger_modal_heading
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	passenger_modal_heading: prismic.KeyTextField;

	/**
	 * Header Title field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.header_title
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	header_title: prismic.KeyTextField;

	/**
	 * Summary Single field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.summary_single
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	summary_single: prismic.KeyTextField;

	/**
	 * Summary Multiple field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.summary_multiple
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	summary_multiple: prismic.KeyTextField;

	/**
	 * Error Multiple field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.error_multiple
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_multiple: prismic.KeyTextField;

	/**
	 * Label Adult field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.label_adult
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_adult: prismic.KeyTextField;

	/**
	 * Description Adult field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.description_adult
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	description_adult: prismic.KeyTextField;

	/**
	 * Label Child Infant field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.label_child_infant
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_child_infant: prismic.KeyTextField;

	/**
	 * Label Child 12 14 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.label_child_12_14
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_child_12_14: prismic.KeyTextField;

	/**
	 * Label Child 7 11 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.label_child_7_11
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_child_7_11: prismic.KeyTextField;

	/**
	 * Label Child 2 6 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.label_child_2_6
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_child_2_6: prismic.KeyTextField;

	/**
	 * Label Infant 0 1 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.label_infant_0_1
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label_infant_0_1: prismic.KeyTextField;

	/**
	 * Description Infant 0 1 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.description_infant_0_1
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	description_infant_0_1: prismic.KeyTextField;

	/**
	 * Button Confirm Selection field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.button_confirm_selection
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_confirm_selection: prismic.KeyTextField;

	/**
	 * Passenger Modal Bullet1 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.passenger_modal_bullet1
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_modal_bullet1: prismic.KeyTextField;

	/**
	 * Passenger Modal Bullet2 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.passenger_modal_bullet2
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_modal_bullet2: prismic.KeyTextField;

	/**
	 * Passenger Modal Bullet3 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.passenger_modal_bullet3
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_modal_bullet3: prismic.KeyTextField;

	/**
	 * Passenger Modal Bullet4 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.passenger_modal_bullet4
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_modal_bullet4: prismic.KeyTextField;

	/**
	 * Link Assistance field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.link_assistance
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	link_assistance: prismic.KeyTextField;

	/**
	 * Link Faq field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.link_faq
	 * - **Tab**: Passenger Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	link_faq: prismic.KeyTextField /**
	 * Child Alert Heading field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.child_alert_heading
	 * - **Tab**: Child Alert
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	child_alert_heading: prismic.KeyTextField;

	/**
	 * Child Alert Bullet1 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.child_alert_bullet1
	 * - **Tab**: Child Alert
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	child_alert_bullet1: prismic.KeyTextField;

	/**
	 * Child Alert Bullet2 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.child_alert_bullet2
	 * - **Tab**: Child Alert
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	child_alert_bullet2: prismic.KeyTextField;

	/**
	 * Child Alert Bullet3 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.child_alert_bullet3
	 * - **Tab**: Child Alert
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	child_alert_bullet3: prismic.KeyTextField;

	/**
	 * Child Alert Bullet4 field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.child_alert_bullet4
	 * - **Tab**: Child Alert
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	child_alert_bullet4: prismic.KeyTextField;

	/**
	 * Button Child Seat field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.button_child_seat
	 * - **Tab**: Child Alert
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_child_seat: prismic.KeyTextField;

	/**
	 * Button Contact Center field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.button_contact_center
	 * - **Tab**: Child Alert
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_contact_center: prismic.KeyTextField /**
	 * Date Title field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.date_title
	 * - **Tab**: Date Reset Dialog
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	date_title: prismic.KeyTextField;

	/**
	 * Date Description field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.date_description
	 * - **Tab**: Date Reset Dialog
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	date_description: prismic.KeyTextField;

	/**
	 * Date Reset Dialog Button Cancel field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.date_reset_dialog_button_cancel
	 * - **Tab**: Date Reset Dialog
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	date_reset_dialog_button_cancel: prismic.KeyTextField;

	/**
	 * Button Confirm field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.button_confirm
	 * - **Tab**: Date Reset Dialog
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_confirm: prismic.KeyTextField /**
	 * Passport Modal Heading field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.passport_modal_heading
	 * - **Tab**: Passport Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	passport_modal_heading: prismic.KeyTextField;

	/**
	 * Header Description field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.header_description
	 * - **Tab**: Passport Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	header_description: prismic.KeyTextField;

	/**
	 * Item Passport Number field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.item_passport_number
	 * - **Tab**: Passport Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	item_passport_number: prismic.KeyTextField;

	/**
	 * Item Expiry Date field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.item_expiry_date
	 * - **Tab**: Passport Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	item_expiry_date: prismic.KeyTextField;

	/**
	 * Note Travel Period field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.note_travel_period
	 * - **Tab**: Passport Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	note_travel_period: prismic.KeyTextField;

	/**
	 * Item Date Of Birth field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.item_date_of_birth
	 * - **Tab**: Passport Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	item_date_of_birth: prismic.KeyTextField;

	/**
	 * Item Nationality Region field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.item_nationality_region
	 * - **Tab**: Passport Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	item_nationality_region: prismic.KeyTextField;

	/**
	 * Passport Modal Button Cancel field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.passport_modal_button_cancel
	 * - **Tab**: Passport Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passport_modal_button_cancel: prismic.KeyTextField;

	/**
	 * Button Next field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.button_next
	 * - **Tab**: Passport Modal
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_next: prismic.KeyTextField /**
	 * Trigger Label field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.trigger_label
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	trigger_label: prismic.KeyTextField;

	/**
	 * No Travel Date Tooltip field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.no_travel_date_tooltip
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	no_travel_date_tooltip: prismic.KeyTextField;

	/**
	 * Dialog Title field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.dialog_title
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dialog_title: prismic.KeyTextField;

	/**
	 * Close Button Label field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.close_button_label
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	close_button_label: prismic.KeyTextField;

	/**
	 * Legend Button Label field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.legend_button_label
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	legend_button_label: prismic.KeyTextField;

	/**
	 * Legend Title field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.legend_title
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	legend_title: prismic.KeyTextField;

	/**
	 * Legend Close Button Label field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.legend_close_button_label
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	legend_close_button_label: prismic.KeyTextField;

	/**
	 * Legend Close Button Aria Label field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.legend_close_button_aria_label
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	legend_close_button_aria_label: prismic.KeyTextField;

	/**
	 * Child Alert Message field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.child_alert_message
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	child_alert_message: prismic.KeyTextField;

	/**
	 * Return Date Error Message field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.return_date_error_message
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	return_date_error_message: prismic.KeyTextField;

	/**
	 * Calendar Travel Dates Error field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.calendar_travel_dates_error
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_travel_dates_error: prismic.KeyTextField;

	/**
	 * Seat Type Label field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.seat_type_label
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_type_label: prismic.KeyTextField;

	/**
	 * Seat Type Standard field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.seat_type_standard
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_type_standard: prismic.KeyTextField;

	/**
	 * Seat Type Zip field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.seat_type_zip
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_type_zip: prismic.KeyTextField;

	/**
	 * Tab Outbound field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.tab_outbound
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	tab_outbound: prismic.KeyTextField;

	/**
	 * Tab Return field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.tab_return
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	tab_return: prismic.KeyTextField;

	/**
	 * Previous Month Label field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.previous_month_label
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	previous_month_label: prismic.KeyTextField;

	/**
	 * Next Month Label field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.next_month_label
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	next_month_label: prismic.KeyTextField;

	/**
	 * Day Initial Sunday field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.day_initial_sunday
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	day_initial_sunday: prismic.KeyTextField;

	/**
	 * Day Initial Monday field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.day_initial_monday
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	day_initial_monday: prismic.KeyTextField;

	/**
	 * Day Initial Tuesday field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.day_initial_tuesday
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	day_initial_tuesday: prismic.KeyTextField;

	/**
	 * Day Initial Wednesday field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.day_initial_wednesday
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	day_initial_wednesday: prismic.KeyTextField;

	/**
	 * Day Initial Thursday field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.day_initial_thursday
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	day_initial_thursday: prismic.KeyTextField;

	/**
	 * Day Initial Friday field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.day_initial_friday
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	day_initial_friday: prismic.KeyTextField;

	/**
	 * Day Initial Saturday field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.day_initial_saturday
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	day_initial_saturday: prismic.KeyTextField;

	/**
	 * Month January field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.month_january
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_january: prismic.KeyTextField;

	/**
	 * Month February field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.month_february
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_february: prismic.KeyTextField;

	/**
	 * Month March field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.month_march
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_march: prismic.KeyTextField;

	/**
	 * Month April field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.month_april
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_april: prismic.KeyTextField;

	/**
	 * Month May field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.month_may
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_may: prismic.KeyTextField;

	/**
	 * Month June field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.month_june
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_june: prismic.KeyTextField;

	/**
	 * Month July field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.month_july
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_july: prismic.KeyTextField;

	/**
	 * Month August field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.month_august
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_august: prismic.KeyTextField;

	/**
	 * Month September field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.month_september
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_september: prismic.KeyTextField;

	/**
	 * Month October field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.month_october
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_october: prismic.KeyTextField;

	/**
	 * Month November field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.month_november
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_november: prismic.KeyTextField;

	/**
	 * Month December field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.month_december
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_december: prismic.KeyTextField;

	/**
	 * Preview Day field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.preview_day
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	preview_day: prismic.KeyTextField;

	/**
	 * Preview Available Price field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.preview_available_price
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	preview_available_price: prismic.KeyTextField;

	/**
	 * Preview Promo Original Price field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.preview_promo_original_price
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	preview_promo_original_price: prismic.KeyTextField;

	/**
	 * Preview Promo Price field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.preview_promo_price
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	preview_promo_price: prismic.KeyTextField;

	/**
	 * Preview Alt Seat Placeholder field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.preview_alt_seat_placeholder
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	preview_alt_seat_placeholder: prismic.KeyTextField;

	/**
	 * Footer Notice field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.footer_notice
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	footer_notice: prismic.KeyTextField;

	/**
	 * Footer Reset Button Label field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.footer_reset_button_label
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	footer_reset_button_label: prismic.KeyTextField;

	/**
	 * Footer Confirm Button Label field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.footer_confirm_button_label
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	footer_confirm_button_label: prismic.KeyTextField;

	/**
	 * Available field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.available
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	available: prismic.KeyTextField;

	/**
	 * Promo field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.promo
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	promo: prismic.KeyTextField;

	/**
	 * Alt Seat field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.alt_seat
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	alt_seat: prismic.KeyTextField;

	/**
	 * Unavailable field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.unavailable
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	unavailable: prismic.KeyTextField;

	/**
	 * Past field in *Flight Search Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search_page.past
	 * - **Tab**: Calendar
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	past: prismic.KeyTextField;
}

/**
 * Flight Search Page document from Prismic
 *
 * - **API ID**: `flight_search_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type FlightSearchPageDocument<Lang extends string = string> =
	prismic.PrismicDocumentWithoutUID<
		Simplify<FlightSearchPageDocumentData>,
		"flight_search_page",
		Lang
	>;

/**
 * Content for Flight Selection Page documents
 */
interface FlightSelectionPageDocumentData {
	/**
	 * System Error Title field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.system_error_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	system_error_title: prismic.KeyTextField;

	/**
	 * Error Description field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.error_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_description: prismic.KeyTextField;

	/**
	 * Error Reload field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.error_reload
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_reload: prismic.KeyTextField;

	/**
	 * Connecting Flight Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.connecting_flight_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	connecting_flight_label: prismic.KeyTextField;

	/**
	 * Connecting Flight1 Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.connecting_flight1_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	connecting_flight1_label: prismic.KeyTextField;

	/**
	 * Flight Selection Error Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.flight_selection_error_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	flight_selection_error_label: prismic.KeyTextField;

	/**
	 * No Available Flights Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.no_available_flights_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	no_available_flights_label: prismic.KeyTextField;

	/**
	 * Standard Cabin Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.standard_cabin_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	standard_cabin_label: prismic.KeyTextField;

	/**
	 * Zip Full Flat Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.zip_full_flat_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	zip_full_flat_label: prismic.KeyTextField;

	/**
	 * Cabin Legend Info Text field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.cabin_legend_info_text
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cabin_legend_info_text: prismic.KeyTextField;

	/**
	 * Cabin Legend Link Text field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.cabin_legend_link_text
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cabin_legend_link_text: prismic.KeyTextField;

	/**
	 * Adult Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.adult_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	adult_label: prismic.KeyTextField;

	/**
	 * Seat Left Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.seat_left_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_left_label: prismic.KeyTextField;

	/**
	 * Disabled Cabin Info Message field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.disabled_cabin_info_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	disabled_cabin_info_message: prismic.KeyTextField;

	/**
	 * ChildA Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.childA_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	childA_label: prismic.KeyTextField;

	/**
	 * ChildB Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.childB_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	childB_label: prismic.KeyTextField;

	/**
	 * ChildC Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.childC_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	childC_label: prismic.KeyTextField;

	/**
	 * Infant Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.infant_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	infant_label: prismic.KeyTextField;

	/**
	 * Emergency Support Dialog Title field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.emergency_support_dialog_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	emergency_support_dialog_title: prismic.KeyTextField;

	/**
	 * Emergency Support Dialog Description field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.emergency_support_dialog_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	emergency_support_dialog_description: prismic.KeyTextField;

	/**
	 * Close Button Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.close_button_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	close_button_label: prismic.KeyTextField;

	/**
	 * Agree And Proceed Button Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.agree_and_proceed_button_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	agree_and_proceed_button_label: prismic.KeyTextField;

	/**
	 * Segment Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.segment_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	segment_label: prismic.KeyTextField;

	/**
	 * Child 2 6 Years Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.child_2_6_years_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	child_2_6_years_label: prismic.KeyTextField;

	/**
	 * Child 7 11 Years Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.child_7_11_years_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	child_7_11_years_label: prismic.KeyTextField;

	/**
	 * Child Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.child_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	child_label: prismic.KeyTextField;

	/**
	 * Infant 0 1 Year Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.infant_0_1_year_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	infant_0_1_year_label: prismic.KeyTextField;

	/**
	 * Zip Full Flat Restriction Message field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.zip_full_flat_restriction_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	zip_full_flat_restriction_message: prismic.KeyTextField;

	/**
	 * Transit Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.transit_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	transit_label: prismic.KeyTextField;

	/**
	 * Total Hours Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.total_hours_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	total_hours_label: prismic.KeyTextField;

	/**
	 * Previous Day Indicator Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.previous_day_indicator_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	previous_day_indicator_label: prismic.KeyTextField;

	/**
	 * Next Day Indicator Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.next_day_indicator_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	next_day_indicator_label: prismic.KeyTextField;

	/**
	 * Flight Page Title field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.flight_page_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	flight_page_title: prismic.KeyTextField;

	/**
	 * Date Selection Button Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.date_selection_button_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	date_selection_button_label: prismic.KeyTextField;

	/**
	 * Calendar Dialog Title field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_dialog_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_dialog_title: prismic.KeyTextField;

	/**
	 * Month January field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.month_january
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_january: prismic.KeyTextField;

	/**
	 * Month February field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.month_february
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_february: prismic.KeyTextField;

	/**
	 * Month March field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.month_march
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_march: prismic.KeyTextField;

	/**
	 * Month April field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.month_april
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_april: prismic.KeyTextField;

	/**
	 * Month May field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.month_may
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_may: prismic.KeyTextField;

	/**
	 * Month June field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.month_june
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_june: prismic.KeyTextField;

	/**
	 * Month July field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.month_july
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_july: prismic.KeyTextField;

	/**
	 * Month August field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.month_august
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_august: prismic.KeyTextField;

	/**
	 * Month September field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.month_september
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_september: prismic.KeyTextField;

	/**
	 * Month October field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.month_october
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_october: prismic.KeyTextField;

	/**
	 * Month November field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.month_november
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_november: prismic.KeyTextField;

	/**
	 * Month December field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.month_december
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	month_december: prismic.KeyTextField;

	/**
	 * Calendar Day Initial Sunday field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_day_initial_sunday
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_day_initial_sunday: prismic.KeyTextField;

	/**
	 * Calendar Day Initial Monday field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_day_initial_monday
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_day_initial_monday: prismic.KeyTextField;

	/**
	 * Calendar Day Initial Tuesday field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_day_initial_tuesday
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_day_initial_tuesday: prismic.KeyTextField;

	/**
	 * Calendar Day Initial Wednesday field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_day_initial_wednesday
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_day_initial_wednesday: prismic.KeyTextField;

	/**
	 * Calendar Day Initial Thursday field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_day_initial_thursday
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_day_initial_thursday: prismic.KeyTextField;

	/**
	 * Calendar Day Initial Friday field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_day_initial_friday
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_day_initial_friday: prismic.KeyTextField;

	/**
	 * Calendar Day Initial Saturday field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_day_initial_saturday
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_day_initial_saturday: prismic.KeyTextField;

	/**
	 * Calendar Close Button Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_close_button_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_close_button_label: prismic.KeyTextField;

	/**
	 * Calendar Return Date Error Message field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_return_date_error_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_return_date_error_message: prismic.KeyTextField;

	/**
	 * Calendar Travel Dates Error field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_travel_dates_error
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_travel_dates_error: prismic.KeyTextField;

	/**
	 * Calendar Child Alert Message field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_child_alert_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_child_alert_message: prismic.KeyTextField;

	/**
	 * Calendar Legend Button Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_legend_button_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_legend_button_label: prismic.KeyTextField;

	/**
	 * Calendar Tab Outbound field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_tab_outbound
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_tab_outbound: prismic.KeyTextField;

	/**
	 * Calendar Tab Return field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_tab_return
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_tab_return: prismic.KeyTextField;

	/**
	 * Calendar Previous Month Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_previous_month_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_previous_month_label: prismic.KeyTextField;

	/**
	 * Calendar Next Month Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_next_month_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_next_month_label: prismic.KeyTextField;

	/**
	 * Calendar Legend Title field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_legend_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_legend_title: prismic.KeyTextField;

	/**
	 * Calendar Legend Close Button Aria Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_legend_close_button_aria_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_legend_close_button_aria_label: prismic.KeyTextField;

	/**
	 * Calendar Legend Available field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_legend_available
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_legend_available: prismic.KeyTextField;

	/**
	 * Calendar Legend Promo field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_legend_promo
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_legend_promo: prismic.KeyTextField;

	/**
	 * Calendar Legend Alt Seat field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_legend_alt_seat
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_legend_alt_seat: prismic.KeyTextField;

	/**
	 * Calendar Legend Unavailable field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_legend_unavailable
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_legend_unavailable: prismic.KeyTextField;

	/**
	 * Calendar Legend Past field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_legend_past
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_legend_past: prismic.KeyTextField;

	/**
	 * Calendar Legend Preview Day field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_legend_preview_day
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_legend_preview_day: prismic.KeyTextField;

	/**
	 * Calendar Legend Preview Available Price field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_legend_preview_available_price
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_legend_preview_available_price: prismic.KeyTextField;

	/**
	 * Calendar Legend Preview Promo Original Price field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_legend_preview_promo_original_price
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_legend_preview_promo_original_price: prismic.KeyTextField;

	/**
	 * Calendar Legend Preview Promo Price field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_legend_preview_promo_price
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_legend_preview_promo_price: prismic.KeyTextField;

	/**
	 * Calendar Legend Preview Alt Seat Placeholder field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_legend_preview_alt_seat_placeholder
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_legend_preview_alt_seat_placeholder: prismic.KeyTextField;

	/**
	 * Calendar Footer Notice field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_footer_notice
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_footer_notice: prismic.KeyTextField;

	/**
	 * Calendar Footer Reset Button Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_footer_reset_button_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_footer_reset_button_label: prismic.KeyTextField;

	/**
	 * Calendar Footer Confirm Button Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.calendar_footer_confirm_button_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	calendar_footer_confirm_button_label: prismic.KeyTextField;

	/**
	 * Outbound Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.outbound_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	outbound_label: prismic.KeyTextField;

	/**
	 * Inbound Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.inbound_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	inbound_label: prismic.KeyTextField;

	/**
	 * No Return Flight Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.no_return_flight_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	no_return_flight_label: prismic.KeyTextField;

	/**
	 * One Way Ticket Message field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.one_way_ticket_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	one_way_ticket_message: prismic.KeyTextField;

	/**
	 * Add Return Flight Button Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.add_return_flight_button_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	add_return_flight_button_label: prismic.KeyTextField;

	/**
	 * Airfare Not Guaranteed Message field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.airfare_not_guaranteed_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	airfare_not_guaranteed_message: prismic.KeyTextField;

	/**
	 * Check In Baggage Fee Message field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.check_in_baggage_fee_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	check_in_baggage_fee_message: prismic.KeyTextField;

	/**
	 * Fare Restrictions Message field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.fare_restrictions_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	fare_restrictions_message: prismic.KeyTextField;

	/**
	 * Total Amount Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.total_amount_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	total_amount_label: prismic.KeyTextField;

	/**
	 * No Available Seats Message field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.no_available_seats_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	no_available_seats_message: prismic.KeyTextField;

	/**
	 * Segment Selection Error Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.segment_selection_error_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	segment_selection_error_label: prismic.KeyTextField;

	/**
	 * Proceed To Enter Customer Info Button Label field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.proceed_to_enter_customer_info_button_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	proceed_to_enter_customer_info_button_label: prismic.KeyTextField;

	/**
	 * Alt Seat Img field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.alt_seat_img
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	alt_seat_img: prismic.KeyTextField;

	/**
	 * Via Label Connectingflight field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.via_label_connectingflight
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	via_label_connectingflight: prismic.KeyTextField;

	/**
	 * Title field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField /**
	 * NEXUZR003E001 field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.NEXUZR003E001
	 * - **Tab**: Error Titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	NEXUZR003E001: prismic.KeyTextField;

	/**
	 * NEXUZR003E002 field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.NEXUZR003E002
	 * - **Tab**: Error Titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZR003E002: prismic.KeyTextField;

	/**
	 * NEXUZR003E003 field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.NEXUZR003E003
	 * - **Tab**: Error Titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZR003E003: prismic.KeyTextField;

	/**
	 * NEXUZCMNE001 field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.NEXUZCMNE001
	 * - **Tab**: Error Titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZCMNE001: prismic.KeyTextField;

	/**
	 * NEXUZCMNE002 field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.NEXUZCMNE002
	 * - **Tab**: Error Titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZCMNE002: prismic.KeyTextField;

	/**
	 * NEXUZCMNE003 field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.NEXUZCMNE003
	 * - **Tab**: Error Titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZCMNE003: prismic.KeyTextField /**
	 * Date Title field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.date_title
	 * - **Tab**: Date Reset Dialog
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	date_title: prismic.KeyTextField;

	/**
	 * Date Description field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.date_description
	 * - **Tab**: Date Reset Dialog
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	date_description: prismic.KeyTextField;

	/**
	 * Button Cancel field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.button_cancel
	 * - **Tab**: Date Reset Dialog
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_cancel: prismic.KeyTextField;

	/**
	 * Button Confirm field in *Flight Selection Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_selection_page.button_confirm
	 * - **Tab**: Date Reset Dialog
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_confirm: prismic.KeyTextField;
}

/**
 * Flight Selection Page document from Prismic
 *
 * - **API ID**: `flight_selection_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type FlightSelectionPageDocument<Lang extends string = string> =
	prismic.PrismicDocumentWithoutUID<
		Simplify<FlightSelectionPageDocumentData>,
		"flight_selection_page",
		Lang
	>;

/**
 * Content for IBE documents
 */
interface IbeDocumentData {
	/**
	 * App field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.app
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	app: prismic.ContentRelationshipField<"app">;

	/**
	 * Flight Search Page field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.flight_search_page
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	flight_search_page: prismic.ContentRelationshipField<"flight_search_page">;

	/**
	 * Common field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.common
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	common: prismic.ContentRelationshipField<"common">;

	/**
	 * Passenger Name Page field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.passenger_name_page
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	passenger_name_page: prismic.ContentRelationshipField<"passenger_name_page">;

	/**
	 * Flight Selection Page field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.flight_selection_page
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	flight_selection_page: prismic.ContentRelationshipField<"flight_selection_page">;

	/**
	 * Customer Information Page field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.customer_information_page
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	customer_information_page: prismic.ContentRelationshipField<"customer_information_page">;

	/**
	 * Select-Customers Page field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.select-customers_page
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	"select-customers_page": prismic.ContentRelationshipField<"select-customers_page">;

	/**
	 * Transportation Service field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.transportation_service
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	transportation_service: prismic.ContentRelationshipField<"transportation_service">;

	/**
	 * Ancillary Service field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.ancillary_service
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	ancillary_service: prismic.ContentRelationshipField<"ancillary_service">;

	/**
	 * Meals Service field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.meals_service
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	meals_service: prismic.ContentRelationshipField<"meals_service">;

	/**
	 * Bundle Page field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.bundle_page
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	bundle_page: prismic.ContentRelationshipField<"bundle_page">;

	/**
	 * Baggage Service field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.baggage_service
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	baggage_service: prismic.ContentRelationshipField<"baggage_service">;

	/**
	 * Extras Page field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.extras_page
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	extras_page: prismic.ContentRelationshipField<"extras_page">;

	/**
	 * Customize field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.customize
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	customize: prismic.ContentRelationshipField<"customize">;

	/**
	 * Express Service field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.express_service
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	express_service: prismic.ContentRelationshipField<"express_service">;

	/**
	 * Lounge Service field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.lounge_service
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	lounge_service: prismic.ContentRelationshipField<"lounge_service">;

	/**
	 * Seat Service field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.seat_service
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	seat_service: prismic.ContentRelationshipField<"seat_service">;

	/**
	 * Ancillary Page field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.ancillary_page
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	ancillary_page: prismic.ContentRelationshipField<"ancillary_page">;
}

/**
 * IBE document from Prismic
 *
 * - **API ID**: `ibe`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type IbeDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<
	Simplify<IbeDocumentData>,
	"ibe",
	Lang
>;

/**
 * Content for Lounge Service documents
 */
interface LoungeServiceDocumentData {
	/**
	 * Lounge Service Title field in *Lounge Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: lounge_service.lounge_service_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	lounge_service_title: prismic.KeyTextField;

	/**
	 * Out Of Stock Message field in *Lounge Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: lounge_service.out_of_stock_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	out_of_stock_message: prismic.KeyTextField;

	/**
	 * Remaining Stocks Label field in *Lounge Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: lounge_service.remaining_stocks_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	remaining_stocks_label: prismic.KeyTextField /**
	 * Cannot Purchase Airport Lounge field in *Lounge Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: lounge_service.cannot_purchase_airport_lounge
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	cannot_purchase_airport_lounge: prismic.KeyTextField;

	/**
	 * Purchase Deadline Title field in *Lounge Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: lounge_service.purchase_deadline_title
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	purchase_deadline_title: prismic.KeyTextField;

	/**
	 * Purchase Deadline Message field in *Lounge Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: lounge_service.purchase_deadline_message
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	purchase_deadline_message: prismic.KeyTextField;

	/**
	 * LoungeNotAvailableForRoute field in *Lounge Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: lounge_service.loungeNotAvailableForRoute
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	loungeNotAvailableForRoute: prismic.KeyTextField;
}

/**
 * Lounge Service document from Prismic
 *
 * - **API ID**: `lounge_service`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type LoungeServiceDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<
	Simplify<LoungeServiceDocumentData>,
	"lounge_service",
	Lang
>;

/**
 * Content for Meals Service documents
 */
interface MealsServiceDocumentData {
	/**
	 * Title field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;

	/**
	 * Inflight Meal Title field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.inflight_meal_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	inflight_meal_title: prismic.KeyTextField;

	/**
	 * Meal Selction Description field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.meal_selction_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meal_selction_description: prismic.KeyTextField;

	/**
	 * Confirm Selection field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.confirm_selection
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	confirm_selection: prismic.KeyTextField;

	/**
	 * Choose By Category field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.choose_by_category
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	choose_by_category: prismic.KeyTextField;

	/**
	 * Out Of Stock field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.out_of_stock
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	out_of_stock: prismic.KeyTextField;

	/**
	 * Remaining Quantity field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.remaining_quantity
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	remaining_quantity: prismic.KeyTextField;

	/**
	 * Selected field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.selected
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	selected: prismic.KeyTextField;

	/**
	 * Add field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.add
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	add: prismic.KeyTextField;

	/**
	 * Default Inflight Meal Allergy Note field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.default_inflight_meal_allergy_note
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	default_inflight_meal_allergy_note: prismic.KeyTextField;

	/**
	 * No Option Available field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.no_option_available
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	no_option_available: prismic.KeyTextField;

	/**
	 * Allergies Title field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.allergies_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	allergies_title: prismic.KeyTextField;

	/**
	 * Nutritional Information Title field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.nutritional_information_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	nutritional_information_title: prismic.KeyTextField;

	/**
	 * Warning Bundle field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.warning_bundle
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	warning_bundle: prismic.KeyTextField;

	/**
	 * Meal Selected One field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.meal_selected_one
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meal_selected_one: prismic.KeyTextField;

	/**
	 * Meal Selected Many field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.meal_selected_many
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meal_selected_many: prismic.KeyTextField;

	/**
	 * Free Meal Selection Required One field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.free_meal_selection_required_one
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	free_meal_selection_required_one: prismic.KeyTextField;

	/**
	 * Free Meal Selection Required Many field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.free_meal_selection_required_many
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	free_meal_selection_required_many: prismic.KeyTextField /**
	 * Mandatory Meal Required field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.mandatory_meal_required
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	mandatory_meal_required: prismic.KeyTextField;

	/**
	 * Outer Validation field in *Meals Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: meals_service.outer_validation
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	outer_validation: prismic.KeyTextField;
}

/**
 * Meals Service document from Prismic
 *
 * - **API ID**: `meals_service`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type MealsServiceDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<
	Simplify<MealsServiceDocumentData>,
	"meals_service",
	Lang
>;

/**
 * Content for Passenger Name Page documents
 */
interface PassengerNamePageDocumentData {
	/**
	 * Min Length field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.min_length
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	min_length: prismic.KeyTextField;

	/**
	 * Max Length field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.max_length
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	max_length: prismic.KeyTextField;

	/**
	 * Uppercase Alpha field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.uppercase_alpha
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	uppercase_alpha: prismic.KeyTextField;

	/**
	 * Accompany Adult field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.accompany_adult
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	accompany_adult: prismic.KeyTextField;

	/**
	 * Confirm Button field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.confirm_button
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	confirm_button: prismic.KeyTextField;

	/**
	 * Passenger Name field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.passenger_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_name: prismic.KeyTextField;

	/**
	 * Passenger Select field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.passenger_select
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_select: prismic.KeyTextField;

	/**
	 * Input Error field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.input_error
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	input_error: prismic.KeyTextField;

	/**
	 * Global Error field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.global_error
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	global_error: prismic.KeyTextField;

	/**
	 * Last Name field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.last_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	last_name: prismic.KeyTextField;

	/**
	 * Required Label field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.required_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	required_label: prismic.KeyTextField;

	/**
	 * First Name field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.first_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	first_name: prismic.KeyTextField;

	/**
	 * Accompanying Adult field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.accompanying_adult
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	accompanying_adult: prismic.KeyTextField;

	/**
	 * Placeholder Select field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.placeholder_select
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_select: prismic.KeyTextField;

	/**
	 * Placeholder Last Name field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.placeholder_last_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	placeholder_last_name: prismic.KeyTextField;

	/**
	 * Adult Passenger field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.adult_passenger
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	adult_passenger: prismic.KeyTextField;

	/**
	 * Adult Age field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.adult_age
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	adult_age: prismic.KeyTextField;

	/**
	 * Child Passenger field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.child_passenger
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	child_passenger: prismic.KeyTextField;

	/**
	 * Older Child Age field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.older_child_age
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	older_child_age: prismic.KeyTextField;

	/**
	 * Child Age field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.child_age
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	child_age: prismic.KeyTextField;

	/**
	 * Younger Child Age field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.younger_child_age
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	younger_child_age: prismic.KeyTextField;

	/**
	 * Infant Passenger field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.infant_passenger
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	infant_passenger: prismic.KeyTextField;

	/**
	 * Infant Age field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.infant_age
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	infant_age: prismic.KeyTextField;

	/**
	 * Title Label field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.title_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title_label: prismic.KeyTextField;

	/**
	 * Total Amount Label field in *Passenger Name Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger_name_page.total_amount_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	total_amount_label: prismic.KeyTextField;
}

/**
 * Passenger Name Page document from Prismic
 *
 * - **API ID**: `passenger_name_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type PassengerNamePageDocument<Lang extends string = string> =
	prismic.PrismicDocumentWithoutUID<
		Simplify<PassengerNamePageDocumentData>,
		"passenger_name_page",
		Lang
	>;

/**
 * Item in *Seat Service → Error Labels*
 */
export type SeatServiceDocumentDataErrorLabelsItem = {};

/**
 * Item in *Seat Service → Aria Labels*
 */
export type SeatServiceDocumentDataAriaLabelsItem = {};

/**
 * Item in *Seat Service → Lists*
 */
export type SeatServiceDocumentDataListsItem = {};

/**
 * Content for Seat Service documents
 */
interface SeatServiceDocumentData {
	/**
	 * Seat Selection field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_selection
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_selection: prismic.KeyTextField;

	/**
	 * System Error Title field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.system_error_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	system_error_title: prismic.KeyTextField;

	/**
	 * Emergency Exit field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.emergency_exit
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	emergency_exit: prismic.KeyTextField;

	/**
	 * Total Amount field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.total_amount
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	total_amount: prismic.KeyTextField;

	/**
	 * Confirm Selection field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.confirm_selection
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	confirm_selection: prismic.KeyTextField;

	/**
	 * Back field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.back
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	back: prismic.KeyTextField;

	/**
	 * Close field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.close
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	close: prismic.KeyTextField;

	/**
	 * Passengers field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.passengers
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passengers: prismic.KeyTextField;

	/**
	 * Adjacent Seat Information field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.adjacent_seat_information
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	adjacent_seat_information: prismic.KeyTextField;

	/**
	 * Standard Seat Area field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.standard_seat_area
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	standard_seat_area: prismic.KeyTextField;

	/**
	 * Bundle Info Message field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.bundle_info_message
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_info_message: prismic.KeyTextField;

	/**
	 * Emergency Exit Seat Confirmation field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.emergency_exit_seat_confirmation
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	emergency_exit_seat_confirmation: prismic.KeyTextField;

	/**
	 * Agree And Select field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.agree_and_select
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	agree_and_select: prismic.KeyTextField;

	/**
	 * Eligibility Title field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.eligibility_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eligibility_title: prismic.KeyTextField;

	/**
	 * Eligibility Description field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.eligibility_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eligibility_description: prismic.KeyTextField;

	/**
	 * Crew Instruction Intro field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.crew_instruction_intro
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	crew_instruction_intro: prismic.KeyTextField;

	/**
	 * Eligibility Footer field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.eligibility_footer
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eligibility_footer: prismic.KeyTextField;

	/**
	 * Authority Name field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.authority_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	authority_name: prismic.KeyTextField;

	/**
	 * Service Unavailable Title field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.service_unavailable_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_unavailable_title: prismic.KeyTextField;

	/**
	 * Service Unavailable Description field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.service_unavailable_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_unavailable_description: prismic.KeyTextField;

	/**
	 * See More field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.see_more
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	see_more: prismic.KeyTextField;

	/**
	 * Bundle Labels No Bundle field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.bundle_labels_no_bundle
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_labels_no_bundle: prismic.KeyTextField;

	/**
	 * Bundle Labels Value field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.bundle_labels_value
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_labels_value: prismic.KeyTextField;

	/**
	 * Bundle Labels Premium field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.bundle_labels_premium
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_labels_premium: prismic.KeyTextField;

	/**
	 * Bundle Labels Flex Biz field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.bundle_labels_flex_biz
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_labels_flex_biz: prismic.KeyTextField;

	/**
	 * Business Cabin Columns A field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.business_cabin_columns_a
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	business_cabin_columns_a: prismic.KeyTextField;

	/**
	 * Business Cabin Columns D field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.business_cabin_columns_d
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	business_cabin_columns_d: prismic.KeyTextField;

	/**
	 * Business Cabin Columns G field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.business_cabin_columns_g
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	business_cabin_columns_g: prismic.KeyTextField;

	/**
	 * Business Cabin Columns K field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.business_cabin_columns_k
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	business_cabin_columns_k: prismic.KeyTextField;

	/**
	 * Seat Legend More Legroom field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_legend_more_legroom
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_legend_more_legroom: prismic.KeyTextField;

	/**
	 * Seat Legend Front Aisle Window Side field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_legend_front_aisle_window_side
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_legend_front_aisle_window_side: prismic.KeyTextField;

	/**
	 * Seat Legend Reclining Not Allowed field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_legend_reclining_not_allowed
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_legend_reclining_not_allowed: prismic.KeyTextField;

	/**
	 * Seat Legend Rear Aisle Window Side field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_legend_rear_aisle_window_side
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_legend_rear_aisle_window_side: prismic.KeyTextField;

	/**
	 * Seat Legend Central Seat field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_legend_central_seat
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_legend_central_seat: prismic.KeyTextField;

	/**
	 * Seat Legend Zip Full Flat Central Seat field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_legend_zip_full_flat_central_seat
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_legend_zip_full_flat_central_seat: prismic.KeyTextField;

	/**
	 * Seat Legend Selected field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_legend_selected
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_legend_selected: prismic.KeyTextField;

	/**
	 * Seat Legend Not Selectable field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_legend_not_selectable
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_legend_not_selectable: prismic.KeyTextField;

	/**
	 * Adjacent Info Zip Full Flat Item 1 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.adjacent_info_zip_full_flat_item_1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	adjacent_info_zip_full_flat_item_1: prismic.KeyTextField;

	/**
	 * Adjacent Info Zip Full Flat Item 2 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.adjacent_info_zip_full_flat_item_2
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	adjacent_info_zip_full_flat_item_2: prismic.KeyTextField;

	/**
	 * Adjacent Info Zip Full Flat Item 3 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.adjacent_info_zip_full_flat_item_3
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	adjacent_info_zip_full_flat_item_3: prismic.KeyTextField;

	/**
	 * Adjacent Info Guidance Link Text field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.adjacent_info_guidance_link_text
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	adjacent_info_guidance_link_text: prismic.KeyTextField;

	/**
	 * Adjacent Info Standard Item 1 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.adjacent_info_standard_item_1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	adjacent_info_standard_item_1: prismic.KeyTextField;

	/**
	 * Adjacent Info Standard Item 2 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.adjacent_info_standard_item_2
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	adjacent_info_standard_item_2: prismic.KeyTextField;

	/**
	 * Adjacent Info Standard Item 3 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.adjacent_info_standard_item_3
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	adjacent_info_standard_item_3: prismic.KeyTextField;

	/**
	 * Seat Rules Zip Full Flat Item 1 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_rules_zip_full_flat_item_1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_rules_zip_full_flat_item_1: prismic.KeyTextField;

	/**
	 * Seat Rules Standard Item 1 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_rules_standard_item_1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_rules_standard_item_1: prismic.KeyTextField;

	/**
	 * Seat Rules Standard Item 2 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_rules_standard_item_2
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_rules_standard_item_2: prismic.KeyTextField;

	/**
	 * Seat Rules Standard Item 3 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_rules_standard_item_3
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_rules_standard_item_3: prismic.KeyTextField;

	/**
	 * Seat Rules Standard Item 4 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_rules_standard_item_4
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_rules_standard_item_4: prismic.KeyTextField;

	/**
	 * Seat Rules Standard Item 5 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_rules_standard_item_5
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_rules_standard_item_5: prismic.KeyTextField;

	/**
	 * Eligibility Checklist Item 1 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.eligibility_checklist_item_1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eligibility_checklist_item_1: prismic.KeyTextField;

	/**
	 * Eligibility Checklist Item 2 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.eligibility_checklist_item_2
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eligibility_checklist_item_2: prismic.KeyTextField;

	/**
	 * Eligibility Checklist Item 3 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.eligibility_checklist_item_3
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eligibility_checklist_item_3: prismic.KeyTextField;

	/**
	 * Eligibility Checklist Item 4 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.eligibility_checklist_item_4
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eligibility_checklist_item_4: prismic.KeyTextField;

	/**
	 * Eligibility Checklist Item 5 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.eligibility_checklist_item_5
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eligibility_checklist_item_5: prismic.KeyTextField;

	/**
	 * Eligibility Checklist Item 6 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.eligibility_checklist_item_6
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eligibility_checklist_item_6: prismic.KeyTextField;

	/**
	 * Eligibility Checklist Item 7 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.eligibility_checklist_item_7
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eligibility_checklist_item_7: prismic.KeyTextField;

	/**
	 * Eligibility Checklist Item 8 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.eligibility_checklist_item_8
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eligibility_checklist_item_8: prismic.KeyTextField;

	/**
	 * Eligibility Checklist Item 9 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.eligibility_checklist_item_9
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eligibility_checklist_item_9: prismic.KeyTextField;

	/**
	 * Eligibility Checklist Item 10 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.eligibility_checklist_item_10
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eligibility_checklist_item_10: prismic.KeyTextField;

	/**
	 * Eligibility Checklist Item 11 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.eligibility_checklist_item_11
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eligibility_checklist_item_11: prismic.KeyTextField;

	/**
	 * Crew Instruction Items Item 1 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.crew_instruction_items_item_1
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	crew_instruction_items_item_1: prismic.KeyTextField;

	/**
	 * Crew Instruction Items Item 2 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.crew_instruction_items_item_2
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	crew_instruction_items_item_2: prismic.KeyTextField;

	/**
	 * Crew Instruction Items Item 3 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.crew_instruction_items_item_3
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	crew_instruction_items_item_3: prismic.KeyTextField;

	/**
	 * Crew Instruction Items Item 4 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.crew_instruction_items_item_4
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	crew_instruction_items_item_4: prismic.KeyTextField;

	/**
	 * Crew Instruction Items Item 5 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.crew_instruction_items_item_5
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	crew_instruction_items_item_5: prismic.KeyTextField;

	/**
	 * Seat Selection Summary Selected Single field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_selection_summary_selected_single
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_selection_summary_selected_single: prismic.KeyTextField;

	/**
	 * Seat Selection Summary Selected Multiple field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_selection_summary_selected_multiple
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_selection_summary_selected_multiple: prismic.KeyTextField;

	/**
	 * Seat Selection Summary Required Single field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_selection_summary_required_single
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_selection_summary_required_single: prismic.KeyTextField;

	/**
	 * Seat Selection Summary Required Multiple field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_selection_summary_required_multiple
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_selection_summary_required_multiple: prismic.KeyTextField;

	/**
	 * Seat Selection Summary All Selected field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_selection_summary_all_selected
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_selection_summary_all_selected: prismic.KeyTextField /**
	 * Checklist Required field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.checklist_required
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	checklist_required: prismic.KeyTextField;

	/**
	 * Cant Select Seat Title field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.cant_select_seat_title
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cant_select_seat_title: prismic.KeyTextField;

	/**
	 * Cant Select Seat Body field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.cant_select_seat_body
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cant_select_seat_body: prismic.KeyTextField;

	/**
	 * Emergency Exit Title field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.emergency_exit_title
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	emergency_exit_title: prismic.KeyTextField;

	/**
	 * Emergency Exit Body field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.emergency_exit_body
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	emergency_exit_body: prismic.KeyTextField;

	/**
	 * Seat Selection 48 Hour Title field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_selection_48_hour_title
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_selection_48_hour_title: prismic.KeyTextField;

	/**
	 * Seat Selection 48 Hour Body field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_selection_48_hour_body
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_selection_48_hour_body: prismic.KeyTextField;

	/**
	 * Bundle Mandatory Title field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.bundle_mandatory_title
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_mandatory_title: prismic.KeyTextField;

	/**
	 * Bundle Mandatory Body field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.bundle_mandatory_body
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bundle_mandatory_body: prismic.KeyTextField;

	/**
	 * Non Reclining Title field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.non_reclining_title
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	non_reclining_title: prismic.KeyTextField;

	/**
	 * Non Reclining Body field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.non_reclining_body
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	non_reclining_body: prismic.KeyTextField;

	/**
	 * Limited Reclining Title field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.limited_reclining_title
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	limited_reclining_title: prismic.KeyTextField;

	/**
	 * Limited Reclining Body field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.limited_reclining_body
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	limited_reclining_body: prismic.KeyTextField;

	/**
	 * No Available Seats Title field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.no_available_seats_title
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	no_available_seats_title: prismic.KeyTextField;

	/**
	 * No Available Seats Content field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.no_available_seats_content
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	no_available_seats_content: prismic.KeyTextField;

	/**
	 * No Available Seats Button field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.no_available_seats_button
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	no_available_seats_button: prismic.KeyTextField;

	/**
	 * No Adjacent Seats Title field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.no_adjacent_seats_title
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	no_adjacent_seats_title: prismic.KeyTextField;

	/**
	 * No Adjacent Seats Content field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.no_adjacent_seats_content
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	no_adjacent_seats_content: prismic.KeyTextField;

	/**
	 * No Adjacent Seats Button field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.no_adjacent_seats_button
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	no_adjacent_seats_button: prismic.KeyTextField;

	/**
	 * Cancelled Selection Title field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.cancelled_selection_title
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cancelled_selection_title: prismic.KeyTextField;

	/**
	 * Cancelled Selection Content Line 1 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.cancelled_selection_content_line_1
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cancelled_selection_content_line_1: prismic.KeyTextField;

	/**
	 * Cancelled Selection Content Line 2 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.cancelled_selection_content_line_2
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cancelled_selection_content_line_2: prismic.KeyTextField;

	/**
	 * Cancelled Selection Ok Button field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.cancelled_selection_ok_button
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cancelled_selection_ok_button: prismic.KeyTextField;

	/**
	 * NEXUZR004E051 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.NEXUZR004E051
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZR004E051: prismic.KeyTextField;

	/**
	 * NEXUZCMNE001 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.NEXUZCMNE001
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZCMNE001: prismic.KeyTextField;

	/**
	 * NEXUZCMNE002 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.NEXUZCMNE002
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZCMNE002: prismic.KeyTextField;

	/**
	 * NEXUZCMNE003 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.NEXUZCMNE003
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZCMNE003: prismic.KeyTextField;

	/**
	 * NEXUZCMNE004 field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.NEXUZCMNE004
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	NEXUZCMNE004: prismic.KeyTextField /**
	 * Back Button field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.back_button
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	back_button: prismic.KeyTextField;

	/**
	 * Close Button field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.close_button
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	close_button: prismic.KeyTextField;

	/**
	 * Seat Number field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.seat_number
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	seat_number: prismic.KeyTextField;

	/**
	 * Selected State field in *Seat Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.selected_state
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	selected_state: prismic.KeyTextField /**
	 * Error Labels field in *Seat Service*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.error_labels[]
	 * - **Tab**: Ancillary Service
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */;
	error_labels: prismic.GroupField<Simplify<SeatServiceDocumentDataErrorLabelsItem>>;

	/**
	 * Aria Labels field in *Seat Service*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.aria_labels[]
	 * - **Tab**: Ancillary Service
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	aria_labels: prismic.GroupField<Simplify<SeatServiceDocumentDataAriaLabelsItem>>;

	/**
	 * Lists field in *Seat Service*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: seat_service.lists[]
	 * - **Tab**: Ancillary Service
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	lists: prismic.GroupField<Simplify<SeatServiceDocumentDataListsItem>>;
}

/**
 * Seat Service document from Prismic
 *
 * - **API ID**: `seat_service`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type SeatServiceDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<
	Simplify<SeatServiceDocumentData>,
	"seat_service",
	Lang
>;

/**
 * Content for Select-Customers Page documents
 */
interface SelectCustomersPageDocumentData {
	/**
	 * Title field in *Select-Customers Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: select-customers_page.title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;

	/**
	 * Adult Label field in *Select-Customers Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: select-customers_page.adult_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	adult_label: prismic.KeyTextField;

	/**
	 * ChildA Label field in *Select-Customers Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: select-customers_page.childA_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	childA_label: prismic.KeyTextField;

	/**
	 * ChildB Label field in *Select-Customers Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: select-customers_page.childB_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	childB_label: prismic.KeyTextField;

	/**
	 * ChildC Label field in *Select-Customers Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: select-customers_page.childC_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	childC_label: prismic.KeyTextField;

	/**
	 * Infant Label field in *Select-Customers Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: select-customers_page.infant_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	infant_label: prismic.KeyTextField;
}

/**
 * Select-Customers Page document from Prismic
 *
 * - **API ID**: `select-customers_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type SelectCustomersPageDocument<Lang extends string = string> =
	prismic.PrismicDocumentWithoutUID<
		Simplify<SelectCustomersPageDocumentData>,
		"select-customers_page",
		Lang
	>;

/**
 * Content for Transportation Service documents
 */
interface TransportationServiceDocumentData {
	/**
	 * More Info field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.more_info
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	more_info: prismic.KeyTextField;

	/**
	 * Duration field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.duration
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	duration: prismic.KeyTextField;

	/**
	 * Add Button field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.add_button
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	add_button: prismic.KeyTextField;

	/**
	 * Selected Button field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.selected_button
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	selected_button: prismic.KeyTextField;

	/**
	 * Transport Services field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.transport_services
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	transport_services: prismic.KeyTextField;

	/**
	 * Confirm Selection field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.confirm_selection
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	confirm_selection: prismic.KeyTextField;

	/**
	 * Shuttle One Way field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.shuttle_one_way
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	shuttle_one_way: prismic.KeyTextField;

	/**
	 * Shuttle Round Trip field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.shuttle_round_trip
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	shuttle_round_trip: prismic.KeyTextField;

	/**
	 * Trolley 7 Days field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.trolley_7_days
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	trolley_7_days: prismic.KeyTextField;

	/**
	 * Trolley 4 Days field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.trolley_4_days
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	trolley_4_days: prismic.KeyTextField;

	/**
	 * Trolley 1 Day field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.trolley_1_day
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	trolley_1_day: prismic.KeyTextField;

	/**
	 * Adult 12 Years And Older field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.adult_12_years_and_older
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	adult_12_years_and_older: prismic.KeyTextField;

	/**
	 * Child 2 To 11 Years Old field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.child_2_to_11_years_old
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	child_2_to_11_years_old: prismic.KeyTextField;

	/**
	 * Free For Children field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.free_for_children
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	free_for_children: prismic.KeyTextField;

	/**
	 * Shuttle Service One Way field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.shuttle_service_one_way
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	shuttle_service_one_way: prismic.KeyTextField;

	/**
	 * Shuttle Service Round Trip field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.shuttle_service_round_trip
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	shuttle_service_round_trip: prismic.KeyTextField;

	/**
	 * Trolley Service 7 Days field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.trolley_service_7_days
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	trolley_service_7_days: prismic.KeyTextField;

	/**
	 * Trolley Service 4 Days field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.trolley_service_4_days
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	trolley_service_4_days: prismic.KeyTextField;

	/**
	 * Trolley Service 1 Day field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.trolley_service_1_day
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	trolley_service_1_day: prismic.KeyTextField;

	/**
	 * Lealea Trolley field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.lealea_trolley
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	lealea_trolley: prismic.KeyTextField;

	/**
	 * Lealea Airport Shuttle field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.lealea_airport_shuttle
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	lealea_airport_shuttle: prismic.KeyTextField;

	/**
	 * Lealea Airport Shuttle Description field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.lealea_airport_shuttle_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	lealea_airport_shuttle_description: prismic.KeyTextField;

	/**
	 * Lealea Airport Shuttle Popup Description field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.lealea_airport_shuttle_popup_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	lealea_airport_shuttle_popup_description: prismic.KeyTextField;

	/**
	 * Lealea Trolley Description field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.lealea_trolley_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	lealea_trolley_description: prismic.KeyTextField;

	/**
	 * Remaining Stock Count field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.remaining_stock_count
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	remaining_stock_count: prismic.KeyTextField;

	/**
	 * Trip Type field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.trip_type
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	trip_type: prismic.KeyTextField;

	/**
	 * Out Of Stock field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.out_of_stock
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	out_of_stock: prismic.KeyTextField;

	/**
	 * No Purchase Option Available field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.no_purchase_option_available
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	no_purchase_option_available: prismic.KeyTextField /**
	 * Exceeds Available Stock field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.exceeds_available_stock
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	exceeds_available_stock: prismic.KeyTextField;

	/**
	 * Insufficient Stock Message field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.insufficient_stock_message
	 * - **Tab**: Error Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	insufficient_stock_message: prismic.KeyTextField /**
	 * Back field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.back
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */;
	back: prismic.KeyTextField;

	/**
	 * More Info Aria Label field in *Transportation Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: transportation_service.more_info_aria_label
	 * - **Tab**: Aria Labels
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	more_info_aria_label: prismic.KeyTextField;
}

/**
 * Transportation Service document from Prismic
 *
 * - **API ID**: `transportation_service`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type TransportationServiceDocument<Lang extends string = string> =
	prismic.PrismicDocumentWithoutUID<
		Simplify<TransportationServiceDocumentData>,
		"transportation_service",
		Lang
	>;

export type AllDocumentTypes =
	| AncillaryPageDocument
	| AncillaryServiceDocument
	| AppDocument
	| BaggageServiceDocument
	| BundlePageDocument
	| BundlesDocument
	| CommonDocument
	| ContentPageDocument
	| CustomerInformationPageDocument
	| CustomizeDocument
	| ExpressServiceDocument
	| ExtrasPageDocument
	| FlightSearchPageDocument
	| FlightSelectionPageDocument
	| IbeDocument
	| LoungeServiceDocument
	| MealsServiceDocument
	| PassengerNamePageDocument
	| SeatServiceDocument
	| SelectCustomersPageDocument
	| TransportationServiceDocument;

/**
 * Primary content in *PageHeader → Default → Primary*
 */
export interface PageHeaderSliceDefaultPrimary {
	/**
	 * Title field in *PageHeader → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page_header.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;

	/**
	 * Introduction Text field in *PageHeader → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page_header.default.primary.introduction_text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	introduction_text: prismic.RichTextField;
}

/**
 * Default variation for PageHeader Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PageHeaderSliceDefault = prismic.SharedSliceVariation<
	"default",
	Simplify<PageHeaderSliceDefaultPrimary>,
	never
>;

/**
 * Slice variation for *PageHeader*
 */
type PageHeaderSliceVariation = PageHeaderSliceDefault;

/**
 * PageHeader Shared Slice
 *
 * - **API ID**: `page_header`
 * - **Description**: PageHeader
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PageHeaderSlice = prismic.SharedSlice<"page_header", PageHeaderSliceVariation>;

/**
 * Primary content in *RichText → Default → Primary*
 */
export interface RichTextSliceDefaultPrimary {
	/**
	 * Content field in *RichText → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: rich_text.default.primary.content
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	content: prismic.RichTextField;
}

/**
 * Default variation for RichText Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default rich text
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSliceDefault = prismic.SharedSliceVariation<
	"default",
	Simplify<RichTextSliceDefaultPrimary>,
	never
>;

/**
 * Slice variation for *RichText*
 */
type RichTextSliceVariation = RichTextSliceDefault;

/**
 * RichText Shared Slice
 *
 * - **API ID**: `rich_text`
 * - **Description**: Reusable rich text section
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSlice = prismic.SharedSlice<"rich_text", RichTextSliceVariation>;

/**
 * Primary content in *TestSlice → Default → Primary*
 */
export interface TestSliceSliceDefaultPrimary {
	/**
	 * text field field in *TestSlice → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: test_slice.default.primary.text_field
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	text_field: prismic.KeyTextField;
}

/**
 * Default variation for TestSlice Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TestSliceSliceDefault = prismic.SharedSliceVariation<
	"default",
	Simplify<TestSliceSliceDefaultPrimary>,
	never
>;

/**
 * Slice variation for *TestSlice*
 */
type TestSliceSliceVariation = TestSliceSliceDefault;

/**
 * TestSlice Shared Slice
 *
 * - **API ID**: `test_slice`
 * - **Description**: TestSlice
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TestSliceSlice = prismic.SharedSlice<"test_slice", TestSliceSliceVariation>;

declare module "@prismicio/client" {
	type CreateClient = (
		repositoryNameOrEndpoint: string,
		options?: prismic.ClientConfig,
	) => prismic.Client<AllDocumentTypes>;

	type CreateWriteClient = (
		repositoryNameOrEndpoint: string,
		options: prismic.WriteClientConfig,
	) => prismic.WriteClient<AllDocumentTypes>;

	type CreateMigration = () => prismic.Migration<AllDocumentTypes>;

	namespace Content {
		export type {
			AllDocumentTypes,
			AncillaryPageDocument,
			AncillaryPageDocumentData,
			AncillaryServiceDocument,
			AncillaryServiceDocumentData,
			AppDocument,
			AppDocumentData,
			BaggageServiceDocument,
			BaggageServiceDocumentData,
			BundlePageDocument,
			BundlePageDocumentData,
			BundlesDocument,
			BundlesDocumentData,
			CommonDocument,
			CommonDocumentData,
			ContentPageDocument,
			ContentPageDocumentData,
			ContentPageDocumentDataSlicesSlice,
			CustomerInformationPageDocument,
			CustomerInformationPageDocumentData,
			CustomizeDocument,
			CustomizeDocumentData,
			ExpressServiceDocument,
			ExpressServiceDocumentData,
			ExtrasPageDocument,
			ExtrasPageDocumentData,
			FlightSearchPageDocument,
			FlightSearchPageDocumentData,
			FlightSearchPageDocumentDataAirportsItem,
			FlightSelectionPageDocument,
			FlightSelectionPageDocumentData,
			IbeDocument,
			IbeDocumentData,
			LoungeServiceDocument,
			LoungeServiceDocumentData,
			MealsServiceDocument,
			MealsServiceDocumentData,
			PageHeaderSlice,
			PageHeaderSliceDefault,
			PageHeaderSliceDefaultPrimary,
			PageHeaderSliceVariation,
			PassengerNamePageDocument,
			PassengerNamePageDocumentData,
			RichTextSlice,
			RichTextSliceDefault,
			RichTextSliceDefaultPrimary,
			RichTextSliceVariation,
			SeatServiceDocument,
			SeatServiceDocumentData,
			SeatServiceDocumentDataAriaLabelsItem,
			SeatServiceDocumentDataErrorLabelsItem,
			SeatServiceDocumentDataListsItem,
			SelectCustomersPageDocument,
			SelectCustomersPageDocumentData,
			TestSliceSlice,
			TestSliceSliceDefault,
			TestSliceSliceDefaultPrimary,
			TestSliceSliceVariation,
			TransportationServiceDocument,
			TransportationServiceDocumentData,
		};
	}
}
