import { PrimaryHeader } from '@/components/Header';
import Navbar from '@/components/Navbar';
import { NAVBAR_WIDTH, PRIMARY_HEADER_HEIGHT } from '@/constants/theme';
import { Box } from '@mantine/core';
import { useCallback, useEffect, useState, type FC } from 'react';
import { Outlet } from 'react-router-dom';
import { heights } from '@/components/Mantine/sizing';
import { useAppStore, appStoreReducers } from './providers/AppProvider';
import _ from 'lodash';

const { toggleMaximize, setIsSecureHTTPContext } = appStoreReducers;

const MainLayout: FC = () => {
	const [maximized, setAppStore] = useAppStore((store) => store.maximized);
	const [analytics] = useAppStore((store) => store.instanceConfig?.analytics);
	const [trackingScriptsAdded, setTrackingScriptsAdded] = useState<boolean>(false);
	const primaryHeaderHeight = !maximized ? PRIMARY_HEADER_HEIGHT : 0;
	const navbarWidth = !maximized ? NAVBAR_WIDTH : 0;

	const handleEscKeyPress = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				maximized && setAppStore(toggleMaximize);
			}
		},
		[maximized],
	);

	useEffect(() => {
		setAppStore((store) => setIsSecureHTTPContext(store, window.isSecureContext));
	}, [setIsSecureHTTPContext]);

	useEffect(() => {
		window.addEventListener('keydown', handleEscKeyPress);
		return () => {
			window.removeEventListener('keydown', handleEscKeyPress);
		};
	}, [maximized]);

	useEffect(() => {
		if (analytics && _.isString(analytics.clarityTag) && !_.isEmpty(analytics.clarityTag) && !trackingScriptsAdded) {
			const script = document.createElement('script');
			script.type = 'text/javascript';
			script.innerHTML = `(function(c,l,a,r,i,t,y){ c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)}; t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i; y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y); })(window, document, "clarity", "script", "${analytics.clarityTag}");`;
			document.body.appendChild(script);
			setTrackingScriptsAdded(true);
			return () => {
				document.body.removeChild(script);
			};
		}
	}, [analytics]);

	return (
		<Box style={{ width: '100vw', minWidth: 1000 }}>
			<PrimaryHeader />
			<Box style={{ display: 'flex', height: `calc(${heights.full} - ${primaryHeaderHeight}px)` }}>
				<Navbar />
				<Box
					style={{
						width: `calc(100% - ${navbarWidth}px)`,
						display: 'flex',
						flexDirection: 'column',
						transition: 'width 0.4s ease-in-out',
					}}>
					<Outlet />
				</Box>
			</Box>
		</Box>
	);
};

export default MainLayout;
