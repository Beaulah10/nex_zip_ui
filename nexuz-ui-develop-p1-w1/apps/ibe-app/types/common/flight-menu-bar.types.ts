export interface RouteSegment {
	origin: string;
	destination: string;
	via?: string[];
}

export interface FlightMenuBarProps extends React.HTMLAttributes<HTMLDivElement> {}
