export type AboutData = {
	commit: string;
	deploymentId: string;
	latestVersion: string;
	license: string;
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
	cache: string;
	analytics: {
        clarityTag: string;
    }
};
