/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_PARSEABLE_URL?: string;
	readonly VITE_USE_BASIC_AUTH?: string;
	readonly VITE_USERNAME?: string;
	readonly VITE_PASSWORD?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
