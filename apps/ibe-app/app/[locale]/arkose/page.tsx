"use client";
import { useState } from "react";
import Arkose from "@/components/Arkose/arkose";

const ARKOSE_PUBLIC_KEY = process.env.NEXT_PUBLIC_ARKOSE_PUBLIC_KEY ?? "";

export default function ArkosePage() {
	const [completedToken, setCompletedToken] = useState<string | null>(null);
	console.log("NEXT_PUBLIC_ARKOSE_PUBLIC_KEY:", process.env.NEXT_PUBLIC_ARKOSE_PUBLIC_KEY);
	return (
		<div className="mx-auto max-w-2xl p-6">
			<div>Key Length: {ARKOSE_PUBLIC_KEY.length}</div>
			<h1 className="mb-6 font-bold text-3xl">Arkose Verification</h1>
			<Arkose
				publicKey={ARKOSE_PUBLIC_KEY}
				selector="arkose-container"
				mode="lightbox"
				onCompleted={(token: string) => {
					setCompletedToken(token);
				}}
			/>
			{completedToken && (
				<div className="mt-6 rounded-lg border border-green-300 bg-green-50 p-4">
					<p className="mb-2 font-semibold text-green-900">✅ Challenge Completed!</p>
					<div className="overflow-hidden rounded bg-white p-3 font-mono text-xs">
						<p className="mb-2 text-gray-600">
							<strong>Challenge completed with token:</strong>
						</p>
						<pre className="whitespace-pre-wrap break-all text-gray-800">
							{typeof completedToken === "string"
								? completedToken
								: JSON.stringify(completedToken, null, 2)}
						</pre>
					</div>
				</div>
			)}
		</div>
	);
}
