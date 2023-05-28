import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/components/App';
import Mantine from '@/components/Mantine';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<Mantine>
			<ErrorBoundary>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</ErrorBoundary>
		</Mantine>
	</React.StrictMode>,
);
