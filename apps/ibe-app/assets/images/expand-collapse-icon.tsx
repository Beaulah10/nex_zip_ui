import type { SVGProps } from "react";

export interface ExpandCollapseIconProps extends SVGProps<SVGSVGElement> {
	width?: number;
	height?: number;
	backgroundColor?: string;
}

export function ExpandCollapseIcon({
	width = 24,
	height = 24,
	backgroundColor = "white",
	...props
}: ExpandCollapseIconProps) {
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
			aria-hidden="true"
			focusable="false"
		>
			<path
				d="M12 0.5C18.3513 0.5 23.5 5.64873 23.5 12C23.5 18.3513 18.3513 23.5 12 23.5C5.64873 23.5 0.5 18.3513 0.5 12C0.5 5.64873 5.64873 0.5 12 0.5Z"
				fill={backgroundColor}
			/>
			<path
				d="M12 0.5C18.3513 0.5 23.5 5.64873 23.5 12C23.5 18.3513 18.3513 23.5 12 23.5C5.64873 23.5 0.5 18.3513 0.5 12C0.5 5.64873 5.64873 0.5 12 0.5Z"
				stroke="#007057"
			/>
			<svg
				x="2"
				y="2"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				className="size-5"
				aria-hidden="true"
				focusable="false"
			>
				<path
					d="M12 11.0625L8.58333 14.4792C8.43056 14.6319 8.25 14.7083 8.04167 14.7083C7.84722 14.7083 7.67361 14.6319 7.52083 14.4792C7.36806 14.3264 7.29167 14.1528 7.29167 13.9583C7.29167 13.75 7.36806 13.5694 7.52083 13.4167L11.4792 9.45833C11.5486 9.38889 11.625 9.34028 11.7083 9.3125C11.8056 9.27083 11.9028 9.25 12 9.25C12.0972 9.25 12.1875 9.27083 12.2708 9.3125C12.3681 9.34028 12.4514 9.38889 12.5208 9.45833L16.4792 13.4167C16.6319 13.5694 16.7083 13.7431 16.7083 13.9375C16.7083 14.1319 16.6319 14.3056 16.4792 14.4583C16.3264 14.6111 16.1458 14.6875 15.9375 14.6875C15.7431 14.6875 15.5694 14.6111 15.4167 14.4583L12 11.0625Z"
					fill="var(--color-green-700)"
				/>
			</svg>
		</svg>
	);
}
