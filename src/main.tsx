import '@mantine/core/styles/global.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/code-highlight/styles.css';
import '@mantine/charts/styles.css';
import './utils/dayjsLoader';
import 'mantine-react-table/styles.css'; //import MRT styles
import ReactDOM from 'react-dom/client';
import App from '@/components/App';
import Mantine from '@/components/Mantine';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { store } from './store';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<QueryClientProvider client={queryClient}>
		<Mantine>
			<ErrorBoundary>
				<BrowserRouter>
					<Provider store={store}>
						<App />
					</Provider>
				</BrowserRouter>
			</ErrorBoundary>
		</Mantine>
	</QueryClientProvider>,
);
