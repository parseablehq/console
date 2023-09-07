/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_PARSEABLE_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
