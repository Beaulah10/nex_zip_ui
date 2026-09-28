/**
 * File: passport-scanner-modal.tsx
 * Description: Passport Scanner modal component that opens the device camera to scan passport MRZ details.
 * It handles camera permission, scan processing, retry flow, and returns scanned passport information on success.
 */

"use client";

import { Button } from "@repo/ui/components/button";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/dialog";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { PassportIcon } from "@/assets/images/passport-icon";
import { AUTO_SCAN_DELAY_MS } from "@/modules/utils/constants/customer-information/constants";
import type {
	MrzParseResult,
	ScannerState,
	ScanSource,
} from "@/modules/utils/helpers/customer-information/passport-scan-engine-utils/passport-scan-engine-utils";
import { scanCanvasForPassport } from "@/modules/utils/helpers/customer-information/passport-scan-engine-utils/passport-scan-engine-utils";
import type { PassportScannerModalProps } from "@/types/customer-information/customer-information.types";

export function PassportScannerModal({
	isOpen,
	onClose,
	onScanComplete,
}: PassportScannerModalProps) {
	const t = useTranslations("customer_information_page");

	const [state, setState] = useState<ScannerState>("permission_prompt");

	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const resultRef = useRef<MrzParseResult | null>(null);
	const scanSourceRef = useRef<ScanSource>("camera");

	const statusMessageMap: Record<string, string> = {
		permission_denied: t("passport_scanner_permission_denied_title"),
		scan_failed: t("passport_scanner_scan_failed_title"),
		scan_complete: t("passport_scanner_scan_complete_title"),
		processing: t("passport_scanner_reading_information"),
	};

	// ── Stream management ─────────────────────────────────────────────────────

	const stopStream = useCallback(() => {
		if (streamRef.current) {
			for (const track of streamRef.current.getTracks()) {
				track.stop();
			}
			streamRef.current = null;
		}

		if (videoRef.current) {
			videoRef.current.srcObject = null;
		}
	}, []);

	const handleClose = useCallback(() => {
		stopStream();
		setState("permission_prompt");
		resultRef.current = null;
		onClose();
	}, [stopStream, onClose]);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				handleClose();
			}
		},
		[handleClose]
	);

	// ── Reset when modal closes ───────────────────────────────────────────────

	useEffect(() => {
		if (!isOpen) {
			stopStream();
			setState("permission_prompt");
			resultRef.current = null;
		}
	}, [isOpen, stopStream]);

	// ── Cleanup on unmount ───────────────────────────────────────────────────

	useEffect(() => () => stopStream(), [stopStream]);

	// ── Escape key to close ──────────────────────────────────────────────────

	useEffect(() => {
		if (!isOpen) return;

		const handler = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				handleClose();
			}
		};

		document.addEventListener("keydown", handler);

		return () => document.removeEventListener("keydown", handler);
	}, [isOpen, handleClose]);

	// ── Camera ────────────────────────────────────────────────────────────────

	const startCamera = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: { ideal: "environment" },
					width: { ideal: 1280 },
					height: { ideal: 720 },
				},
			});

			streamRef.current = stream;

			/* c8 ignore next 4 */
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				await videoRef.current.play();
			}

			setState("scanning");
		} catch {
			setState("permission_denied");
		}
	}, []);

	// ── Capture ───────────────────────────────────────────────────────────────

	const handleCapture = useCallback(async () => {
		const video = videoRef.current;
		const canvas = canvasRef.current;

		if (!video || !canvas || video.videoWidth === 0) {
			setState("scan_failed");
			return;
		}

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		const ctx = canvas.getContext("2d");

		if (!ctx) {
			setState("scan_failed");
			return;
		}

		ctx.drawImage(video, 0, 0);

		stopStream();
		scanSourceRef.current = "camera";
		setState("processing");

		try {
			const result = await scanCanvasForPassport(canvas);

			if (result) {
				resultRef.current = result;
				setState("scan_complete");
			} else {
				setState("scan_failed");
			}
		} catch {
			setState("scan_failed");
		}
	}, [stopStream]);

	// ── Result handlers ──────────────────────────────────────────────────────

	const handleRetry = useCallback(() => {
		setState("permission_prompt");
		void startCamera();
	}, [startCamera]);

	const handleScanCompleteOk = useCallback(() => {
		if (resultRef.current) {
			onScanComplete(resultRef.current);
		}

		handleClose();
	}, [onScanComplete, handleClose]);

	// ── Start camera immediately when modal opens ─────────────────────────────

	useEffect(() => {
		if (isOpen && state === "permission_prompt") {
			void startCamera();
		}
	}, [isOpen, state, startCamera]);

	// ── Auto capture when camera is ready ─────────────────────────────────────

	useEffect(() => {
		if (state !== "scanning") return;

		const timer = setTimeout(() => {
			void handleCapture();
		}, AUTO_SCAN_DELAY_MS);

		return () => clearTimeout(timer);
	}, [state, handleCapture]);

	if (!isOpen) return null;

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent
				showCloseButton={true}
				mobileOuterSpacing={0}
				gap={0}
				className="!fixed !inset-0 !top-0 !left-0 !translate-x-0 !translate-y-0 !w-full !max-w-none !h-full !rounded-none !bg-[rgba(37,38,40,0.80)] !p-0 !shadow-none flex flex-col justify-end overflow-hidden"
			>
				<DialogTitle className="sr-only">{t("passport_scanner_dialog_label")}</DialogTitle>

				{/* Full-screen camera feed */}
				<video
					ref={videoRef}
					autoPlay
					playsInline
					muted
					className="absolute inset-0 h-full w-full object-cover"
				/>

				{/* Dashed scanning frame */}
				<div className="absolute top-1/2 right-4 left-4 h-18 -translate-y-1/2 rounded-sm border-4 border-primary-600 border-dashed" />

				{/* Bottom instruction card */}
				<div className="relative z-10 p-4">
					<div className="flex items-center justify-between gap-3 overflow-hidden rounded-lg border border-base-200 bg-white p-4 shadow-md">
						<p className="flex-1 text-secondary-700 text-sm leading-6">
							{t("passport_scanner_instruction")}
						</p>

						<div className="relative h-[71px] w-30 shrink-0">
							<div className="absolute top-0 left-[3px] flex h-17.5 w-28.5 flex-col gap-3 overflow-hidden rounded-lg border border-secondary-400 bg-white p-2">
								<div className="flex items-center gap-2">
									<div className="flex h-8 w-6 shrink-0 items-center justify-center overflow-hidden rounded-xs bg-secondary-400">
										<PassportIcon
											ariaLabel={t("passport_scanner_passport_icon_aria_label")}
											width={24}
											height={24}
										/>
									</div>

									<div className="flex flex-1 flex-col gap-1.5">
										<div className="h-0.5 rounded-sm bg-gray-300" />
										<div className="h-0.5 rounded-sm bg-gray-300" />
										<div className="h-0.5 rounded-sm bg-gray-300" />
									</div>
								</div>

								<div className="flex flex-col gap-1.5">
									<div className="h-0.5 rounded-sm bg-gray-500" />
									<div className="h-0.5 rounded-sm bg-gray-500" />
								</div>
							</div>

							<div className="absolute bottom-0 left-0 h-7 w-full rounded border-2 border-primary-600 border-dashed bg-primary-300/50" />
						</div>
					</div>
				</div>

				{/* Hidden canvas */}
				<canvas ref={canvasRef} className="hidden" />

				{/* Permission denied */}
				{state === "permission_denied" && (
					<div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 p-4">
						<div className="w-full max-w-xl overflow-hidden rounded-lg bg-white">
							<div className="px-4 pt-6 pb-0">
								<p className="font-bold text-2xl text-base-900 leading-9">
									{t("passport_scanner_permission_denied_title")}
								</p>
							</div>

							<div className="px-4 py-1">
								<p className="text-base text-secondary-700 leading-6">
									{t("passport_scanner_permission_denied_message")}
								</p>
							</div>

							<div className="px-4 pt-6 pb-6">
								<Button
									type="button"
									variant="primary"
									size="xl"
									className="w-full"
									onClick={handleClose}
								>
									{t("passport_scanner_ok_button")}
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* Processing */}
				{state === "processing" && (
					<div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 p-4">
						<div className="flex w-full max-w-xl flex-col items-center rounded-lg bg-white px-4 py-8">
							<div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-700" />

							<p className="mt-4 text-base text-secondary-700 leading-6">
								{t("passport_scanner_reading_information")}
							</p>
						</div>
					</div>
				)}

				{/* Scan failed */}
				{state === "scan_failed" && (
					<div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 p-4">
						<div className="w-full max-w-xl overflow-hidden rounded-lg bg-white">
							<div className="px-4 pt-6 pb-0">
								<p className="font-bold text-2xl text-base-900 leading-9">
									{t("passport_scanner_scan_failed_title")}
								</p>
							</div>

							<div className="px-4 py-1">
								<p className="text-base text-secondary-700 leading-6">
									{t("passport_scanner_scan_failed_message")}
								</p>
							</div>

							<div className="px-4 pt-6 pb-6">
								<Button
									type="button"
									variant="primary"
									size="xl"
									className="w-full"
									onClick={handleRetry}
								>
									{t("passport_scanner_ok_button")}
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* Scan complete */}
				{state === "scan_complete" && (
					<div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 p-4">
						<div className="w-full max-w-xl overflow-hidden rounded-lg bg-white">
							<div className="px-4 pt-6 pb-0">
								<p className="font-bold text-2xl text-base-900 leading-9">
									{t("passport_scanner_scan_complete_title")}
								</p>
							</div>

							<div className="px-4 py-1">
								<p className="text-base text-secondary-700 leading-6">
									{t("passport_scanner_scan_complete_message")}
								</p>
							</div>

							<div className="px-4 pt-6 pb-6">
								<Button
									type="button"
									variant="primary"
									size="xl"
									className="w-full"
									onClick={handleScanCompleteOk}
								>
									{t("passport_scanner_ok_button")}
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* Screen reader announcements */}
				<div className="sr-only" role="status" aria-live="polite">
					{statusMessageMap[state] ?? ""}
				</div>
			</DialogContent>
		</Dialog>
	);
}
