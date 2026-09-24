export async function apiClient<T>(url: string, token?: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${process.env.BACKEND_API_BASE_URL}${url}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...(token && { "x-security-token": token }), // ✅ updated header
			...(options?.headers || {}),
		},
		cache: "no-store",
	});

	if (!res.ok) {
		throw new Error(`API Error: ${res.status}`);
	}

	return res.json();
}
