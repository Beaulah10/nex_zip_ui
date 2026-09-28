import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { useTranslations } from "next-intl";

type modalProps = {
	openPassportInfoModal: boolean;
	setOpenPassportInfoModal: React.Dispatch<React.SetStateAction<boolean>>;
	onNext: () => void;
};

const PassportInfoModal = ({
	openPassportInfoModal,
	setOpenPassportInfoModal,
	onNext,
}: modalProps) => {
	const t = useTranslations("flight_search_page");

	return (
		<Dialog open={openPassportInfoModal} onOpenChange={setOpenPassportInfoModal}>
			<DialogContent
				aria-describedby={undefined}
				desktopWidth={640}
				className="gap-0 rounded-lg"
				showCloseButton={false}
			>
				<DialogHeader className="border-none bg-white px-4 py-6 md:p-8" showCloseButton={false}>
					<DialogTitle className="text-[24px] leading-9">{t("passport_modal_heading")}</DialogTitle>
				</DialogHeader>

				<div className="flex w-full flex-col bg-white px-4 py-1 md:px-8">
					<p className="mb-6 text-[16px] text-base-700">{t("header_description")}</p>

					<ul className="flex list-disc flex-col gap-1 pl-6">
						<li className="font-bold text-[16px] text-base-700">{t("item_passport_number")}</li>
						<li className="font-bold text-[16px] text-base-700">{t("item_expiry_date")}</li>
					</ul>

					<p className="my-0.5 pl-6 text-base-700">{t("note_travel_period")}</p>

					<ul className="flex list-disc flex-col gap-1 pl-6">
						<li className="font-bold text-[16px] text-base-700">{t("item_date_of_birth")}</li>
						<li className="font-bold text-[16px] text-base-700">{t("item_nationality_region")}</li>
					</ul>
				</div>

				<DialogFooter className="gap-4 border-none bg-white px-4 py-6 md:p-8">
					<DialogClose asChild>
						<Button outline size="xl" variant="primary" className="box-border min-w-[91px]">
							{t("passport_modal_button_cancel")}
						</Button>
					</DialogClose>
					<Button
						variant="primary"
						size="xl"
						onClick={onNext}
						className="min-w-[77px] bg-primary-600 text-white"
					>
						{t("button_next")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default PassportInfoModal;
