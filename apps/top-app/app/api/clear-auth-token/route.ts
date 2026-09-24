import { DEFAULT_SECURITY_TOKEN_COOKIE_NAME } from "@repo/sdk";
import { NextResponse } from "next/server";

/**
 * Use secure cookies only in production because browsers ignore `Secure` cookies
 * over plain HTTP, which would break local development sessions.
 */
const isSecurityTokenCookieSecure = process.env.NODE_ENV === "production";

export async function POST(request: Request) {
	const requestCookieHeader = request.headers.get("cookie") ?? "";
	const hasSecurityToken = requestCookieHeader
		.split(";")
		.map((cookie) => cookie.trim())
		.some((cookie) => cookie.startsWith(`${DEFAULT_SECURITY_TOKEN_COOKIE_NAME}=`));

	if (!hasSecurityToken) {
		return NextResponse.json({ cleared: false });
	}

	const response = NextResponse.json({ cleared: true });

	response.cookies.set(DEFAULT_SECURITY_TOKEN_COOKIE_NAME, "", {
		httpOnly: true,
		secure: isSecurityTokenCookieSecure,
		path: "/",
		maxAge: 0,
		sameSite: "lax",
	});

	return response;
}
