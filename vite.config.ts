import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		host: true,
		port: 3001,
		strictPort: true,
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
	},
	preview: {
		port: 3001,
		strictPort: true,
	},
	clearScreen: false,
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
