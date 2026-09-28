export default function StandaloneErrorPage() {
	return (
		<div className="flex items-center justify-center bg-base-50">
			<section className="w-full max-w-lg rounded-xl border border-base-200 bg-white p-8 text-center shadow-sm">
				<h1 className="font-semibold text-2xl text-base-900">Something went wrong</h1>
				<p className="mt-3 text-base text-base-600">
					We could not validate your session token. Please retry from the home page.
				</p>
				<a
					href="/"
					className="mt-6 inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-700"
				>
					Back to home
				</a>
			</section>
		</div>
	);
}
