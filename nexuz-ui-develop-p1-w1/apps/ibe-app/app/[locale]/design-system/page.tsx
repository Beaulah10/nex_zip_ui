// "use client";

// import { Alert, AlertAction, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
// import { Badge } from "@repo/ui/components/badge";
// import { Button } from "@repo/ui/components/button";
// import { ButtonGroup } from "@repo/ui/components/button-group";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardFooter,
// 	CardHeader,
// 	CardTitle,
// } from "@repo/ui/components/card";
// import { Checkbox } from "@repo/ui/components/checkbox";
// import {
// 	Combobox,
// 	ComboboxContent,
// 	ComboboxInput,
// 	ComboboxItem,
// 	ComboboxList,
// } from "@repo/ui/components/combobox";
// import {
// 	Dialog,
// 	DialogClose,
// 	DialogContent,
// 	DialogFooter,
// 	DialogHeader,
// 	DialogTitle,
// 	DialogTrigger,
// } from "@repo/ui/components/dialog";
// import { DimensionInput } from "@repo/ui/components/dimension";
// import { Field, FieldContent, FieldLabel, FieldTitle } from "@repo/ui/components/field";
// import {
// 	FieldCheckboxField,
// 	FieldDimensionInput,
// 	FieldPhoneField,
// 	FieldRadioGroup,
// 	FieldSelect,
// } from "@repo/ui/components/field-inputs";
// import Icon from "@repo/ui/components/icon";
// import { Input } from "@repo/ui/components/input";
// import { InputField } from "@repo/ui/components/input-field";
// import { InputNumberField } from "@repo/ui/components/input-number";
// import {
// 	Item,
// 	ItemContent,
// 	ItemDescription,
// 	ItemGroup,
// 	ItemMedia,
// 	ItemTitle,
// } from "@repo/ui/components/item";
// import { Label } from "@repo/ui/components/label";
// import { MenuList } from "@repo/ui/components/menu-list";
// import type { PhoneExtension } from "@repo/ui/components/phone-field";
// import { PhoneField } from "@repo/ui/components/phone-field";
// import { ProductCard } from "@repo/ui/components/product-card";
// import {
// 	RadioGroup,
// 	RadioGroupBorderedItem,
// 	RadioGroupItem,
// } from "@repo/ui/components/radio-group";
// import {
// 	Select,
// 	SelectContent,
// 	SelectGroup,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@repo/ui/components/select";
// import { Separator } from "@repo/ui/components/separator";
// import { SiteFooter } from "@repo/ui/components/site-footer";
// import { SiteHeader } from "@repo/ui/components/site-header";
// import { Slider } from "@repo/ui/components/slider";
// import { Spinner } from "@repo/ui/components/spinner";
// import {
// 	Table,
// 	TableBody,
// 	TableCaption,
// 	TableCell,
// 	TableFooter,
// 	TableHead,
// 	TableHeader,
// 	TableRow,
// } from "@repo/ui/components/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
// import { Textarea } from "@repo/ui/components/textarea";
// import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
// import { Wrapper } from "@repo/ui/components/wrapper";
// import { ChevronDownIcon } from "lucide-react";
// import { useState } from "react";
// import { FlightMenuBar } from "@/components/common/flight-menu-bar/flight-menu-bar";
// import { PassengerService } from "@/components/common/passenger-service";
// import { ServicePromoCard } from "@/components/common/service-promo-card";
// import { BaggageSelectionDialog } from "@/components/customize/baggage-selection-dialog";
// import { MealCard } from "@/components/customize/meal-card";
// import { MealSelectionFlow } from "@/components/customize/meal-selection-flow";
// import { TransportServiceCard } from "@/components/customize/transport-service-card";
// import { ExtraServices } from "@/components/extras/extra-services/extra-services";
// import { AirCalendarTabs } from "@/components/flight-selection/air-calendar/air-calendar-tabs";
// import { CabinCard } from "@/components/flight-selection/cabin-card/cabin-card";
// import { CabinTypeLegend } from "@/components/flight-selection/cabin-type/cabin-type-legend";
// import { FlightInfo } from "@/components/flight-selection/flight-information/flight-info";
// import { SeatMap } from "@/components/seat-map/seat-map";
// import { SeatMapPassengerPanel } from "@/components/seat-map/seat-map-passenger-panel";
// import { seatMapData } from "@/mock/seat-map.mock";
// import type { PaxListItem } from "../../../components/common/pax-list";
// import { SelectCustomers } from "../../../components/common/pax-list";

// const initialAccordionState = {
// 	airCalendarTabs: false,
// 	dialogBasic: false,
// 	spinner: false,
// 	table: false,
// 	buttons: false,
// 	airportDialog: false,
// 	badge: false,
// 	cabinCard: false,
// 	cabinTypeLegend: false,
// 	card: false,
// 	flightInfo: false,
// 	flightMenuBar: false,
// 	item: false,
// 	label: false,
// 	radioGroup: false,
// 	icon: false,
// 	menuList: false,
// 	separator: false,
// 	siteChrome: false,
// 	slider: false,
// 	alert: false,
// 	tabs: false,
// 	textarea: false,
// 	tooltip: false,
// 	select: false,
// 	combobox: false,
// 	fieldInputs: false,
// 	input: false,
// 	inputNumber: false,
// 	checkbox: false,
// 	switch: false,
// 	wrapper: false,
// 	dimensionInput: false,
// 	phoneField: false,
// 	seatMap: false,
// 	paxList: false,
// 	servicePromoCard: false,
// 	productCard: false,
// 	activityCard: false,
// 	baggagePaxCard: false,
// 	inflightMeal: false,
// 	inflightMealPaxCard: false,
// 	mealOptionCard: false,
// };

// type AccordionKey = keyof typeof initialAccordionState;

// const SECTION_ORDER: Record<string, number> = {
// 	AirCalendarTabs: 1,
// 	Alert: 2,
// 	Badge: 3,
// 	"Button Group / Switch": 4,
// 	"Button Redefined": 5,
// 	"Cabin Card": 6,
// 	"Cabin Type Legend": 7,
// 	Card: 8,
// 	Checkbox: 9,
// 	Combobox: 10,
// 	Dialog: 11,
// 	"Dimension Input": 12,
// 	"Field Inputs": 13,
// 	"Flight Info": 14,
// 	"Flight Menu Bar": 15,
// 	"Icon (Completed-DS)": 16,
// 	Input: 17,
// 	"Input Number": 18,
// 	Item: 19,
// 	Label: 20,
// 	"Menu List": 21,
// 	"Passenger Selection Dialog": 22,
// 	"Phone Field": 23,
// 	"Radio Group (Completed-DS)": 24,
// 	"Seat Map": 24.5,
// 	Select: 25,
// 	Separator: 26,
// 	"Site Header & Footer": 27,
// 	Slider: 28,
// 	Spinner: 29,
// 	Table: 30,
// 	Tabs: 31,
// 	Textarea: 32,
// 	Tooltip: 33,
// 	Wrapper: 34,
// };

// const AccordionSection = ({
// 	id,
// 	title,
// 	description,
// 	children,
// 	isOpen,
// 	onToggle,
// }: {
// 	id: string;
// 	title: string;
// 	description?: string;
// 	children: React.ReactNode;
// 	isOpen: boolean;
// 	onToggle: () => void;
// }) => (
// 	<div
// 		id={id}
// 		className="accordion-section rounded-xl border shadow-sm transition-all"
// 		style={{ order: SECTION_ORDER[title] ?? 999 }}
// 	>
// 		<button
// 			onClick={onToggle}
// 			type="button"
// 			className="flex w-full cursor-pointer items-center justify-between p-6 hover:bg-muted/30"
// 		>
// 			<div className="space-y-1 text-left">
// 				<h2 className="font-semibold text-2xl tracking-tight">{title}</h2>
// 				{description && <p className="text-muted-foreground text-sm">{description}</p>}
// 			</div>
// 			<ChevronDownIcon
// 				className={`size-5 shrink-0 transition-transform duration-200 ${
// 					isOpen ? "rotate-180" : ""
// 				}`}
// 			/>
// 		</button>
// 		{isOpen && <div className="border-t px-6 py-4">{children}</div>}
// 	</div>
// );

// const invoices = [
// 	{
// 		invoice: "INV001",
// 		paymentStatus: "Paid",
// 		totalAmount: "$250.00",
// 		paymentMethod: "Credit Card",
// 	},
// 	{
// 		invoice: "INV002",
// 		paymentStatus: "Pending",
// 		totalAmount: "$150.00",
// 		paymentMethod: "PayPal",
// 	},
// 	{
// 		invoice: "INV003",
// 		paymentStatus: "Unpaid",
// 		totalAmount: "$350.00",
// 		paymentMethod: "Bank Transfer",
// 	},
// 	{
// 		invoice: "INV004",
// 		paymentStatus: "Paid",
// 		totalAmount: "$450.00",
// 		paymentMethod: "Credit Card",
// 	},
// 	{
// 		invoice: "INV005",
// 		paymentStatus: "Paid",
// 		totalAmount: "$550.00",
// 		paymentMethod: "PayPal",
// 	},
// 	{
// 		invoice: "INV006",
// 		paymentStatus: "Pending",
// 		totalAmount: "$200.00",
// 		paymentMethod: "Bank Transfer",
// 	},
// 	{
// 		invoice: "INV007",
// 		paymentStatus: "Unpaid",
// 		totalAmount: "$300.00",
// 		paymentMethod: "Credit Card",
// 	},
// ];

// const NAV_ITEMS: { label: string; key: AccordionKey }[] = [
// 	{ label: "AirCalendarTabs", key: "airCalendarTabs" },
// 	{ label: "Alert", key: "alert" },
// 	{ label: "Badge", key: "badge" },
// 	{ label: "Button Group / Switch", key: "switch" },
// 	{ label: "Button Redefined", key: "buttons" },
// 	{ label: "Cabin Card", key: "cabinCard" },
// 	{ label: "Cabin Type Legend", key: "cabinTypeLegend" },
// 	{ label: "Card", key: "card" },
// 	{ label: "Checkbox", key: "checkbox" },
// 	{ label: "Combobox", key: "combobox" },
// 	{ label: "Dialog", key: "dialogBasic" },
// 	{ label: "Dimension Input", key: "dimensionInput" },
// 	{ label: "Field Inputs", key: "fieldInputs" },
// 	{ label: "Flight Info", key: "flightInfo" },
// 	{ label: "Flight Menu Bar", key: "flightMenuBar" },
// 	{ label: "Icon", key: "icon" },
// 	{ label: "Input", key: "input" },
// 	{ label: "Input Number", key: "inputNumber" },
// 	{ label: "Item", key: "item" },
// 	{ label: "Label", key: "label" },
// 	{ label: "Menu List", key: "menuList" },
// 	{ label: "Phone Field", key: "phoneField" },
// 	{ label: "Radio Group", key: "radioGroup" },
// 	{ label: "Seat Map", key: "seatMap" },
// 	{ label: "Select", key: "select" },
// 	{ label: "Separator", key: "separator" },
// 	{ label: "Site Header & Footer", key: "siteChrome" },
// 	{ label: "Slider", key: "slider" },
// 	{ label: "Spinner", key: "spinner" },
// 	{ label: "Table", key: "table" },
// 	{ label: "Tabs", key: "tabs" },
// 	{ label: "Textarea", key: "textarea" },
// 	{ label: "Tooltip", key: "tooltip" },
// 	{ label: "Wrapper", key: "wrapper" },
// ];

// export default function Home() {
// 	const [selectedExtension, setSelectedExtension] = useState("+81");
// 	const [phoneNumber, setPhoneNumber] = useState("");
// 	const [selectedCabin, setSelectedCabin] = useState<string>("economy");
// 	const [selectedSeatCodes, setSelectedSeatCodes] = useState<string[]>(["20D", "2G"]);
// 	const [selectedMealOptionId, setSelectedMealOptionId] = useState("rice");

// 	const phoneExtensions: PhoneExtension[] = [
// 		{ code: "+81", dialCode: "+81", country: "Japan" },
// 		{ code: "+1", dialCode: "+1", country: "United States / Canada" },
// 		{ code: "+44", dialCode: "+44", country: "United Kingdom" },
// 		{ code: "+82", dialCode: "+82", country: "South Korea" },
// 		{ code: "+86", dialCode: "+86", country: "China" },
// 		{ code: "+886", dialCode: "+886", country: "Taiwan" },
// 		{ code: "+61", dialCode: "+61", country: "Australia" },
// 		{ code: "+33", dialCode: "+33", country: "France" },
// 		{ code: "+49", dialCode: "+49", country: "Germany" },
// 		{ code: "+65", dialCode: "+65", country: "Singapore" },
// 	];
// 	const [accordionState, setAccordionState] = useState(initialAccordionState);

// 	const [paxList, setPaxList] = useState<PaxListItem[]>([
// 		{ id: "1", name: "YAMADA TARO", category: "Adult", price: 3000, checked: false },
// 		{ id: "2", name: "YAMADA HANAKO", category: "Adult", price: 3000, checked: true },
// 		{ id: "3", name: "YAMADA JIRO", category: "Adult", price: 3000, checked: false },
// 		{ id: "4", name: "YAMADA SABURO", category: "Adult", price: 3000, checked: true },
// 		{
// 			id: "5",
// 			name: "YAMADA TARO",
// 			category: "0 - 1 year old",
// 			price: 0,
// 			checked: false,
// 			disabled: true,
// 		},
// 		{ id: "6", name: "YAMADA TARO", category: "Adult", price: 3000, checked: true },
// 	]);

// 	const baggageCarryOnOptions = [
// 		{ id: "7kg", label: "Up to 7kg", price: 0 },
// 		{ id: "15kg", label: "Up to 15kg", price: 3000 },
// 	];

// 	const baggageEquipment = [
// 		{ id: "ski", icon: "downhill_skiing", label: "Ski equipment", price: 3000 },
// 		{ id: "golf", icon: "golf_course", label: "Golf (1set)", price: 0 },
// 		{ id: "bicycle", icon: "directions_bike", label: "Bicycle equipment", price: 0 },
// 		{
// 			id: "surfboard",
// 			icon: "surfing",
// 			label: "Surfboard Equipment (200CM or Less) 1pc",
// 			price: 0,
// 		},
// 		{ id: "large", icon: "downhill_skiing", label: "Large (Longer than 200CM)", price: 0 },
// 		{ id: "snowboard", icon: "snowboarding", label: "Snow Board (1 set)", price: 0 },
// 	];

// 	const togglePassenger = (id: string, checked: boolean) => {
// 		setPaxList((prev) => prev.map((p) => (p.id === id ? { ...p, checked } : p)));
// 	};

// 	const toggleSelectAll = (checked: boolean) => {
// 		setPaxList((prev) => prev.map((p) => (p.disabled ? p : { ...p, checked })));
// 	};
// 	const toggleAccordion = (id: AccordionKey) => {
// 		setAccordionState((prev) => ({ ...prev, [id]: !prev[id] }));
// 	};

// 	const scrollToAndOpen = (key: AccordionKey) => {
// 		setAccordionState({ ...initialAccordionState, [key]: true });
// 		setTimeout(() => {
// 			const el = document.getElementById(key);
// 			const nav = document.querySelector<HTMLElement>("nav.sticky");
// 			if (el) {
// 				const navHeight = nav ? nav.getBoundingClientRect().height : 0;
// 				const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 8;
// 				window.scrollTo({ top, behavior: "smooth" });
// 			}
// 		}, 50);
// 	};

// 	return (
// 		<main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 pb-10">
// 			<header className="space-y-3 border-b pb-6">
// 				<p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.2em]">
// 					Shadcn UI Showcase
// 				</p>
// 				<h1 className="font-semibold text-4xl tracking-tight">Welcome to IBE Japan</h1>
// 				<p className="max-w-2xl text-muted-foreground text-sm">
// 					A preview of the shared UI package components organized into distinct sections for easier
// 					review.
// 				</p>
// 			</header>

// 			<nav className="z-10 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur">
// 				<p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-widest">
// 					Components
// 				</p>
// 				<div className="flex flex-wrap gap-1.5">
// 					{NAV_ITEMS.map(({ label, key }) => (
// 						<button
// 							key={key}
// 							type="button"
// 							onClick={() => scrollToAndOpen(key)}
// 							className="inline-flex cursor-pointer items-center rounded-full border bg-muted/40 px-3 py-1 font-medium text-xs transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
// 						>
// 							{label}
// 						</button>
// 					))}
// 				</div>
// 			</nav>

// 			<AccordionSection
// 				id="airCalendarTabs"
// 				title="AirCalendarTabs"
// 				description="Airline-style date/price calendar tabs with responsive horizontal scrolling on mobile and equal-width layout on desktop."
// 				isOpen={accordionState.airCalendarTabs}
// 				onToggle={() => toggleAccordion("airCalendarTabs")}
// 			>
// 				<div className="space-y-2">
// 					<AirCalendarTabs
// 						tabs={[
// 							{ value: "6-21", date: "6/21", price: "¥113,000" },
// 							{ value: "6-22", date: "6/22", price: "¥113,000" },
// 							{ value: "6-23", date: "6/23", price: "¥113,000" },
// 							{ value: "6-24", date: "6/24", price: "¥113,000" },
// 							{ value: "6-25", date: "6/25", price: "¥113,000" },
// 							{ value: "6-26", date: "6/26", price: "¥113,000" },
// 							{ value: "6-27", date: "6/27", price: "¥113,000" },
// 						]}
// 						defaultValue="6-21"
// 					/>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="alert"
// 				title="Alert"
// 				description="Four semantic variants — info, success, warning, error — each with an icon, title, description, and optional action button."
// 				isOpen={accordionState.alert}
// 				onToggle={() => toggleAccordion("alert")}
// 			>
// 				<div className="grid w-full items-start gap-4">
// 					<Alert variant="info">
// 						<AlertTitle>Title</AlertTitle>
// 						<AlertDescription>
// 							More info about this alert goes here. This example text is going to run a bit longer
// 							so that you can see how spacing within an alert works with this kind of content.
// 						</AlertDescription>
// 						<AlertAction>
// 							<Button outline variant={"secondary"} size={"md"}>
// 								<Icon name="add" size={20} color="" className="text-current" />
// 								button
// 							</Button>
// 						</AlertAction>
// 					</Alert>

// 					<Alert variant="success">
// 						<AlertTitle>Title</AlertTitle>
// 						<AlertDescription>
// 							More info about this alert goes here. This example text is going to run a bit longer
// 							so that you can see how spacing within an alert works with this kind of content.
// 						</AlertDescription>
// 						<AlertAction>
// 							<Button outline variant={"secondary"} size={"md"}>
// 								<Icon name="add" size={20} color="" className="text-current" />
// 								button
// 							</Button>
// 						</AlertAction>
// 					</Alert>

// 					<Alert variant="warning">
// 						<AlertTitle>Title</AlertTitle>
// 						<AlertDescription>
// 							More info about this alert goes here. This example text is going to run a bit longer
// 							so that you can see how spacing within an alert works with this kind of content.
// 						</AlertDescription>
// 						<AlertAction>
// 							<Button outline variant={"secondary"} size={"md"}>
// 								<Icon name="add" size={20} color="" className="text-current" />
// 								button
// 							</Button>
// 						</AlertAction>
// 					</Alert>

// 					<Alert variant="error">
// 						<AlertTitle>Title</AlertTitle>
// 						<AlertDescription>
// 							More info about this alert goes here. This example text is going to run a bit longer
// 							so that you can see how spacing within an alert works with this kind of content.
// 						</AlertDescription>
// 						<AlertAction>
// 							<Button outline variant={"secondary"} size={"md"}>
// 								<Icon name="add" size={20} color="" className="text-current" />
// 								button
// 							</Button>
// 						</AlertAction>
// 					</Alert>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="badge"
// 				title="Badge"
// 				description="Status and contextual labels in semantic variants."
// 				isOpen={accordionState.badge}
// 				onToggle={() => toggleAccordion("badge")}
// 			>
// 				<div className="flex flex-wrap items-center gap-3">
// 					<Badge>Default</Badge>
// 					<Badge variant="secondary">Secondary</Badge>
// 					<Badge variant="destructive">Required</Badge>
// 					<Badge variant="outline">Outline</Badge>
// 					<Badge variant="link">Link</Badge>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="tooltip"
// 				title="Tooltip"
// 				description="Four semantic variants — info, success, warning, error — each with an icon, title, description, and optional action button."
// 				isOpen={accordionState.tooltip}
// 				onToggle={() => toggleAccordion("tooltip")}
// 			>
// 				<div className="grid w-full items-start gap-4">
// 					<div className="flex flex-wrap gap-2">
// 						{(["left", "top", "bottom", "right"] as const).map((side) => (
// 							<Tooltip key={side}>
// 								<TooltipTrigger asChild>
// 									<Button variant="base" outline className="w-fit capitalize">
// 										{side}
// 									</Button>
// 								</TooltipTrigger>
// 								<TooltipContent side={side}>
// 									<p>
// 										You have not selected an arrival destination. Please click here to change the
// 										arrival destination.
// 									</p>
// 								</TooltipContent>
// 							</Tooltip>
// 						))}
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="tabs"
// 				title="Tabs"
// 				description="Segmented navigation with content panels."
// 				isOpen={accordionState.tabs}
// 				onToggle={() => toggleAccordion("tabs")}
// 			>
// 				<Tabs defaultValue="overview" className="w-full">
// 					<TabsList variant="line">
// 						<TabsTrigger value="overview">Overview</TabsTrigger>
// 						<TabsTrigger value="pricing">Pricing</TabsTrigger>
// 						<TabsTrigger value="rules">Rules</TabsTrigger>
// 					</TabsList>
// 					<TabsContent value="overview" className="rounded-md border p-4">
// 						Overview content
// 					</TabsContent>
// 					<TabsContent value="pricing" className="rounded-md border p-4">
// 						Pricing content
// 					</TabsContent>
// 					<TabsContent value="rules" className="rounded-md border p-4">
// 						Rules content
// 					</TabsContent>
// 				</Tabs>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="buttons"
// 				title="Button Redefined"
// 				isOpen={accordionState.buttons}
// 				onToggle={() => toggleAccordion("buttons")}
// 			>
// 				<div className="flex flex-col gap-6">
// 					{/* primary */}
// 					<div className="flex flex-col gap-2">
// 						<div>
// 							<p>Primary</p>
// 						</div>
// 						<div className="flex flex-wrap items-end gap-8">
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"primary"}>primary</Button>
// 								<p className="text-secondary-700 text-xs">md-40px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"primary"} disabled>
// 									disabled
// 								</Button>
// 								<p className="text-secondary-700 text-xs">md-40px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"primary"} outline>
// 									outline
// 								</Button>
// 								<p className="text-secondary-700 text-xs">md-40px</p>
// 							</div>
// 						</div>
// 					</div>
// 					{/* Secondary */}
// 					<div className="flex flex-col gap-2">
// 						<div>
// 							<p>Secondary</p>
// 						</div>
// 						<div className="flex flex-wrap items-end gap-8">
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"secondary"}>primary</Button>
// 								<p className="text-secondary-700 text-xs">md-40px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"secondary"} disabled>
// 									disabled
// 								</Button>
// 								<p className="text-secondary-700 text-xs">md-40px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"secondary"} outline>
// 									outline
// 								</Button>
// 								<p className="text-secondary-700 text-xs">md-40px</p>
// 							</div>
// 						</div>
// 					</div>

// 					{/* Danger */}
// 					<div className="flex flex-col gap-2">
// 						<div>
// 							<p>Danger</p>
// 						</div>
// 						<div className="flex flex-wrap items-end gap-8">
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"danger"}>primary</Button>
// 								<p className="text-secondary-700 text-xs">md-40px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"danger"} disabled>
// 									disabled
// 								</Button>
// 								<p className="text-secondary-700 text-xs">md-40px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"danger"} outline>
// 									outline
// 								</Button>
// 								<p className="text-secondary-700 text-xs">md-40px</p>
// 							</div>
// 						</div>
// 					</div>

// 					{/* primary size-chart */}
// 					<div className="flex flex-col gap-2">
// 						<div>
// 							<p>primary size-chart</p>
// 						</div>
// 						<div className="flex flex-wrap items-end gap-8">
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"primary"} size={"xs"}>
// 									button-xs
// 								</Button>
// 								<p className="text-secondary-700 text-xs">xs-32px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"primary"} size={"sm"}>
// 									button-sm
// 								</Button>
// 								<p className="text-secondary-700 text-xs">sm-36px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"primary"} size={"md"}>
// 									button-md
// 								</Button>
// 								<p className="text-secondary-700 text-xs">md-40px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"primary"} size={"base"}>
// 									button-base
// 								</Button>
// 								<p className="text-secondary-700 text-xs">base-44px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"primary"} size={"lg"}>
// 									button-lg
// 								</Button>
// 								<p className="text-secondary-700 text-xs">lg-48px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"primary"} size={"xl"}>
// 									button-xl
// 								</Button>
// 								<p className="text-secondary-700 text-xs">xl-52px</p>
// 							</div>
// 						</div>
// 					</div>

// 					{/* secondary size-chart */}
// 					<div className="flex flex-col gap-2">
// 						<div>
// 							<p>secondary size-chart</p>
// 						</div>
// 						<div className="flex flex-wrap items-end gap-8">
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"secondary"} size={"xs"}>
// 									button-xs
// 								</Button>
// 								<p className="text-secondary-700 text-xs">xs-32px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"secondary"} size={"sm"}>
// 									button-sm
// 								</Button>
// 								<p className="text-secondary-700 text-xs">sm-36px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"secondary"} size={"md"}>
// 									button-md
// 								</Button>
// 								<p className="text-secondary-700 text-xs">md-40px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"secondary"} size={"base"}>
// 									button-base
// 								</Button>
// 								<p className="text-secondary-700 text-xs">base-44px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"secondary"} size={"lg"}>
// 									button-lg
// 								</Button>
// 								<p className="text-secondary-700 text-xs">lg-48px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"secondary"} size={"xl"}>
// 									button-xl
// 								</Button>
// 								<p className="text-secondary-700 text-xs">xl-52px</p>
// 							</div>
// 						</div>
// 					</div>

// 					{/* danger size-chart */}
// 					<div className="flex flex-col gap-2">
// 						<div>
// 							<p>danger size-chart</p>
// 						</div>
// 						<div className="flex flex-wrap items-end gap-8">
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"danger"} size={"xs"}>
// 									button-xs
// 								</Button>
// 								<p className="text-secondary-700 text-xs">xs-32px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"danger"} size={"sm"}>
// 									button-sm
// 								</Button>
// 								<p className="text-secondary-700 text-xs">sm-36px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"danger"} size={"md"}>
// 									button-md
// 								</Button>
// 								<p className="text-secondary-700 text-xs">md-40px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"danger"} size={"base"}>
// 									button-base
// 								</Button>
// 								<p className="text-secondary-700 text-xs">base-44px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"danger"} size={"lg"}>
// 									button-lg
// 								</Button>
// 								<p className="text-secondary-700 text-xs">lg-48px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"danger"} size={"xl"}>
// 									button-xl
// 								</Button>
// 								<p className="text-secondary-700 text-xs">xl-52px</p>
// 							</div>
// 						</div>
// 					</div>

// 					{/* button with icon */}
// 					<div className="flex flex-col gap-2">
// 						<div>
// 							<p>button with icon</p>
// 						</div>
// 						<div className="flex flex-wrap items-end gap-8">
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"secondary"} size={"xs"}>
// 									<Icon name="add" size={20} color="" className="text-current" />
// 									Button
// 								</Button>
// 								<p className="text-secondary-700 text-xs">xs-32px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"secondary"} size={"sm"}>
// 									<Icon name="add" size={20} color="" className="text-current" />
// 									button-sm
// 								</Button>
// 								<p className="text-secondary-700 text-xs">sm-36px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"secondary"} size={"md"}>
// 									<Icon name="add" size={20} color="" className="text-current" />
// 									button-md
// 								</Button>
// 								<p className="text-secondary-700 text-xs">md-40px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"secondary"} size={"base"}>
// 									<Icon name="add" size={24} color="" className="text-current" />
// 									button-base
// 								</Button>
// 								<p className="text-secondary-700 text-xs">base-44px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"secondary"} size={"lg"}>
// 									<Icon name="add" size={24} color="" className="text-current" />
// 									button-lg
// 								</Button>
// 								<p className="text-secondary-700 text-xs">lg-48px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"secondary"} size={"xl"}>
// 									<Icon name="add" size={24} color="" className="text-current" />
// 									button-xl
// 								</Button>
// 								<p className="text-secondary-700 text-xs">xl-52px</p>
// 							</div>
// 						</div>
// 					</div>

// 					{/* icon outline */}
// 					<div className="flex flex-col gap-2">
// 						<div>
// 							<p>icon outline</p>
// 						</div>
// 						<div className="flex flex-wrap items-end gap-8">
// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"primary"} outline size={"xs"}>
// 									<Icon name="add" size={20} color="" className="text-current" />
// 									Button
// 								</Button>
// 								<p className="text-secondary-700 text-xs">xs-32px</p>
// 							</div>

// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"secondary"} outline size={"xs"}>
// 									<Icon name="add" size={20} color="" className="text-current" />
// 									Button
// 								</Button>
// 								<p className="text-secondary-700 text-xs">xs-32px</p>
// 							</div>

// 							<div className="flex flex-col items-center gap-2">
// 								<Button variant={"danger"} outline size={"xs"}>
// 									<Icon name="add" size={20} color="" className="text-current" />
// 									Button
// 								</Button>
// 								<p className="text-secondary-700 text-xs">xs-32px</p>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="switch"
// 				title="Button Group / Switch"
// 				description="Grouped button controls for toggling between states."
// 				isOpen={accordionState.switch}
// 				onToggle={() => toggleAccordion("switch")}
// 			>
// 				<div className="flex flex-col gap-4">
// 					<ButtonGroup>
// 						<Button variant={"base"} size={"base"} className="border-r-0">
// 							Follow
// 						</Button>
// 						<Input id="input-custom-filled" defaultValue="AB1234567" />
// 					</ButtonGroup>
// 					<ButtonGroup>
// 						<Input id="input-custom-filled" defaultValue="AB1234567" />
// 						<Button variant={"base"} size={"base"} className="border-l-0">
// 							Follow
// 						</Button>
// 					</ButtonGroup>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="checkbox"
// 				title="Checkbox"
// 				description="Toggle options with checkbox controls."
// 				isOpen={accordionState.checkbox}
// 				onToggle={() => toggleAccordion("checkbox")}
// 			>
// 				<div className="">
// 					<div className="flex flex-col gap-6">
// 						{/* primary */}
// 						<div className="flex flex-wrap items-end gap-8">
// 							<div className="flex flex-col items-center gap-2">
// 								<Field orientation="horizontal">
// 									<Checkbox id="toggle-checkbox-6" name="toggle-checkbox-6" />
// 									<FieldLabel htmlFor="toggle-checkbox-6">Enable notifications</FieldLabel>
// 								</Field>
// 								<p className="text-secondary-700 text-xs">default</p>
// 							</div>

// 							<div className="flex flex-col items-center gap-2">
// 								<Field orientation="horizontal">
// 									<Checkbox id="toggle-checkbox-7" name="toggle-checkbox" aria-invalid />
// 									<FieldLabel htmlFor="toggle-checkbox-7">Enable notifications</FieldLabel>
// 								</Field>
// 								<p className="text-secondary-700 text-xs">aria-invalid</p>
// 							</div>

// 							<div className="flex flex-col items-center gap-2">
// 								<Field orientation="horizontal" data-disabled>
// 									<Checkbox id="toggle-checkbox-8" name="toggle-checkbox" disabled />
// 									<FieldLabel htmlFor="toggle-checkbox-8">Enable notifications</FieldLabel>
// 								</Field>
// 								<p className="text-secondary-700 text-xs">disabled</p>
// 							</div>

// 							<div className="flex flex-col items-center gap-2">
// 								<Field orientation="horizontal" data-disabled>
// 									<Checkbox id="toggle-checkbox-8" name="toggle-checkbox" checked disabled />
// 									<FieldLabel htmlFor="toggle-checkbox-8">Enable notifications</FieldLabel>
// 								</Field>
// 								<p className="text-secondary-700 text-xs">disabled checked</p>
// 							</div>

// 							<div className="flex flex-col items-center gap-2">
// 								<Field orientation="horizontal" data-disabled>
// 									<Checkbox
// 										id="toggle-checkbox-8"
// 										name="toggle-checkbox"
// 										aria-invalid
// 										checked
// 										disabled
// 									/>
// 									<FieldLabel htmlFor="toggle-checkbox-8">Enable notifications</FieldLabel>
// 								</Field>
// 								<p className="text-secondary-700 text-xs">aria-invalid disabled checked</p>
// 							</div>
// 						</div>

// 						<div className="flex flex-wrap items-end gap-8">
// 							<div className="flex flex-col items-center gap-2">
// 								<FieldLabel>
// 									<Field orientation="horizontal">
// 										<Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" />
// 										<FieldContent>
// 											<FieldTitle>Enable notifications</FieldTitle>
// 										</FieldContent>
// 									</Field>
// 								</FieldLabel>
// 								<p className="text-secondary-700 text-xs">default</p>
// 							</div>

// 							<div className="flex flex-col items-center gap-2">
// 								<FieldLabel>
// 									<Field orientation="horizontal">
// 										<Checkbox aria-invalid id="toggle-checkbox-2" name="toggle-checkbox-2" />
// 										<FieldContent>
// 											<FieldTitle>Enable notifications</FieldTitle>
// 										</FieldContent>
// 									</Field>
// 								</FieldLabel>
// 								<p className="text-secondary-700 text-xs">aria-invalid</p>
// 							</div>

// 							<div className="flex flex-col items-center gap-2">
// 								<FieldLabel>
// 									<Field orientation="horizontal" data-disabled>
// 										<Checkbox disabled id="toggle-checkbox-2" name="toggle-checkbox-2" />
// 										<FieldContent>
// 											<FieldTitle>Enable notifications</FieldTitle>
// 										</FieldContent>
// 									</Field>
// 								</FieldLabel>
// 								<p className="text-secondary-700 text-xs">aria-invalid</p>
// 							</div>

// 							<div className="flex flex-col items-center gap-2">
// 								<FieldLabel>
// 									<Field orientation="horizontal" data-disabled>
// 										<Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" checked disabled />
// 										<FieldContent>
// 											<FieldTitle>Enable notifications</FieldTitle>
// 										</FieldContent>
// 									</Field>
// 								</FieldLabel>
// 								<p className="text-secondary-700 text-xs">default checked disabled</p>
// 							</div>

// 							<div className="flex flex-col items-center gap-2">
// 								<FieldLabel>
// 									<Field orientation="horizontal" data-disabled>
// 										<Checkbox
// 											id="toggle-checkbox-2"
// 											name="toggle-checkbox-2"
// 											aria-invalid
// 											checked
// 											disabled
// 										/>
// 										<FieldContent>
// 											<FieldTitle>Enable notifications</FieldTitle>
// 										</FieldContent>
// 									</Field>
// 								</FieldLabel>
// 								<p className="text-secondary-700 text-xs">aria-invalid checked disabled</p>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="combobox"
// 				title="Combobox"
// 				description="Combobox with clear button to reset selected value."
// 				isOpen={accordionState.combobox}
// 				onToggle={() => toggleAccordion("combobox")}
// 			>
// 				<div className="flex flex-col gap-6">
// 					<Combobox>
// 						<ComboboxInput showClear />
// 						<ComboboxContent>
// 							<ComboboxList>
// 								<ComboboxItem value="apple">Apple</ComboboxItem>
// 								<ComboboxItem value="banana">Banana</ComboboxItem>
// 								<ComboboxItem value="cherry">Cherry</ComboboxItem>
// 								<ComboboxItem value="date">Date</ComboboxItem>
// 								<ComboboxItem value="elderberry">Elderberry</ComboboxItem>
// 							</ComboboxList>
// 						</ComboboxContent>
// 					</Combobox>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="dialogBasic"
// 				title="Dialog"
// 				description="Modal dialog with configurable desktop widths (576px, 640px, 1024px) and mobile outer spacing (0px or 16px)."
// 				isOpen={accordionState.dialogBasic}
// 				onToggle={() => toggleAccordion("dialogBasic")}
// 			>
// 				<div className="space-y-4">
// 					<div>
// 						<p className="mb-3 font-medium text-secondary-700 text-xs">
// 							Desktop: configurable 576px / 640px / 1024px
// 						</p>
// 						<div className="flex flex-wrap gap-3">
// 							<Dialog>
// 								<DialogTrigger asChild>
// 									<Button>Open 576px Dialog</Button>
// 								</DialogTrigger>
// 								<DialogContent desktopWidth={576}>
// 									<DialogHeader>
// 										<DialogTitle>Compact Dialog (576px)</DialogTitle>
// 									</DialogHeader>
// 									<div className="flex flex-col items-center justify-center gap-3 py-8">
// 										<Spinner size="md" />
// 										<p className="font-medium text-secondary-700 text-sm">
// 											Best for short confirmations and quick actions.
// 										</p>
// 									</div>
// 								</DialogContent>
// 							</Dialog>

// 							<Dialog>
// 								<DialogTrigger asChild>
// 									<Button>Open 640px Dialog</Button>
// 								</DialogTrigger>
// 								<DialogContent desktopWidth={640}>
// 									<DialogHeader>
// 										<DialogTitle>Default Dialog (640px)</DialogTitle>
// 									</DialogHeader>
// 									<div className="flex flex-col items-center justify-center gap-3 py-8">
// 										<Spinner size="lg" />
// 										<p className="font-medium text-secondary-700 text-sm">
// 											Balanced layout for common forms and selectors.
// 										</p>
// 									</div>
// 								</DialogContent>
// 							</Dialog>

// 							<Dialog>
// 								<DialogTrigger asChild>
// 									<Button>Open 1024px Dialog</Button>
// 								</DialogTrigger>
// 								<DialogContent desktopWidth={1024}>
// 									<DialogHeader>
// 										<DialogTitle>Wide Dialog (1024px)</DialogTitle>
// 									</DialogHeader>
// 									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
// 										<div className="rounded-lg border border-base-200 p-4">
// 											<p className="font-medium text-sm">Left Pane</p>
// 											<p className="mt-1 text-secondary-700 text-sm">
// 												Use this for filters, summaries, or navigation.
// 											</p>
// 										</div>
// 										<div className="rounded-lg border border-base-200 p-4">
// 											<p className="font-medium text-sm">Right Pane</p>
// 											<p className="mt-1 text-secondary-700 text-sm">
// 												Ideal for content-dense previews or multi-column forms.
// 											</p>
// 										</div>
// 									</div>
// 								</DialogContent>
// 							</Dialog>
// 						</div>
// 					</div>

// 					<div className="border-t pt-4">
// 						<p className="mb-3 font-medium text-secondary-700 text-xs">
// 							Mobile: Outer spacing variants (16px margins vs full-width)
// 						</p>
// 						<div className="space-y-3">
// 							<div>
// 								<p className="mb-2 text-secondary-700 text-xs">With 16px outer spacing (default)</p>
// 								<Dialog>
// 									<DialogTrigger asChild>
// 										<Button variant="secondary">Open Dialog — 16px spacing</Button>
// 									</DialogTrigger>
// 									<DialogContent mobileOuterSpacing={16}>
// 										<DialogHeader>
// 											<DialogTitle>Location Selection</DialogTitle>
// 										</DialogHeader>
// 										<div className="space-y-3">
// 											<div className="rounded-lg border border-base-200 p-3">
// 												<p className="font-medium text-sm">Tokyo Haneda</p>
// 												<p className="mt-1 text-secondary-700 text-xs">Primary airport</p>
// 											</div>
// 											<div className="rounded-lg border border-base-200 p-3">
// 												<p className="font-medium text-sm">Tokyo Narita</p>
// 												<p className="mt-1 text-secondary-700 text-xs">International airport</p>
// 											</div>
// 										</div>
// 										<DialogFooter>
// 											<DialogClose asChild>
// 												<Button outline>Cancel</Button>
// 											</DialogClose>
// 											<Button>Confirm</Button>
// 										</DialogFooter>
// 									</DialogContent>
// 								</Dialog>
// 							</div>

// 							<div>
// 								<p className="mb-2 text-secondary-700 text-xs">
// 									Full-width with no outer spacing (0px)
// 								</p>
// 								<Dialog>
// 									<DialogTrigger asChild>
// 										<Button variant="secondary">Open Dialog — 0px spacing</Button>
// 									</DialogTrigger>
// 									<DialogContent mobileOuterSpacing={0}>
// 										<DialogHeader>
// 											<DialogTitle>Seat Map Selection</DialogTitle>
// 										</DialogHeader>
// 										<div className="space-y-2">
// 											<div className="flex gap-2">
// 												<div className="flex-1 rounded border border-base-200 p-2 text-center text-xs">
// 													Seat 1A
// 												</div>
// 												<div className="flex-1 rounded border border-base-200 p-2 text-center text-xs">
// 													Seat 1B
// 												</div>
// 												<div className="flex-1 rounded border border-base-200 p-2 text-center text-xs">
// 													Seat 1C
// 												</div>
// 											</div>
// 											<div className="flex gap-2">
// 												<div className="flex-1 rounded border border-base-200 p-2 text-center text-xs">
// 													Seat 2A
// 												</div>
// 												<div className="flex-1 rounded border border-base-200 p-2 text-center text-xs">
// 													Seat 2B
// 												</div>
// 												<div className="flex-1 rounded border border-base-200 p-2 text-center text-xs">
// 													Seat 2C
// 												</div>
// 											</div>
// 										</div>
// 										<DialogFooter>
// 											<DialogClose asChild>
// 												<Button outline>Cancel</Button>
// 											</DialogClose>
// 											<Button>Book Seat</Button>
// 										</DialogFooter>
// 									</DialogContent>
// 								</Dialog>
// 							</div>
// 						</div>
// 					</div>

// 					<div className="border-t pt-4">
// 						<p className="mb-3 font-medium text-secondary-700 text-xs">
// 							Dialog with Form — Edit Profile
// 						</p>
// 						<Dialog>
// 							<DialogTrigger asChild>
// 								<Button outline>Open Form Dialog</Button>
// 							</DialogTrigger>
// 							<DialogContent>
// 								<DialogHeader>
// 									<DialogTitle>Edit Profile</DialogTitle>
// 								</DialogHeader>
// 								<form className="space-y-4">
// 									<div className="space-y-2">
// 										{/* <label className="font-medium text-base-900 text-sm">Name</label> */}
// 										<Input placeholder="Enter your name" defaultValue="John Doe" />
// 									</div>
// 									<div className="space-y-2">
// 										{/* <label className="font-medium text-base-900 text-sm">Email</label> */}
// 										<Input
// 											type="email"
// 											placeholder="Enter your email"
// 											defaultValue="john@example.com"
// 										/>
// 									</div>
// 									<DialogFooter>
// 										<DialogClose asChild>
// 											<Button outline>Cancel</Button>
// 										</DialogClose>
// 										<Button type="submit">Save Changes</Button>
// 									</DialogFooter>
// 								</form>
// 							</DialogContent>
// 						</Dialog>
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="icon"
// 				title="Icon (Completed-DS)"
// 				isOpen={accordionState.icon}
// 				onToggle={() => toggleAccordion("icon")}
// 			>
// 				<Icon name="home" size={24} fill={1} wght={700} grad={0} opsz={48} />
// 			</AccordionSection>

// 			<AccordionSection
// 				id="input"
// 				title="Input"
// 				isOpen={accordionState.input}
// 				onToggle={() => toggleAccordion("input")}
// 			>
// 				<div className="space-y-8">
// 					<div>
// 						<h3 className="mb-4 font-semibold text-lg">Input Field Examples</h3>
// 						<div className="grid w-full grid-cols-1 gap-[1.375rem] sm:grid-cols-2 sm:gap-4">
// 							<InputField
// 								id="input-custom-filled"
// 								label="Last Name"
// 								labelHtmlFor="form-rhf-demo-title"
// 								title="Half-width alphabet"
// 								badge={{ variant: "destructive", text: "required" }}
// 								defaultValue="AB1234567"
// 								errors={[
// 									{ message: "Please enter Last Name" },
// 									{ message: "Please enter within 64 characters" },
// 								]}
// 							/>

// 							<InputField
// 								id="input-filled"
// 								label="Filled"
// 								labelHtmlFor="input-filled"
// 								defaultValue="AB1234567"
// 							/>

// 							<InputField
// 								id="input-required"
// 								label="Last Name"
// 								labelHtmlFor="input-required"
// 								title="Half-width alphabet"
// 								badge={{ variant: "destructive", text: "Required" }}
// 								placeholder="Enter your name"
// 								defaultValue="HARUTO"
// 								errors={[
// 									{ message: "Please enter Last Name" },
// 									{ message: "Please enter within 64 characters" },
// 								]}
// 							/>
// 						</div>
// 					</div>

// 					<div className="border-t pt-6">
// 						<h3 className="mb-4 font-semibold text-lg">InputField Component (Reusable)</h3>
// 						<p className="mb-6 text-muted-foreground text-sm">
// 							On mobile: Long labels wrap badge to a new line. On desktop: Label and badge stay on
// 							the same line.
// 						</p>
// 						<div className="grid w-full grid-cols-1 gap-[1.375rem] sm:grid-cols-2 sm:gap-4">
// 							{/* Mobile responsive: badge wraps on small screens, stays inline on desktop */}
// 							<InputField
// 								label="Hotel Name or Destination Address"
// 								labelHtmlFor="inputfield-hotel"
// 								id="inputfield-hotel"
// 								title="Half-width alphanumeric"
// 								badge={{ variant: "destructive", text: "Optional" }}
// 								placeholder="Enter hotel or destination"
// 							/>

// 							<InputField
// 								label="Last Name"
// 								labelHtmlFor="inputfield-1"
// 								id="inputfield-1"
// 								title="Half-width alphabet"
// 								badge={{ variant: "destructive", text: "Required" }}
// 								placeholder="Enter your name"
// 								defaultValue="HARUTO"
// 								errors={[
// 									{ message: "Please enter Last Name" },
// 									{ message: "Please enter within 64 characters" },
// 								]}
// 							/>

// 							<InputField
// 								label="First Name"
// 								labelHtmlFor="inputfield-2"
// 								id="inputfield-2"
// 								placeholder="Enter your name"
// 								defaultValue="Taro"
// 							/>

// 							<InputField
// 								label="Email"
// 								labelHtmlFor="inputfield-3"
// 								id="inputfield-3"
// 								type="email"
// 								title="Valid email format required"
// 								badge={{ variant: "destructive", text: "Required" }}
// 								placeholder="example@domain.com"
// 								errors={[{ message: "Please enter a valid email address" }]}
// 							/>

// 							<InputField
// 								label="Preferred Communication Method or Contact Preference"
// 								labelHtmlFor="inputfield-long"
// 								id="inputfield-long"
// 								title="Select your preference"
// 								badge={{ variant: "secondary", text: "Optional" }}
// 								placeholder="Choose preference"
// 							/>
// 						</div>
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="textarea"
// 				title="Textarea"
// 				description="Multi-line text input with built-in validation styles."
// 				isOpen={accordionState.textarea}
// 				onToggle={() => toggleAccordion("textarea")}
// 			>
// 				<div className="grid gap-4 sm:grid-cols-2">
// 					<Textarea placeholder="Enter additional notes" />
// 					<Textarea aria-invalid defaultValue="Invalid example" />
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="inputNumber"
// 				title="Input Number"
// 				description="Stepper with label row — desktop and mobile previews."
// 				isOpen={accordionState.inputNumber}
// 				onToggle={() => toggleAccordion("inputNumber")}
// 			>
// 				<div className="space-y-2">
// 					<InputNumberField label="Label" description="Description" />
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="radioGroup"
// 				title="Radio Group (Completed-DS)"
// 				isOpen={accordionState.radioGroup}
// 				onToggle={() => toggleAccordion("radioGroup")}
// 			>
// 				<div className="flex flex-col gap-6">
// 					<div>
// 						<p className="mb-2 font-medium text-secondary-700 text-sm">Bordered Variant</p>
// 						<RadioGroup className="flex flex-col gap-4" defaultValue="option1">
// 							<RadioGroupBorderedItem label="Option 1" value="option1" />
// 							<RadioGroupBorderedItem label="Option 2" value="option2" />
// 							<RadioGroupBorderedItem label="Option 3 (Invalid)" value="option3" aria-invalid />
// 						</RadioGroup>
// 					</div>
// 					<div className="border-t pt-4">
// 						<p className="mb-2 font-medium text-secondary-700 text-sm">Standard Variant</p>
// 						<RadioGroup>
// 							<RadioGroupItem value="option1" label="Option 1" />
// 							<RadioGroupItem value="option2" label="Option 2" />
// 							<RadioGroupItem value="option3" label="Option 3 (Invalid)" aria-invalid />
// 						</RadioGroup>
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="seatMap"
// 				title="Seat Map"
// 				description="Interactive aircraft seat map — cabin tiers, exit rows, and blocked seats."
// 				isOpen={accordionState.seatMap}
// 				onToggle={() => toggleAccordion("seatMap")}
// 			>
// 				<div className="flex flex-col gap-4 lg:flex-row lg:items-start">
// 					<SeatMapPassengerPanel
// 						className="lg:sticky lg:top-4 lg:w-[412px] lg:shrink-0"
// 						flightCode="NRT-BKK"
// 						passengers={[
// 							{ name: "YAMADA TARO", seatType: "Middle", seatCode: "20J", price: "¥0" },
// 							{ name: "YAMADA TARO", seatType: "Middle", seatCode: "20J", price: "¥0" },
// 							{ name: "YAMADA TARO", isSelected: true, badge: "Premium" },
// 							{ name: "YAMADA TARO" },
// 							{ name: "YAMADA TARO" },
// 							{ name: "YAMADA TARO" },
// 						]}
// 					/>
// 					<div className="mx-auto rounded-md bg-gray-300 px-6 lg:mx-0 lg:flex-1">
// 						<SeatMap
// 							data={seatMapData}
// 							selectedSeats={selectedSeatCodes}
// 							onSelectionChange={setSelectedSeatCodes}
// 						/>
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="label"
// 				title="Label"
// 				description="Accessible label primitive for form controls."
// 				isOpen={accordionState.label}
// 				onToggle={() => toggleAccordion("label")}
// 			>
// 				<div className="flex items-center gap-3">
// 					<Checkbox id="label-demo" />
// 					<Label htmlFor="label-demo">I accept the terms and privacy policy</Label>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="slider"
// 				title="Slider"
// 				description="Single and range selection sliders."
// 				isOpen={accordionState.slider}
// 				onToggle={() => toggleAccordion("slider")}
// 			>
// 				<div className="grid gap-6">
// 					<div className="space-y-2">
// 						<p className="text-secondary-700 text-xs">Single value</p>
// 						<Slider defaultValue={[40]} max={100} step={1} />
// 					</div>
// 					<div className="space-y-2">
// 						<p className="text-secondary-700 text-xs">Range</p>
// 						<Slider defaultValue={[20, 80]} max={100} step={1} />
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="separator"
// 				title="Separator"
// 				description="Horizontal and vertical separators."
// 				isOpen={accordionState.separator}
// 				onToggle={() => toggleAccordion("separator")}
// 			>
// 				<div className="space-y-4">
// 					<div>
// 						<p className="mb-2 text-sm">Section A</p>
// 						<Separator />
// 						<p className="mt-2 text-sm">Section B</p>
// 					</div>
// 					<div className="flex h-8 items-center gap-3 text-sm">
// 						<span>Left</span>
// 						<Separator orientation="vertical" />
// 						<span>Right</span>
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="menuList"
// 				title="Menu List"
// 				description="Selectable menu list rows with selected and empty states."
// 				isOpen={accordionState.menuList}
// 				onToggle={() => toggleAccordion("menuList")}
// 			>
// 				<div className="grid gap-2">
// 					<MenuList title="Tokyo Narita (NRT)" description="Japan" selected />
// 					<MenuList title="Honolulu (HNL)" description="United States" />
// 					<MenuList title="No Result" description="No airport found" empty />
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="cabinCard"
// 				title="Cabin Card"
// 				description="Flight cabin selection cards — supports adult-only and adult + child + infant pricing."
// 				isOpen={accordionState.cabinCard}
// 				onToggle={() => toggleAccordion("cabinCard")}
// 			>
// 				<div className="space-y-2">
// 					<p className="font-medium text-secondary-700 text-xs">
// 						Multi-pax — adult · child (age bands) · infant (interactive selection)
// 					</p>
// 					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
// 						<CabinCard
// 							cabinType="Standard"
// 							image="https://api.builder.io/api/v1/image/assets/TEMP/b7b56b95f0146c72db5e30abbb87d9c85b648e57?width=462"
// 							prices={{
// 								adult: "¥59,224",
// 								extras: [
// 									{ label: "Child (12 - 14 years)", price: "¥45,224" },
// 									{ label: "Child (7 - 11 years)", price: "¥35,224" },
// 									{ label: "Child (2 - 6 years)", price: "¥26,145" },
// 									{ label: "Infant (0 - 1 year)", price: "¥12,224" },
// 								],
// 							}}
// 							seatsLeft={5}
// 							selected={selectedCabin === "economy"}
// 							onClick={() => setSelectedCabin("economy")}
// 						/>
// 						<CabinCard
// 							cabinType="Premium Economy"
// 							image="https://api.builder.io/api/v1/image/assets/TEMP/b7b56b95f0146c72db5e30abbb87d9c85b648e57?width=462"
// 							prices={{
// 								adult: "¥89,500",
// 								extras: [
// 									{ label: "Child (2 - 6 years)", price: "¥44,750" },
// 									{ label: "Infant (0 - 1 year)", price: "¥18,000" },
// 								],
// 							}}
// 							seatsLeft={3}
// 							selected={selectedCabin === "premium"}
// 							onClick={() => setSelectedCabin("premium")}
// 						/>
// 						<CabinCard
// 							cabinType="Business"
// 							image="https://api.builder.io/api/v1/image/assets/TEMP/b7b56b95f0146c72db5e30abbb87d9c85b648e57?width=462"
// 							prices={{
// 								adult: "¥145,000",
// 								extras: [
// 									{ label: "Child (2 - 6 years)", price: "¥72,500" },
// 									{ label: "Infant (0 - 1 year)", price: "¥29,000" },
// 								],
// 							}}
// 							seatsLeft={2}
// 							selected={selectedCabin === "business"}
// 							onClick={() => setSelectedCabin("business")}
// 						/>
// 						<CabinCard
// 							cabinType="First"
// 							image="https://api.builder.io/api/v1/image/assets/TEMP/b7b56b95f0146c72db5e30abbb87d9c85b648e57?width=462"
// 							prices={{
// 								adult: "¥280,000",
// 								extras: [
// 									{ label: "Child (2 - 6 years)", price: "¥140,000" },
// 									{ label: "Infant (0 - 1 year)", price: "¥56,000" },
// 								],
// 							}}
// 							selected={selectedCabin === "first"}
// 							onClick={() => setSelectedCabin("first")}
// 						/>
// 					</div>
// 				</div>
// 				<div className="space-y-2 border-t pt-4">
// 					<p className="font-medium text-secondary-700 text-xs">
// 						Adult-only pricing (compact layout)
// 					</p>
// 					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
// 						<CabinCard
// 							cabinType="Standard"
// 							image="https://api.builder.io/api/v1/image/assets/TEMP/b7b56b95f0146c72db5e30abbb87d9c85b648e57?width=462"
// 							prices={{ adult: "¥59,224" }}
// 							seatsLeft={5}
// 						/>
// 						<CabinCard
// 							cabinType="Business"
// 							image="https://api.builder.io/api/v1/image/assets/TEMP/b7b56b95f0146c72db5e30abbb87d9c85b648e57?width=462"
// 							prices={{ adult: "¥145,000" }}
// 							selected
// 						/>
// 						<CabinCard
// 							cabinType="First"
// 							image="https://api.builder.io/api/v1/image/assets/TEMP/b7b56b95f0146c72db5e30abbb87d9c85b648e57?width=462"
// 							prices={{ adult: "¥280,000" }}
// 						/>
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="cabinTypeLegend"
// 				title="Cabin Type Legend"
// 				description="Header row showing available cabin types with seat icons and an optional info link."
// 				isOpen={accordionState.cabinTypeLegend}
// 				onToggle={() => toggleAccordion("cabinTypeLegend")}
// 			>
// 				<div className="space-y-2">
// 					<p className="font-medium text-secondary-700 text-xs">Standard & ZIP Full-Flat</p>
// 					<div className="rounded-lg border border-base-200 px-4 py-2">
// 						<CabinTypeLegend
// 							cabinTypes={[
// 								{ label: "Standard", icon: "airline_seat_recline_normal" },
// 								{ label: "ZIP Full-Flat", icon: "airline_seat_recline_extra" },
// 							]}
// 							infoText="More information on"
// 							infoLinkText="Standard & ZIP Full-Flat"
// 							infoLinkHref="#"
// 						/>
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="card"
// 				title="Card"
// 				description="Card primitives for grouped content blocks."
// 				isOpen={accordionState.card}
// 				onToggle={() => toggleAccordion("card")}
// 			>
// 				<div className="grid gap-4 sm:grid-cols-2">
// 					<Card>
// 						<CardHeader>
// 							<CardTitle>Standard Fare</CardTitle>
// 							<CardDescription>Tokyo Narita to Honolulu</CardDescription>
// 						</CardHeader>
// 						<CardContent>From ¥59,224 per adult</CardContent>
// 						<CardFooter>Taxes and fees excluded</CardFooter>
// 					</Card>
// 					<Card size="sm">
// 						<CardHeader>
// 							<CardTitle>Compact Card</CardTitle>
// 							<CardDescription>Small spacing variant</CardDescription>
// 						</CardHeader>
// 						<CardContent>Useful in side panels</CardContent>
// 					</Card>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="item"
// 				title="Item"
// 				description="Composable row primitive with media and metadata."
// 				isOpen={accordionState.item}
// 				onToggle={() => toggleAccordion("item")}
// 			>
// 				<ItemGroup>
// 					<Item variant="outline">
// 						<ItemMedia variant="icon">
// 							<Icon name="flight_takeoff" size={16} color="text-primary-600" />
// 						</ItemMedia>
// 						<ItemContent>
// 							<ItemTitle>Tokyo (NRT) to Honolulu (HNL)</ItemTitle>
// 							<ItemDescription>Direct flight · 10H15M · ZG002</ItemDescription>
// 						</ItemContent>
// 					</Item>
// 				</ItemGroup>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="flightInfo"
// 				title="Flight Info"
// 				description="Displays departure/arrival times, flight number, duration, and optional next-day offset."
// 				isOpen={accordionState.flightInfo}
// 				onToggle={() => toggleAccordion("flightInfo")}
// 			>
// 				<div className="space-y-2 border-t pt-4">
// 					<p className="font-medium text-secondary-700 text-xs">
// 						Full-width inside a search result card
// 					</p>
// 					<div className="flex flex-col gap-2">
// 						<FlightInfo
// 							departureTime="16:25"
// 							departureCity="Tokyo (Narita)"
// 							arrivalTime="9:40"
// 							arrivalCity="San Jose"
// 							flightNumber="ZG002"
// 							duration="10H15M"
// 							nextDayIndicator
// 						/>
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="flightMenuBar"
// 				title="Flight Menu Bar"
// 				description="Fare summary bar with route, date, and price breakdown action."
// 				isOpen={accordionState.flightMenuBar}
// 				onToggle={() => toggleAccordion("flightMenuBar")}
// 			>
// 				<FlightMenuBar />
// 			</AccordionSection>

// 			<AccordionSection
// 				id="select"
// 				title="Select"
// 				isOpen={accordionState.select}
// 				onToggle={() => toggleAccordion("select")}
// 			>
// 				<div className="grid w-full grid-cols-3 gap-4">
// 					<Field>
// 						<FieldLabel htmlFor="checkout-exp-month-ts6">Primary</FieldLabel>
// 						<Select defaultValue="">
// 							<SelectTrigger id="checkout-exp-month-ts6" selectSize="md">
// 								<SelectValue placeholder="MM" />
// 							</SelectTrigger>
// 							<SelectContent>
// 								<SelectGroup>
// 									<SelectItem value="01">01</SelectItem>
// 									<SelectItem value="02">02</SelectItem>
// 									<SelectItem value="03">03</SelectItem>
// 									<SelectItem value="04">04</SelectItem>
// 									<SelectItem value="05">05</SelectItem>
// 									<SelectItem value="06">06</SelectItem>
// 									<SelectItem value="07">07</SelectItem>
// 									<SelectItem value="08">08</SelectItem>
// 									<SelectItem value="09">09</SelectItem>
// 									<SelectItem value="10">10</SelectItem>
// 									<SelectItem value="11">11</SelectItem>
// 									<SelectItem value="12">12</SelectItem>
// 								</SelectGroup>
// 							</SelectContent>
// 						</Select>
// 					</Field>

// 					<Field>
// 						<FieldLabel htmlFor="checkout-7j9-exp-year-f59">aria-invalid</FieldLabel>
// 						<Select defaultValue="">
// 							<SelectTrigger aria-invalid id="checkout-7j9-exp-year-f59" selectSize="md">
// 								<SelectValue placeholder="YYYY" />
// 							</SelectTrigger>
// 							<SelectContent>
// 								<SelectGroup>
// 									<SelectItem value="2024">2024</SelectItem>
// 									<SelectItem value="2025">2025</SelectItem>
// 									<SelectItem value="2026">2026</SelectItem>
// 									<SelectItem value="2027">2027</SelectItem>
// 									<SelectItem value="2028">2028</SelectItem>
// 									<SelectItem value="2029">2029</SelectItem>
// 								</SelectGroup>
// 							</SelectContent>
// 						</Select>
// 					</Field>

// 					<Field>
// 						<FieldLabel htmlFor="checkout-7j9-exp-year-f59">Disabled</FieldLabel>
// 						<Select defaultValue="">
// 							<SelectTrigger disabled id="checkout-7j9-exp-year-f59" selectSize="md">
// 								<SelectValue placeholder="YYYY" />
// 							</SelectTrigger>
// 							<SelectContent>
// 								<SelectGroup>
// 									<SelectItem value="2024">2024</SelectItem>
// 									<SelectItem value="2025">2025</SelectItem>
// 									<SelectItem value="2026">2026</SelectItem>
// 									<SelectItem value="2027">2027</SelectItem>
// 									<SelectItem value="2028">2028</SelectItem>
// 									<SelectItem value="2029">2029</SelectItem>
// 								</SelectGroup>
// 							</SelectContent>
// 						</Select>
// 					</Field>

// 					<Field>
// 						<FieldLabel htmlFor="checkout-exp-month-ts6">Default</FieldLabel>
// 						<Select defaultValue="">
// 							<SelectTrigger id="checkout-exp-month-ts6" selectSize="md">
// 								<SelectValue placeholder="MM" />
// 							</SelectTrigger>
// 							<SelectContent>
// 								<SelectGroup>
// 									<SelectItem value="01">01</SelectItem>
// 									<SelectItem value="02">02</SelectItem>
// 								</SelectGroup>
// 							</SelectContent>
// 						</Select>
// 					</Field>

// 					<Field>
// 						<FieldLabel htmlFor="checkout-exp-month-ts6">With Value</FieldLabel>
// 						<Select defaultValue="">
// 							<SelectTrigger id="checkout-exp-month-ts6" selectSize="md">
// 								<SelectValue placeholder="MM" />
// 							</SelectTrigger>
// 							<SelectContent>
// 								<SelectGroup>
// 									<SelectItem value="01">01</SelectItem>
// 									<SelectItem value="02">02</SelectItem>
// 								</SelectGroup>
// 							</SelectContent>
// 						</Select>
// 					</Field>

// 					<Field>
// 						<FieldLabel htmlFor="checkout-exp-month-ts6">Compact List</FieldLabel>
// 						<Select defaultValue="">
// 							<SelectTrigger id="checkout-exp-month-ts6" selectSize="md">
// 								<SelectValue placeholder="MM" />
// 							</SelectTrigger>
// 							<SelectContent>
// 								<SelectGroup>
// 									<SelectItem value="01">01</SelectItem>
// 									<SelectItem value="02">02</SelectItem>
// 								</SelectGroup>
// 							</SelectContent>
// 						</Select>
// 					</Field>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="fieldInputs"
// 				title="Field Inputs"
// 				description="Wrapper components that combine form controls with Field layout, label, badge, title, and error handling."
// 				isOpen={accordionState.fieldInputs}
// 				onToggle={() => toggleAccordion("fieldInputs")}
// 			>
// 				<div className="space-y-8">
// 					{/* FieldSelect */}
// 					<div>
// 						<h3 className="mb-4 font-semibold text-lg">FieldSelect</h3>
// 						<p className="mb-4 text-muted-foreground text-sm">
// 							Select component with integrated field layout, label, required badge, and error
// 							handling.
// 						</p>
// 						<div className="grid w-full grid-cols-3 gap-4">
// 							<FieldSelect label="Month" required selectSize="md" placeholder="Select month">
// 								<SelectItem value="01">January</SelectItem>
// 								<SelectItem value="02">February</SelectItem>
// 								<SelectItem value="03">March</SelectItem>
// 								<SelectItem value="04">April</SelectItem>
// 							</FieldSelect>

// 							<FieldSelect
// 								label="Year"
// 								required
// 								selectSize="md"
// 								placeholder="Select year"
// 								invalid
// 								errors={[{ message: "Please select a year." }]}
// 							>
// 								<SelectItem value="2024">2024</SelectItem>
// 								<SelectItem value="2025">2025</SelectItem>
// 								<SelectItem value="2026">2026</SelectItem>
// 							</FieldSelect>

// 							<FieldSelect label="Country" placeholder="Choose country" selectSize="md">
// 								<SelectItem value="us">United States</SelectItem>
// 								<SelectItem value="jp">Japan</SelectItem>
// 								<SelectItem value="uk">United Kingdom</SelectItem>
// 							</FieldSelect>
// 						</div>
// 					</div>

// 					<div className="border-t pt-8">
// 						{/* FieldRadioGroup */}
// 						<h3 className="mb-4 font-semibold text-lg">FieldRadioGroup</h3>
// 						<p className="mb-4 text-muted-foreground text-sm">
// 							RadioGroup component with integrated field layout, label, required badge, and error
// 							handling.
// 						</p>
// 						<div className="grid w-full grid-cols-2 gap-8">
// 							<div>
// 								<h4 className="mb-3 font-medium text-base">Basic Example</h4>
// 								<FieldRadioGroup label="Cabin Type" required>
// 									<RadioGroupBorderedItem value="male" label="Male" className="flex-1" />
// 									<RadioGroupBorderedItem value="female" label="Female" className="flex-1" />
// 								</FieldRadioGroup>
// 							</div>

// 							<div>
// 								<h4 className="mb-3 font-medium text-base">With Error</h4>
// 								<FieldRadioGroup
// 									label="Gender"
// 									required
// 									className="flex flex-row gap-2"
// 									errors={[{ message: "Please select your gender" }]}
// 								>
// 									<RadioGroupBorderedItem value="male" label="Male" className="flex-1" />
// 									<RadioGroupBorderedItem value="female" label="Female" className="flex-1" />
// 								</FieldRadioGroup>
// 							</div>
// 						</div>
// 					</div>

// 					<div className="border-t pt-8">
// 						{/* FieldCheckboxField */}
// 						<h3 className="mb-4 font-semibold text-lg">FieldCheckboxField</h3>
// 						<p className="mb-4 text-muted-foreground text-sm">
// 							Checkbox component with integrated field label and error handling. Renders
// 							horizontally with content to the right.
// 						</p>
// 						<div className="space-y-3">
// 							<FieldCheckboxField id="terms" label="I agree to the terms and conditions" />
// 							<FieldCheckboxField
// 								id="newsletter"
// 								label="Subscribe to newsletter"
// 								title="Get updates delivered to your inbox"
// 							/>
// 							<FieldCheckboxField
// 								id="invalid-checkbox"
// 								label="Invalid checkbox example"
// 								errors={[{ message: "You must accept this to continue." }]}
// 							/>
// 						</div>
// 					</div>

// 					<div className="border-t pt-8">
// 						{/* FieldDimensionInput */}
// 						<h3 className="mb-4 font-semibold text-lg">FieldDimensionInput</h3>
// 						<p className="mb-4 text-muted-foreground text-sm">
// 							Numeric input with unit selection. Supports CM and KG units with label, title, and
// 							error handling.
// 						</p>
// 						<div className="grid w-full grid-cols-2 gap-4">
// 							<FieldDimensionInput
// 								id="dimension-1"
// 								label="Height"
// 								title="In centimeters"
// 								required
// 								unit={"cm"}
// 								placeholder="0"
// 							/>
// 							<FieldDimensionInput
// 								id="dimension-2"
// 								label="Weight"
// 								title="In kilograms"
// 								required
// 								invalid
// 								errors={[{ message: "Please enter a valid weight." }]}
// 								unit="kg"
// 								placeholder="0"
// 							/>
// 						</div>
// 					</div>

// 					<div className="border-t pt-8">
// 						{/* FieldPhoneField */}
// 						<h3 className="mb-4 font-semibold text-lg">FieldPhoneField</h3>
// 						<p className="mb-4 text-muted-foreground text-sm">
// 							Phone field with country code selector and validation. Includes label, title, and
// 							error handling.
// 						</p>
// 						<div className="grid w-full grid-cols-2 gap-4">
// 							<FieldPhoneField
// 								id="phone-1"
// 								label="Phone Number"
// 								title="Enter with country code"
// 								required
// 								placeholder="123-456-7890"
// 								extensions={[
// 									{ code: "+1", dialCode: "+1", country: "United States" },
// 									{ code: "+44", dialCode: "+44", country: "United Kingdom" },
// 									{ code: "+81", dialCode: "+81", country: "Japan" },
// 								]}
// 							/>
// 							<FieldPhoneField
// 								id="phone-2"
// 								label="Contact Number"
// 								title="Optional contact"
// 								placeholder="123-456-7890"
// 								invalid
// 								errors={[{ message: "Please enter a valid phone number." }]}
// 								extensions={[
// 									{ code: "+1", dialCode: "+1", country: "United States" },
// 									{ code: "+44", dialCode: "+44", country: "United Kingdom" },
// 									{ code: "+81", dialCode: "+81", country: "Japan" },
// 								]}
// 							/>
// 						</div>
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="spinner"
// 				title="Spinner"
// 				description="Circular ring spinner using Primary-600 arc on a gray track — matches Figma VD."
// 				isOpen={accordionState.spinner}
// 				onToggle={() => toggleAccordion("spinner")}
// 			>
// 				<div className="space-y-6">
// 					{/* Size variants */}
// 					<div className="space-y-3">
// 						<h3 className="font-semibold text-base">Size Variants</h3>
// 						<div className="flex flex-wrap items-end gap-8">
// 							<div className="flex flex-col items-center gap-2">
// 								<Spinner size="sm" />
// 								<p className="text-secondary-700 text-xs">sm — 24px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Spinner size="md" />
// 								<p className="text-secondary-700 text-xs">md — 36px</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Spinner size="lg" />
// 								<p className="text-secondary-700 text-xs">lg — 48px (default)</p>
// 							</div>
// 							<div className="flex flex-col items-center gap-2">
// 								<Spinner size="xl" />
// 								<p className="text-secondary-700 text-xs">xl — 64px</p>
// 							</div>
// 						</div>
// 					</div>

// 					{/* Loading state pattern */}
// 					<div className="space-y-3 border-t pt-4">
// 						<h3 className="font-semibold text-base">Loading State Pattern</h3>
// 						<div className="flex flex-col items-center gap-3 rounded-xl border border-base-200 py-10">
// 							<Spinner size="lg" />
// 							<p className="font-medium text-secondary-700 text-sm">Loading</p>
// 						</div>
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="table"
// 				title="Table"
// 				description="Invoice data rendered with the shared table primitives."
// 				isOpen={accordionState.table}
// 				onToggle={() => toggleAccordion("table")}
// 			>
// 				<div className="overflow-hidden rounded-lg border">
// 					<Table>
// 						<TableCaption>A list of your recent invoices.</TableCaption>
// 						<TableHeader>
// 							<TableRow>
// 								<TableHead className="w-25">Invoice</TableHead>
// 								<TableHead>Status</TableHead>
// 								<TableHead>Method</TableHead>
// 								<TableHead className="text-right">Amount</TableHead>
// 							</TableRow>
// 						</TableHeader>
// 						<TableBody>
// 							{invoices.slice(0, 3).map((invoice) => (
// 								<TableRow key={invoice.invoice}>
// 									<TableCell className="font-medium">{invoice.invoice}</TableCell>
// 									<TableCell>{invoice.paymentStatus}</TableCell>
// 									<TableCell>{invoice.paymentMethod}</TableCell>
// 									<TableCell className="text-right">{invoice.totalAmount}</TableCell>
// 								</TableRow>
// 							))}
// 						</TableBody>
// 						<TableFooter>
// 							<TableRow>
// 								<TableCell colSpan={3}>Total</TableCell>
// 								<TableCell className="text-right">$2,500.00</TableCell>
// 							</TableRow>
// 						</TableFooter>
// 					</Table>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="wrapper"
// 				title="Wrapper"
// 				description="Reusable layout wrapper with background and padding variants."
// 				isOpen={accordionState.wrapper}
// 				onToggle={() => toggleAccordion("wrapper")}
// 			>
// 				<div className="space-y-6">
// 					<div className="space-y-2">
// 						<p className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
// 							Background Variants (Nested Layers)
// 						</p>
// 						<Wrapper bg="white" className="rounded border border-gray-300">
// 							<p className="mb-4 font-medium text-sm">bg=&quot;white&quot; — Outermost Layer</p>
// 							<Wrapper bg="gray-1" className="rounded border border-gray-200">
// 								<p className="mb-4 font-medium text-sm">
// 									bg=&quot;gray-1&quot; — gray-50 (Middle Layer)
// 								</p>
// 								<Wrapper bg="gray-2" className="rounded border border-gray-200">
// 									<p className="mb-4 font-medium text-sm">
// 										bg=&quot;gray-2&quot; — gray-100 (Innermost Layer)
// 									</p>
// 									<Wrapper bg="gray-1" className="rounded">
// 										<p className="font-medium text-sm">
// 											bg=&quot;gray-1&quot; — gray-50 (Innermost Layer)
// 										</p>
// 									</Wrapper>
// 								</Wrapper>
// 							</Wrapper>
// 						</Wrapper>
// 					</div>

// 					<div className="space-y-2">
// 						<p className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
// 							Padding Variants
// 						</p>
// 						<div className="flex flex-col gap-3">
// 							<Wrapper bg="gray-1" padding="sm" className="rounded">
// 								<p className="text-sm">padding=&quot;sm&quot; — p-3 (12px)</p>
// 							</Wrapper>
// 							<Wrapper bg="gray-1" padding="default" className="rounded">
// 								<p className="text-sm">padding=&quot;default&quot; — p-6 (24px)</p>
// 							</Wrapper>
// 						</div>
// 					</div>

// 					<div className="space-y-2">
// 						<p className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
// 							asChild — renders as &lt;section&gt;
// 						</p>
// 						<Wrapper asChild bg="gray-2" padding="lg" className="rounded">
// 							<section>
// 								<p className="text-sm">
// 									This Wrapper renders as a &lt;section&gt; via asChild prop.
// 								</p>
// 							</section>
// 						</Wrapper>
// 					</div>
// 				</div>
// 			</AccordionSection>
// 			<AccordionSection
// 				id="dimensionInput"
// 				title="Dimension Input"
// 				description="Numeric input with unit selection — supports CM and KG units."
// 				isOpen={accordionState.dimensionInput}
// 				onToggle={() => toggleAccordion("dimensionInput")}
// 			>
// 				<div className="grid w-full grid-cols-2 gap-4">
// 					<div className="space-y-2">
// 						<p className="font-medium text-secondary-700 text-xs">CM (Centimeters)</p>
// 						<DimensionInput unit="cm" defaultValue={180} min={0} max={300} />
// 					</div>

// 					<div className="space-y-2">
// 						<p className="font-medium text-secondary-700 text-xs">KG (Kilograms)</p>
// 						<DimensionInput unit="kg" defaultValue={75} min={0} max={200} />
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="phoneField"
// 				title="Phone Field"
// 				description="Phone number input with a country dial-code selector. The extension list is passed by the parent; clicking the extension shows a combobox dropdown with search functionality."
// 				isOpen={accordionState.phoneField}
// 				onToggle={() => toggleAccordion("phoneField")}
// 			>
// 				<div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
// 					{/* Controlled example */}
// 					<div className="space-y-2">
// 						<p className="font-medium text-secondary-700 text-xs">Controlled</p>
// 						<PhoneField
// 							extensions={phoneExtensions}
// 							selectedExtension={selectedExtension}
// 							onExtensionChange={setSelectedExtension}
// 							value={phoneNumber}
// 							onChange={(e) => setPhoneNumber(e.target.value)}
// 						/>
// 						<p className="text-muted-foreground text-xs">
// 							Selected: <span className="font-medium">{selectedExtension}</span>
// 							{phoneNumber && <> &nbsp;{phoneNumber}</>}
// 						</p>
// 					</div>

// 					{/* Disabled example */}
// 					<div className="space-y-2">
// 						<p className="font-medium text-secondary-700 text-xs">Disabled</p>
// 						<PhoneField
// 							extensions={phoneExtensions}
// 							selectedExtension="+81"
// 							placeholder="09012345678"
// 							disabled
// 						/>
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="siteChrome"
// 				title="Site Header & Footer"
// 				description="Reusable global site chrome components."
// 				isOpen={accordionState.siteChrome}
// 				onToggle={() => toggleAccordion("siteChrome")}
// 			>
// 				<div className="-mx-4 space-y-0 overflow-hidden border-t">
// 					<h2 className="px-4 pt-6 pb-2 font-semibold text-lg">Site Header</h2>
// 					<SiteHeader />
// 					<h2 className="px-4 pt-6 pb-2 font-semibold text-lg">Site Footer</h2>
// 					<SiteFooter />
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="paxList"
// 				title="Select Customers (Pax List)"
// 				description="Passenger selection cards with a select-all checkbox — supports default, selected, and disabled states."
// 				isOpen={accordionState.paxList ?? false}
// 				onToggle={() => toggleAccordion("paxList")}
// 			>
// 				<div className="max-w-[326px] py-2">
// 					<SelectCustomers
// 						passengers={paxList}
// 						onPassengerChange={togglePassenger}
// 						onSelectAllChange={toggleSelectAll}
// 					/>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="servicePromoCard"
// 				title="Service Promo Card"
// 				description="Promotional service card (image, floating icon badge, discount badge, and free-items hint) paired with the passenger list — image/promo on the left, a divider, and the Select Customers list on the right."
// 				isOpen={accordionState.servicePromoCard ?? false}
// 				onToggle={() => toggleAccordion("servicePromoCard")}
// 			>
// 				<div className="flex flex-col gap-6 py-2 md:flex-row md:items-start">
// 					<div className="w-full md:max-w-[326px] md:shrink-0">
// 						<ServicePromoCard
// 							imageSrc="https://api.builder.io/api/v1/image/assets/TEMP/af62e328d22a10efc0622bd2846d102dfc62fbc3?width=650"
// 							icon="luggage"
// 							discountLabel="30% Discount"
// 							title="Baggage"
// 							description="Reserve your preferred seat for extra comfort."
// 							freeItemsText="2 free items yet to select"
// 						/>
// 					</div>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="productCard"
// 				title="Product Card"
// 				description="Product/merchandise card with image, a highlight badge, dish name, price, and an Add to Cart button."
// 				isOpen={accordionState.productCard ?? false}
// 				onToggle={() => toggleAccordion("productCard")}
// 			>
// 				<div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
// 					<ProductCard
// 						imageSrc="https://api.builder.io/api/v1/image/assets/TEMP/73a48b19b676d1b91f6d5aa43c269e9c2aa46013?width=488"
// 						badgeLabel="Highly chosen"
// 						name="Tako Rice 3kg and Non-alcoholic Amazake"
// 						price={700}
// 						onAddToCart={() => {
// 							console.log("Added to cart");
// 						}}
// 					/>
// 					<ProductCard
// 						imageSrc="https://api.builder.io/api/v1/image/assets/TEMP/73a48b19b676d1b91f6d5aa43c269e9c2aa46013?width=488"
// 						name="Seasonal fruit and cheese plate"
// 						originalPrice={900}
// 						price={300}
// 						onAddToCart={() => {
// 							console.log("Added to cart");
// 						}}
// 					/>
// 					<ProductCard
// 						imageSrc="https://api.builder.io/api/v1/image/assets/TEMP/73a48b19b676d1b91f6d5aa43c269e9c2aa46013?width=488"
// 						badgeLabel="Highly chosen"
// 						name="Miso ramen with soft-boiled egg"
// 						price={1600}
// 						disabled
// 					/>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="activityCard"
// 				title="Activity Card"
// 				description="Tour/activity card with image, title, more-info link, description, a per-duration age-group pricing table, and add-on service rows."
// 				isOpen={accordionState.activityCard ?? false}
// 				onToggle={() => toggleAccordion("activityCard")}
// 			>
// 				<div className="max-w-[465px] py-2">
// 					<TransportServiceCard
// 						imageSrc="https://api.builder.io/api/v1/image/assets/TEMP/c0a87218df3ef46825491e664e17b2ff3b8a8890?width=1258"
// 						title="LeaLea Trolley"
// 						moreInfoHref="#"
// 						description="Unlimited & unlimited trolley service in Honolulu."
// 						ageGroupLabels={["12 years and Older", "2 - 11 years old"]}
// 						pricingRows={[
// 							{ label: "7 days", prices: [8200, 6600] },
// 							{ label: "4 days", prices: [6500, 4500] },
// 							{ label: "1 day", prices: [3500, 1900] },
// 						]}
// 						footnote="*Free for children under 1 year old"
// 						services={[
// 							{
// 								label: "Trolley Services (7 days)",
// 								onAdd: () => {
// 									console.log("Added Trolley Services (7 days)");
// 								},
// 							},
// 							{
// 								label: "Trolley Services (4 days)",
// 								onAdd: () => {
// 									console.log("Added Trolley Services (4 days)");
// 								},
// 							},
// 							{
// 								label: "Trolley Services (1 day)",
// 								onAdd: () => {
// 									console.log("Added Trolley Services (1 day)");
// 								},
// 							},
// 						]}
// 					/>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="baggagePaxCard"
// 				title="Baggage/Bundle Pax Card"
// 				description="Per-passenger bundle summary card with badge, add/change button, included-baggage alert, and an itemized cost breakdown in the selected (edit) state."
// 				isOpen={accordionState.baggagePaxCard ?? false}
// 				onToggle={() => toggleAccordion("baggagePaxCard")}
// 			>
// 				<div className="flex flex-col gap-4 py-2">
// 					<PassengerService
// 						name="YAMADA TARO"
// 						bundleLabel="No Bundle"
// 						features={[
// 							"Carry-on Baggage - Limited to 2 pieces (Combined total weight: within 7 kg)",
// 						]}
// 						totalPrice={39000}
// 						categories={[
// 							{
// 								title: "Carry-on baggage",
// 								items: [{ label: "15kg (up to 2 items in total)", price: 3000 }],
// 							},
// 							{
// 								title: "Checked-in baggage",
// 								items: [{ label: "2 Baggages", price: 6000 }],
// 							},
// 							{
// 								title: "Sports equipment",
// 								items: [
// 									{ label: "Surfboard equipment (up to 200cm in length)", price: 10000 },
// 									{ label: "Golf equipment", price: 12000 },
// 									{ label: "Snowboard equipment", price: 8000 },
// 								],
// 							},
// 						]}
// 						dialog={
// 							<BaggageSelectionDialog
// 								passengerName="YAMADA TARO"
// 								bundleLabel="No Bundle"
// 								carryOnOptions={baggageCarryOnOptions}
// 								equipment={baggageEquipment}
// 								defaultValues={{
// 									carryOnId: "7kg",
// 									checkedInBaggageCount: 1,
// 									equipmentCounts: { ski: 1 },
// 								}}
// 								onConfirm={(values, price) => {
// 									console.log("Baggage selection confirmed", values, price);
// 								}}
// 							/>
// 						}
// 					/>
// 					<PassengerService
// 						name="YAMADA HANAKA"
// 						bundleLabel="No Bundle"
// 						features={[
// 							"Carry-on Baggage - Limited to 2 pieces (Combined total weight: within 7 kg)",
// 						]}
// 						dialog={
// 							<BaggageSelectionDialog
// 								passengerName="YAMADA HANAKA"
// 								bundleLabel="No Bundle"
// 								carryOnOptions={baggageCarryOnOptions}
// 								equipment={baggageEquipment}
// 							/>
// 						}
// 					/>
// 					<PassengerService
// 						name="YAMADA GORO"
// 						bundleLabel="Flex Biz"
// 						features={[
// 							"Carry-on Baggage - Limited to 2 pieces (Combined total weight: within 15 kg)",
// 							"Check-in Baggage - 1 Piece upto 30 kg will be included in the bundle",
// 						]}
// 						dialog={
// 							<BaggageSelectionDialog
// 								passengerName="YAMADA GORO"
// 								bundleLabel="Flex Biz"
// 								carryOnOptions={baggageCarryOnOptions}
// 								equipment={baggageEquipment}
// 							/>
// 						}
// 					/>
// 					<PassengerService
// 						name="YAMADA ROKURO"
// 						bundleLabel="Flex Biz"
// 						features={[
// 							"Carry-on Baggage - Limited to 2 pieces (Combined total weight: within 15 kg)",
// 						]}
// 						dialog={
// 							<BaggageSelectionDialog
// 								passengerName="YAMADA ROKURO"
// 								bundleLabel="Flex Biz"
// 								carryOnOptions={baggageCarryOnOptions}
// 								equipment={baggageEquipment}
// 							/>
// 						}
// 					/>
// 					<PassengerService
// 						name="YAMADA HACHIRO"
// 						bundleLabel="No Bundle"
// 						features={[
// 							"Carry-on Baggage - Limited to 2 pieces (Combined total weight: within 7 kg)",
// 						]}
// 						dialog={
// 							<BaggageSelectionDialog
// 								passengerName="YAMADA HACHIRO"
// 								bundleLabel="No Bundle"
// 								carryOnOptions={baggageCarryOnOptions}
// 								equipment={baggageEquipment}
// 							/>
// 						}
// 					/>
// 					<PassengerService
// 						name="YAMADA HACHIRO"
// 						bundleLabel="Flex Biz"
// 						features={[
// 							"Carry-on Baggage - Limited to 2 pieces (Combined total weight: within 15 kg)",
// 						]}
// 						dialog={
// 							<BaggageSelectionDialog
// 								passengerName="YAMADA HACHIRO"
// 								bundleLabel="Flex Biz"
// 								carryOnOptions={baggageCarryOnOptions}
// 								equipment={baggageEquipment}
// 							/>
// 						}
// 					/>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="inflightMeal"
// 				title="Inflight Meal"
// 				description="Meal selection cards with dish image, dietary badge, drink indicator, and bundle pricing."
// 				isOpen={accordionState.inflightMeal ?? false}
// 				onToggle={() => toggleAccordion("inflightMeal")}
// 			>
// 				<div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
// 					<MealCard
// 						imageSrc="https://api.builder.io/api/v1/image/assets/TEMP/f2d2a56a171815e11d4c0776cb6c804b059623e7?width=1304"
// 						dishName="Chilled tanuki soba"
// 						hasDrink
// 						bundleLabel="Bundle"
// 						originalPrice={1500}
// 						price={700}
// 						mealDialog={{
// 							passengerName: "YAMADA TARO",
// 							routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 							imageSrc:
// 								"https://api.builder.io/api/v1/image/assets/TEMP/f2d2a56a171815e11d4c0776cb6c804b059623e7?width=1304",
// 							dishName: "Chilled tanuki soba",
// 							bundleLabel: "Bundle",
// 							originalPrice: 1500,
// 							price: 700,
// 							allergies: "Soba, shrimp, wheat",
// 							allergyDetails:
// 								"【Japan】 Mandated by Cabinet Office Ordinance (8 items), Recommended by Notice (20 items) : Wheat, Egg,Milk,Soybeans,Pork, Apples【US】 Mandated by Cabinet Office Ordinance (9 items) : Egg,Milk,Wheat,Soy Beans. Sodium :4gSugars :85gCalories :932kcal",
// 							nutrition: "Salt: 3.0g, Carbohydrates: 52.2g, Energy: 295kcal",
// 							drinkNote: "Water will be provided regardless of the drink selection.",
// 							drinkOptions: [
// 								{
// 									id: "canada-dry",
// 									label: "Canada Dry Ginger Ale 350ml",
// 									originalPrice: 300,
// 									price: 270,
// 								},
// 								{ id: "coca-cola", label: "Coca-Cola 350ml", originalPrice: 300, price: 270 },
// 							],
// 							defaultDrinkId: "canada-dry",
// 							deliveryTimingOptions: [
// 								{ id: "4-hours", label: "Approximately 4 hours after take off", price: 300 },
// 							],
// 						}}
// 					/>
// 					<MealCard
// 						imageSrc="https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470"
// 						dishName="Filling pork cutlet sandwich"
// 						isHalal
// 						hasDrink
// 						bundleLabel="Bundle"
// 						originalPrice={1500}
// 						price={0}
// 						mealDialog={{
// 							passengerName: "YAMADA HANAKA",
// 							routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 							imageSrc:
// 								"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 							dishName: "Filling pork cutlet sandwich",
// 							bundleLabel: "Bundle",
// 							originalPrice: 1500,
// 							price: 0,
// 							allergies: "Pork, wheat, egg",
// 							drinkOptions: [
// 								{
// 									id: "canada-dry",
// 									label: "Canada Dry Ginger Ale 350ml",
// 									originalPrice: 300,
// 									price: 270,
// 								},
// 								{ id: "coca-cola", label: "Coca-Cola 350ml", originalPrice: 300, price: 270 },
// 							],
// 							defaultDrinkId: "canada-dry",
// 							deliveryTimingOptions: [
// 								{ id: "4-hours", label: "Approximately 4 hours after take off", price: 300 },
// 							],
// 						}}
// 					/>
// 					<MealCard
// 						imageSrc="https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470"
// 						dishName="Halal beef curry rice"
// 						isHalal
// 						price={1200}
// 						mealDialog={{
// 							passengerName: "YAMADA GORO",
// 							routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 							imageSrc:
// 								"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 							dishName: "Halal beef curry rice",
// 							price: 1200,
// 							allergies: "Beef, wheat",
// 							drinkOptions: [
// 								{ id: "water", label: "Mineral water 350ml", price: 0 },
// 								{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 							],
// 							defaultDrinkId: "water",
// 							deliveryTimingOptions: [
// 								{ id: "4-hours", label: "Approximately 4 hours after take off", price: 300 },
// 							],
// 						}}
// 					/>
// 					<MealCard
// 						imageSrc="https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470"
// 						dishName="Vegetable udon noodle soup"
// 						price={1000}
// 					/>
// 					<MealCard
// 						imageSrc="https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470"
// 						dishName="Halal salmon onigiri set"
// 						isHalal
// 						hasDrink
// 						price={1400}
// 					/>
// 					<MealCard
// 						imageSrc="https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470"
// 						dishName="Seasonal fruit and cheese plate"
// 						bundleLabel="Bundle"
// 						originalPrice={900}
// 						price={300}
// 					/>
// 					<MealCard
// 						imageSrc="https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470"
// 						dishName="Miso ramen with soft-boiled egg"
// 						hasDrink
// 						price={1600}
// 						disabled
// 					/>
// 					<MealCard
// 						imageSrc="https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470"
// 						dishName="Halal wagyu beef sandwich box"
// 						isHalal
// 						hasDrink
// 						bundleLabel="Bundle"
// 						originalPrice={2200}
// 						price={500}
// 					/>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="mealOptionCard"
// 				title="Meal Option Card"
// 				description="Compact selectable meal card with a check indicator, dish name, and price, used to choose between meal options."
// 				isOpen={accordionState.mealOptionCard ?? false}
// 				onToggle={() => toggleAccordion("mealOptionCard")}
// 			>
// 				<div className="flex flex-wrap gap-4 py-2">
// 					<ExtraServices
// 						imageSrc="https://cdn.builder.io/api/v1/image/assets%2F1d88f655588c4323b57cf482c868ad0b%2F2401de77c4e34522bc1bb342edb1dd94?format=webp&width=800&height=1200"
// 						dishName="microwavable rice（pack of 12）"
// 						price={700}
// 						selected={selectedMealOptionId === "rice"}
// 						onSelect={() => setSelectedMealOptionId("rice")}
// 					/>
// 					<ExtraServices
// 						imageSrc="https://cdn.builder.io/api/v1/image/assets%2F1d88f655588c4323b57cf482c868ad0b%2F2401de77c4e34522bc1bb342edb1dd94?format=webp&width=800&height=1200"
// 						dishName="Seasonal fruit and cheese plate"
// 						price={300}
// 						selected={selectedMealOptionId === "fruit"}
// 						onSelect={() => setSelectedMealOptionId("fruit")}
// 					/>
// 				</div>
// 			</AccordionSection>

// 			<AccordionSection
// 				id="inflightMealPaxCard"
// 				title="Inflight Meal Pax Card"
// 				description="Per-passenger meal summary card with badge, add/change button, free-meal eligibility alert, and an itemized meal breakdown with serving time in the selected (edit) state. Flow: Click Add/Change → Select meal → Customize drink & timing."
// 				isOpen={accordionState.inflightMealPaxCard ?? false}
// 				onToggle={() => toggleAccordion("inflightMealPaxCard")}
// 			>
// 				<div className="flex flex-col gap-4 py-2">
// 					<Alert variant="error">
// 						<AlertTitle>
// 							Please add the meals for &ldquo;YAMADA HANAKO&rdquo;, &ldquo;YAMADA GORO&rdquo; to
// 							continue.
// 						</AlertTitle>
// 					</Alert>

// 					<PassengerService
// 						name="YAMADA TARO"
// 						bundleLabel="No Bundle"
// 						totalPrice={39000}
// 						categories={[
// 							{
// 								items: [
// 									{
// 										label: "Spicy chicken rice",
// 										price: 10000,
// 										servingTime: "Approximately 4 hours after takeoff",
// 									},
// 									{
// 										label: "Chilled tanuki soba",
// 										price: 12000,
// 										servingTime: "Approximately 1 to 2 hours after takeoff",
// 									},
// 								],
// 							},
// 						]}
// 						dialog={
// 							<MealSelectionFlow
// 								passengerName="YAMADA TARO"
// 								routeLabel="Tokyo Narita (NRT) – Bangkok (BKK)"
// 								warningMessage="The service that you have selected is not included in the bundle and you will be charged for the services that you have selected."
// 								meals={[
// 									{
// 										id: "tempura-soba",
// 										name: "Soba with Bits of Tempura Batter",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										isHalal: true,
// 										hasDrink: true,
// 										bundleLabel: "Bundle",
// 										originalPrice: 1500,
// 										price: 0,
// 										category: "bundle",
// 									},
// 									{
// 										id: "pork-sandwich",
// 										name: "Filling pork cutlet sandwich",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										isHalal: true,
// 										hasDrink: true,
// 										bundleLabel: "Bundle",
// 										originalPrice: 1500,
// 										price: 0,
// 										category: "bundle",
// 									},
// 									{
// 										id: "sukeroku-sushi",
// 										name: "Sukeroku Sushi",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										bundleLabel: "Bundle",
// 										originalPrice: 1500,
// 										price: 0,
// 										category: "bundle",
// 									},
// 									{
// 										id: "butter-chicken-curry",
// 										name: "Butter chicken curry",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										bundleLabel: "Bundle",
// 										originalPrice: 1500,
// 										price: 0,
// 										category: "bundle",
// 									},
// 									{
// 										id: "vegetable-penne",
// 										name: "Vegetable penne pasta",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										originalPrice: 1500,
// 										price: 700,
// 										category: "single-item",
// 									},
// 									{
// 										id: "spicy-chicken",
// 										name: "Spicy chicken rice",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/f2d2a56a171815e11d4c0776cb6c804b059623e7?width=1304",
// 										hasDrink: true,
// 										originalPrice: 1500,
// 										price: 700,
// 										category: "meals",
// 									},
// 									{
// 										id: "gyudon",
// 										name: "Gyudon(beef bowl)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										originalPrice: 1500,
// 										price: 700,
// 										category: "meals",
// 									},
// 									{
// 										id: "tanuki-soba",
// 										name: "Chilled tanuki soba",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										hasDrink: true,
// 										originalPrice: 1500,
// 										price: 700,
// 										category: "single-item",
// 									},
// 								]}
// 								mealDetailsMap={{
// 									"tempura-soba": {
// 										passengerName: "YAMADA TARO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Soba with Bits of Tempura Batter",
// 										bundleLabel: "Bundle",
// 										originalPrice: 1500,
// 										price: 0,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{
// 												id: "1-2-hours",
// 												label: "Approximately 1 to 2 hours after take off",
// 												price: 0,
// 											},
// 										],
// 									},
// 									"pork-sandwich": {
// 										passengerName: "YAMADA TARO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Filling pork cutlet sandwich",
// 										bundleLabel: "Bundle",
// 										originalPrice: 1500,
// 										price: 0,
// 										drinkOptions: [
// 											{
// 												id: "canada-dry",
// 												label: "Canada Dry Ginger Ale 350ml",
// 												originalPrice: 300,
// 												price: 270,
// 											},
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", originalPrice: 300, price: 270 },
// 										],
// 										defaultDrinkId: "canada-dry",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 									"sukeroku-sushi": {
// 										passengerName: "YAMADA TARO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Sukeroku Sushi",
// 										bundleLabel: "Bundle",
// 										originalPrice: 1500,
// 										price: 0,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 									"butter-chicken-curry": {
// 										passengerName: "YAMADA TARO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Butter chicken curry",
// 										bundleLabel: "Bundle",
// 										originalPrice: 1500,
// 										price: 0,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 									"vegetable-penne": {
// 										passengerName: "YAMADA TARO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Vegetable penne pasta",
// 										originalPrice: 1500,
// 										price: 700,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 									"spicy-chicken": {
// 										passengerName: "YAMADA TARO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/f2d2a56a171815e11d4c0776cb6c804b059623e7?width=1304",
// 										dishName: "Spicy chicken rice",
// 										originalPrice: 1500,
// 										price: 700,
// 										drinkOptions: [
// 											{ id: "canada-dry", label: "Canada Dry Ginger Ale 350ml", price: 270 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "canada-dry",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 									gyudon: {
// 										passengerName: "YAMADA TARO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Gyudon(beef bowl)",
// 										originalPrice: 1500,
// 										price: 700,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 									"tanuki-soba": {
// 										passengerName: "YAMADA TARO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Chilled tanuki soba",
// 										originalPrice: 1500,
// 										price: 700,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{
// 												id: "1-2-hours",
// 												label: "Approximately 1 to 2 hours after take off",
// 												price: 0,
// 											},
// 										],
// 									},
// 								}}
// 								onConfirm={(mealId, values, totalPrice) => {
// 									console.log("Meal confirmed", mealId, values, totalPrice);
// 								}}
// 							/>
// 						}
// 					/>
// 					<PassengerService
// 						name="YAMADA HANAKA"
// 						bundleLabel="Value"
// 						features={["One free meal from eligible items"]}
// 						dialog={
// 							<MealSelectionFlow
// 								passengerName="YAMADA HANAKA"
// 								routeLabel="Tokyo Narita (NRT) – Bangkok (BKK)"
// 								meals={[
// 									{
// 										id: "halal-beef-curry",
// 										name: "Halal beef curry rice",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										isHalal: true,
// 										price: 0,
// 									},
// 									{
// 										id: "pork-sandwich",
// 										name: "Filling pork cutlet sandwich",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										isHalal: true,
// 										hasDrink: true,
// 										bundleLabel: "Bundle",
// 										originalPrice: 1500,
// 										price: 0,
// 									},
// 									{
// 										id: "salmon-onigiri",
// 										name: "Halal salmon onigiri set",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										isHalal: true,
// 										hasDrink: true,
// 										price: 1400,
// 									},
// 								]}
// 								mealDetailsMap={{
// 									"halal-beef-curry": {
// 										passengerName: "YAMADA HANAKA",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Halal beef curry rice",
// 										price: 0,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 									"pork-sandwich": {
// 										passengerName: "YAMADA HANAKA",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Filling pork cutlet sandwich",
// 										bundleLabel: "Bundle",
// 										originalPrice: 1500,
// 										price: 0,
// 										drinkOptions: [
// 											{
// 												id: "canada-dry",
// 												label: "Canada Dry Ginger Ale 350ml",
// 												originalPrice: 300,
// 												price: 270,
// 											},
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", originalPrice: 300, price: 270 },
// 										],
// 										defaultDrinkId: "canada-dry",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 									"salmon-onigiri": {
// 										passengerName: "YAMADA HANAKA",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Halal salmon onigiri set",
// 										price: 1400,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 								}}
// 								onConfirm={(mealId, values, totalPrice) => {
// 									console.log("Meal confirmed for YAMADA HANAKA", mealId, values, totalPrice);
// 								}}
// 							/>
// 						}
// 					/>
// 					<PassengerService
// 						name="YAMADA GORO"
// 						bundleLabel="Premium"
// 						features={["One free meal from eligible items"]}
// 						dialog={
// 							<MealSelectionFlow
// 								passengerName="YAMADA GORO"
// 								routeLabel="Tokyo Narita (NRT) – Bangkok (BKK)"
// 								meals={[
// 									{
// 										id: "vegetable-udon",
// 										name: "Vegetable udon noodle soup",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										price: 0,
// 									},
// 									{
// 										id: "fruit-cheese",
// 										name: "Seasonal fruit and cheese plate",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										bundleLabel: "Bundle",
// 										originalPrice: 900,
// 										price: 0,
// 									},
// 									{
// 										id: "wagyu-sandwich",
// 										name: "Halal wagyu beef sandwich box",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										isHalal: true,
// 										hasDrink: true,
// 										bundleLabel: "Bundle",
// 										originalPrice: 2200,
// 										price: 0,
// 									},
// 								]}
// 								mealDetailsMap={{
// 									"vegetable-udon": {
// 										passengerName: "YAMADA GORO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Vegetable udon noodle soup",
// 										price: 0,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 									"fruit-cheese": {
// 										passengerName: "YAMADA GORO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Seasonal fruit and cheese plate",
// 										bundleLabel: "Bundle",
// 										originalPrice: 900,
// 										price: 0,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 									"wagyu-sandwich": {
// 										passengerName: "YAMADA GORO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Halal wagyu beef sandwich box",
// 										bundleLabel: "Bundle",
// 										originalPrice: 2200,
// 										price: 0,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 								}}
// 								onConfirm={(mealId, values, totalPrice) => {
// 									console.log("Meal confirmed for YAMADA GORO", mealId, values, totalPrice);
// 								}}
// 							/>
// 						}
// 					/>
// 					<PassengerService
// 						name="YAMADA ROKURO"
// 						bundleLabel="Flex Biz"
// 						dialog={
// 							<MealSelectionFlow
// 								passengerName="YAMADA ROKURO"
// 								routeLabel="Tokyo Narita (NRT) – Bangkok (BKK)"
// 								meals={[
// 									{
// 										id: "salmon-onigiri",
// 										name: "Halal salmon onigiri set",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										isHalal: true,
// 										hasDrink: true,
// 										price: 1400,
// 									},
// 									{
// 										id: "ramen",
// 										name: "Miso ramen with soft-boiled egg",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										hasDrink: true,
// 										price: 1600,
// 									},
// 									{
// 										id: "beef-curry",
// 										name: "Halal beef curry rice",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										isHalal: true,
// 										price: 1200,
// 									},
// 								]}
// 								mealDetailsMap={{
// 									"salmon-onigiri": {
// 										passengerName: "YAMADA ROKURO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Halal salmon onigiri set",
// 										price: 1400,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 									ramen: {
// 										passengerName: "YAMADA ROKURO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Miso ramen with soft-boiled egg",
// 										price: 1600,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 									"beef-curry": {
// 										passengerName: "YAMADA ROKURO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Halal beef curry rice",
// 										price: 1200,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 								}}
// 								onConfirm={(mealId, values, totalPrice) => {
// 									console.log("Meal confirmed for YAMADA ROKURO", mealId, values, totalPrice);
// 								}}
// 							/>
// 						}
// 					/>
// 					<PassengerService
// 						name="YAMADA HACHIRO"
// 						bundleLabel="No Bundle"
// 						dialog={
// 							<MealSelectionFlow
// 								passengerName="YAMADA HACHIRO"
// 								routeLabel="Tokyo Narita (NRT) – Bangkok (BKK)"
// 								meals={[
// 									{
// 										id: "fruit-cheese-hachiro",
// 										name: "Seasonal fruit and cheese plate",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										bundleLabel: "Bundle",
// 										originalPrice: 900,
// 										price: 300,
// 									},
// 									{
// 										id: "udon-hachiro",
// 										name: "Vegetable udon noodle soup",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										price: 1000,
// 									},
// 									{
// 										id: "tanuki-hachiro",
// 										name: "Chilled tanuki soba",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										hasDrink: true,
// 										price: 1200,
// 									},
// 								]}
// 								mealDetailsMap={{
// 									"fruit-cheese-hachiro": {
// 										passengerName: "YAMADA HACHIRO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Seasonal fruit and cheese plate",
// 										bundleLabel: "Bundle",
// 										originalPrice: 900,
// 										price: 300,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 									"udon-hachiro": {
// 										passengerName: "YAMADA HACHIRO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Vegetable udon noodle soup",
// 										price: 1000,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 									"tanuki-hachiro": {
// 										passengerName: "YAMADA HACHIRO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Chilled tanuki soba",
// 										price: 1200,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{
// 												id: "1-2-hours",
// 												label: "Approximately 1 to 2 hours after take off",
// 												price: 0,
// 											},
// 										],
// 									},
// 								}}
// 								onConfirm={(mealId, values, totalPrice) => {
// 									console.log(
// 										"Meal confirmed for YAMADA HACHIRO (No Bundle)",
// 										mealId,
// 										values,
// 										totalPrice
// 									);
// 								}}
// 							/>
// 						}
// 					/>
// 					<PassengerService
// 						name="YAMADA HACHIRO"
// 						bundleLabel="Flex Biz"
// 						dialog={
// 							<MealSelectionFlow
// 								passengerName="YAMADA HACHIRO"
// 								routeLabel="Tokyo Narita (NRT) – Bangkok (BKK)"
// 								meals={[
// 									{
// 										id: "ramen-flex",
// 										name: "Miso ramen with soft-boiled egg",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										hasDrink: true,
// 										price: 1600,
// 									},
// 									{
// 										id: "wagyu-flex",
// 										name: "Halal wagyu beef sandwich box",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										isHalal: true,
// 										hasDrink: true,
// 										bundleLabel: "Bundle",
// 										originalPrice: 2200,
// 										price: 500,
// 									},
// 									{
// 										id: "spicy-chicken-flex",
// 										name: "Spicy chicken rice",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/f2d2a56a171815e11d4c0776cb6c804b059623e7?width=1304",
// 										hasDrink: true,
// 										price: 1500,
// 									},
// 								]}
// 								mealDetailsMap={{
// 									"ramen-flex": {
// 										passengerName: "YAMADA HACHIRO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Miso ramen with soft-boiled egg",
// 										price: 1600,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 									"wagyu-flex": {
// 										passengerName: "YAMADA HACHIRO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/7b830a328024ed5a7d769ec43c1b8669763d761d?width=470",
// 										dishName: "Halal wagyu beef sandwich box",
// 										bundleLabel: "Bundle",
// 										originalPrice: 2200,
// 										price: 500,
// 										drinkOptions: [
// 											{ id: "water", label: "Mineral water 350ml", price: 0 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "water",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 									"spicy-chicken-flex": {
// 										passengerName: "YAMADA HACHIRO",
// 										routeLabel: "Tokyo Narita (NRT) – Bangkok (BKK)",
// 										imageSrc:
// 											"https://api.builder.io/api/v1/image/assets/TEMP/f2d2a56a171815e11d4c0776cb6c804b059623e7?width=1304",
// 										dishName: "Spicy chicken rice",
// 										price: 1500,
// 										drinkOptions: [
// 											{ id: "canada-dry", label: "Canada Dry Ginger Ale 350ml", price: 270 },
// 											{ id: "coca-cola", label: "Coca-Cola 350ml", price: 270 },
// 										],
// 										defaultDrinkId: "canada-dry",
// 										deliveryTimingOptions: [
// 											{ id: "4-hours", label: "Approximately 4 hours after take off", price: 0 },
// 										],
// 									},
// 								}}
// 								onConfirm={(mealId, values, totalPrice) => {
// 									console.log(
// 										"Meal confirmed for YAMADA HACHIRO (Flex Biz)",
// 										mealId,
// 										values,
// 										totalPrice
// 									);
// 								}}
// 							/>
// 						}
// 					/>
// 				</div>
// 			</AccordionSection>
// 		</main>
// 	);
// }
export default function DesignSystemPage() {
	return null;
}
