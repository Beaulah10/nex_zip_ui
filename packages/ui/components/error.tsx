"use client";

import { Button } from "./button";

type ErrorProps = {
	title: string;
	description: string;
	reloadLabel: string;
	redirectUrl?: string;
};

export default function ErrorPage({ title, description, reloadLabel, redirectUrl }: ErrorProps) {
	return (
		<div className="mx-auto flex w-full flex-col gap-14 px-4">
			<p className="font-bold text-4xl text-brand-japan-black leading-14">{title}</p>
			<div className="flex flex-col gap-14 md:gap-8">
				<p className="font-normal text-base text-secondary-700 leading-6">{description}</p>
				<div className="flex md:self-end">
					<Button
						type="button"
						variant="primary"
						className="h-14 w-full md:w-auto md:min-w-64"
						onClick={() => {
							if (redirectUrl) {
								window.location.href = redirectUrl;
								return;
							}

							window.location.reload();
						}}
					>
						{reloadLabel}
					</Button>
				</div>
			</div>
		</div>
	);
}
