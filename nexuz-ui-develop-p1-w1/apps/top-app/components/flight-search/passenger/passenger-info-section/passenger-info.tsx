import { useTranslations } from "next-intl";

const PassengerInfo = () => {
	const t = useTranslations("flight_search_page");
	const assistanceLabel = t("link_assistance");
	const assistanceParts = t("passenger_modal_bullet2").split(assistanceLabel);
	const faqLabel = t("link_faq");
	const faqParts = t("passenger_modal_bullet3").split(faqLabel);

	return (
		<div className="passenger-info-box rounded-lg bg-gray-50 p-4">
			<ul className="flex flex-col gap-3">
				<li className="passenger-info-item flex gap-2 text-brand-japan-black text-sm leading-6">
					<span className="passenger-bullet mt-2 size-1.5 shrink-0 rounded-full bg-brand-japan-black" />
					<span>{t("passenger_modal_bullet1")}</span>
				</li>
				<li className="passenger-info-item flex gap-2 text-brand-japan-black text-sm leading-6">
					<span className="passenger-bullet mt-2 size-1.5 shrink-0 rounded-full bg-brand-japan-black" />
					<span>
						{assistanceParts[0]}
						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://www.zipair.net/en/boarding/support"
							className="text-primary-700 underline hover:opacity-80"
						>
							{assistanceLabel}
						</a>
						{assistanceParts[1]}
					</span>
				</li>
				<li className="passenger-info-item flex gap-2 text-brand-japan-black text-sm leading-6">
					<span className="passenger-bullet mt-2 size-1.5 shrink-0 rounded-full bg-brand-japan-black" />
					<span>
						{faqParts[0]}
						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://www.zipair.net/en/faq/kids"
							className="text-primary-700 underline hover:opacity-80"
						>
							{faqLabel}
						</a>
						{faqParts[1]}
					</span>
				</li>
				<li className="passenger-info-item flex gap-2 text-brand-japan-black text-sm leading-6">
					<span className="passenger-bullet mt-2 size-1.5 shrink-0 rounded-full bg-brand-japan-black" />
					<span>{t("passenger_modal_bullet4")}</span>
				</li>
			</ul>
		</div>
	);
};

export default PassengerInfo;
