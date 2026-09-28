import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import type { RichTextSlice } from "../../prismicio-types";

type RichTextProps = SliceComponentProps<RichTextSlice>;

export default function RichText({ slice }: RichTextProps) {
	return (
		<section
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
			style={{ padding: "48px 24px", maxWidth: 800, margin: "0 auto" }}
		>
			<PrismicRichText field={slice.primary.content} />
		</section>
	);
}
