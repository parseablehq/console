export type QueryEngineType = 'Trino' | 'Parseable' | undefined;

export type LicenseType = 'AGPL-3.0-only' | undefined;

export type AboutData = {
	commit: string;
	deploymentId: string;
	latestVersion: string;
	license: LicenseType;
	mode: string;
	staging: string;
	store: { type: string; path: string };
	updateAvailable: boolean;
	version: string;
	llmActive: boolean;
	llmProvider: string;
	uiVersion: string;
	grpcPort: number;
	oidcActive: boolean;
	analytics: {
		clarityTag: string;
	};
};
