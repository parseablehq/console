/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_PARSEABLE_URL?: string;
	readonly VITE_OPENAI_API_KEY?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
