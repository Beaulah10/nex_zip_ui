import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import type { FC } from "react";

/**
 * Props for `TestSlice`.
 */
export type TestSliceProps = SliceComponentProps<Content.TestSliceSlice>;

/**
 * Component for "TestSlice" Slices.
 */
const TestSlice: FC<TestSliceProps> = ({ slice }) => {
	return (
		<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
			Placeholder component for {slice.slice_type} (variation: {slice.variation}) slices.
			<br />
			<strong>You can edit this slice directly in your code editor.</strong>
		</section>
	);
};

export default TestSlice;
