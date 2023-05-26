import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/components/App';
import Mantine from '@/components/Mantine';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<Mantine>
			<ErrorBoundary>
				<BrowserRouter>
					<QueryClientProvider client={queryClient}>
						<App />
					</QueryClientProvider>
				</BrowserRouter>
			</ErrorBoundary>
		</Mantine>
	</React.StrictMode>,
);
