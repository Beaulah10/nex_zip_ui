import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

let cachedEnvOverrides: Record<string, string> | undefined;

export const prismicConfig = {
	get repositoryName() {
		return getSharedEnvValue("PRISMIC_REPOSITORY_NAME") ?? "zipair-dev";
	},
	get accessToken() {
		return getSharedEnvValue("PRISMIC_ACCESS_TOKEN");
	},
	routes: [],
} as const;

export function getSharedEnvValue(key: string) {
	return process.env[key] ?? getEnvOverrides()[key];
}

export function loadSharedEnvIntoProcessEnv() {
	const overrides = getEnvOverrides();

	for (const [key, value] of Object.entries(overrides)) {
		if (process.env[key] === undefined) {
			process.env[key] = value;
		}
	}
}

function getEnvOverrides() {
	if (cachedEnvOverrides) {
		return cachedEnvOverrides;
	}

	const cwd = process.cwd();
	const envFilePaths = [
		path.resolve(cwd, ".env.local"),
		path.resolve(cwd, ".env"),
		path.resolve(cwd, "../../.env.local"),
		path.resolve(cwd, "../../.env"),
	];
	const overrides: Record<string, string> = {};

	for (const envFilePath of envFilePaths) {
		if (!existsSync(envFilePath)) {
			continue;
		}

		for (const line of readFileSync(envFilePath, "utf8").split(/\r?\n/)) {
			const trimmedLine = line.trim();

			if (!trimmedLine || trimmedLine.startsWith("#")) {
				continue;
			}

			const separatorIndex = trimmedLine.indexOf("=");

			if (separatorIndex === -1) {
				continue;
			}

			const name = trimmedLine.slice(0, separatorIndex).trim();
			const value = trimmedLine.slice(separatorIndex + 1).trim();

			if (!name || overrides[name]) {
				continue;
			}

			overrides[name] = value.replace(/^["']|["']$/g, "");
		}
	}

	cachedEnvOverrides = overrides;

	return overrides;
}
