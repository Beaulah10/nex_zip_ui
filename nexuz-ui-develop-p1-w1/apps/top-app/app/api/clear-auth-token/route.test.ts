import { DEFAULT_SECURITY_TOKEN_COOKIE_NAME } from "@repo/sdk";
import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("clear auth token route", () => {
	it("returns cleared false when security token cookie is missing", async () => {
		const request = new Request("http://localhost:3002/api/clear-auth-token", {
			method: "POST",
			headers: {
				cookie: "foo=bar; baz=qux",
			},
		});

		const response = await POST(request);
		const body = await response.json();

		expect(body).toEqual({ cleared: false });
		expect(response.headers.get("set-cookie")).toBeNull();
	});

	it("clears security token cookie when present", async () => {
		const request = new Request("http://localhost:3002/api/clear-auth-token", {
			method: "POST",
			headers: {
				cookie: `${DEFAULT_SECURITY_TOKEN_COOKIE_NAME}=token-value; foo=bar`,
			},
		});

		const response = await POST(request);
		const body = await response.json();
		const setCookie = response.headers.get("set-cookie");

		expect(body).toEqual({ cleared: true });
		expect(setCookie).toContain(`${DEFAULT_SECURITY_TOKEN_COOKIE_NAME}=`);
		expect(setCookie).toContain("Max-Age=0");
		expect(setCookie).toContain("HttpOnly");
		expect(setCookie).toContain("Path=/");
		expect(setCookie?.toLowerCase()).toContain("samesite=lax");
	});
});
