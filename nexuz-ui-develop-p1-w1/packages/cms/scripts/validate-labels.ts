import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getPrismicDocuments, type PrismicLabelDocument } from "@repo/cms/prismic";
import { createFieldId, createIbeModel, createPrismicModel } from "./generate-prismic-models";
import { getPrismicLabelSource, loadPrismicLabelMessages } from "./label-source-loader";

const labelSource = getPrismicLabelSource(readArgValue("--source"));
const documents = getPrismicDocuments(loadPrismicLabelMessages(labelSource, "en"));

const errors: string[] = [];

for (const document of documents) {
	validateGeneratedModel(document);
	validateDuplicateFieldIds(document);
}

validateGeneratedIbeModel(documents);

if (errors.length > 0) {
	console.error(errors.map((error) => `- ${error}`).join("\n"));
	process.exit(1);
}

function validateGeneratedModel(document: PrismicLabelDocument) {
	const modelPath = path.resolve("customtypes", document.modelId, "index.json");

	if (!existsSync(modelPath)) {
		errors.push(`Missing generated model for ${document.modelId}`);
		return;
	}

	const generated = JSON.parse(readFileSync(modelPath, "utf8")) as ReturnType<
		typeof createPrismicModel
	>;
	const expected = createPrismicModel(document);
	const generatedFields = Object.values(generated.json).flatMap((tab) => Object.keys(tab));
	const expectedFields = Object.values(expected.json).flatMap((tab) => Object.keys(tab));

	for (const fieldId of expectedFields) {
		if (!generatedFields.includes(fieldId)) {
			errors.push(`Missing field ${fieldId} in ${document.modelId}`);
		}
	}
}

function validateDuplicateFieldIds(document: PrismicLabelDocument) {
	const fieldIds = flattenObject(document.content).map(([pathKey]) =>
		createFieldId(`${document.modelId}.${pathKey}`),
	);
	const duplicates = fieldIds.filter((fieldId, index) => fieldIds.indexOf(fieldId) !== index);

	for (const duplicate of duplicates) {
		errors.push(`Duplicate field ID ${duplicate} in ${document.modelId}`);
	}
}

function validateGeneratedIbeModel(documents: PrismicLabelDocument[]) {
	const modelPath = path.resolve("customtypes", labelSource.parentDocumentType, "index.json");

	if (!existsSync(modelPath)) {
		errors.push(`Missing generated model for ${labelSource.parentDocumentType}`);
		return;
	}

	const generated = JSON.parse(readFileSync(modelPath, "utf8")) as ReturnType<
		typeof createIbeModel
	>;
	const expected = createIbeModel(documents);
	const generatedFields = Object.values(generated.json).flatMap((tab) => Object.keys(tab));
	const expectedFields = Object.values(expected.json).flatMap((tab) => Object.keys(tab));

	for (const fieldId of expectedFields) {
		if (!generatedFields.includes(fieldId)) {
			errors.push(`Missing field ${fieldId} in ibe`);
		}
	}
}

function flattenObject(value: unknown, prefix = ""): Array<[pathKey: string, value: unknown]> {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return [[prefix, value]];
	}

	return Object.entries(value).flatMap(([key, nestedValue]) =>
		flattenObject(nestedValue, prefix ? `${prefix}.${key}` : key),
	);
}

function readArgValue(name: string) {
	const index = process.argv.indexOf(name);

	return index === -1 ? undefined : process.argv[index + 1];
}
