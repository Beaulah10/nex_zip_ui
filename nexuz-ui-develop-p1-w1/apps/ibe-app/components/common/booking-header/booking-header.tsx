import type { ReactNode } from "react";

type BookingHeaderDescriptionItem = {
	id: string;
	content: ReactNode;
};

function isDescriptionItemArray(
	description: BookingHeaderProps["description"]
): description is ReadonlyArray<BookingHeaderDescriptionItem> {
	return (
		Array.isArray(description) &&
		description.every(
			(item) => typeof item === "object" && item !== null && "id" in item && "content" in item
		)
	);
}

type BookingHeaderProps = {
	title: ReactNode;
	description: ReactNode | ReadonlyArray<BookingHeaderDescriptionItem>;
};

export function BookingHeader({ title, description }: Readonly<BookingHeaderProps>) {
	const titleClassName =
		"w-full font-bold  text-brand-japan-black text-3xl leading-10 md:text-4xl md:leading-13";

	const descriptionItems = isDescriptionItemArray(description) ? description : undefined;
	const descriptionContent = isDescriptionItemArray(description) ? undefined : description;
	const hasDescriptionItems = Boolean(descriptionItems?.length);
	const hasDescriptionContent =
		descriptionContent !== null && descriptionContent !== undefined && descriptionContent !== "";
	let descriptionNode: ReactNode = null;

	if (hasDescriptionItems) {
		descriptionNode = (
			<div className={"flex w-full flex-col gap-4 text-gray-700 text-sm leading-6"}>
				{descriptionItems?.map((item) => (
					<p key={item.id} className={"w-full"}>
						{item.content}
					</p>
				))}
			</div>
		);
	} else if (hasDescriptionContent) {
		descriptionNode = (
			<div className="w-full font-normal text-base-700 text-sm leading-6">{descriptionContent}</div>
		);
	}

	return (
		<div className="booking-header flex w-full flex-col items-start gap-4 md:gap-4">
			<h1 className={titleClassName}>{title}</h1>
			{descriptionNode}
		</div>
	);
}
