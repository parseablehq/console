import './utils/dayjsLoader';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/components/App';
import Mantine from '@/components/Mantine';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	// <React.StrictMode>
	<QueryClientProvider client={queryClient}>
		<Mantine>
			<ErrorBoundary>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</ErrorBoundary>
		</Mantine>
	</QueryClientProvider>,
	// </React.StrictMode>,
);
