import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Breadcrumbs, Text } from '@mantine/core';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useLogQueryStyles } from './styles';

type HeaderBreadcrumbs = {
	crumbs: string[];
};

const HeaderBreadcrumbs: FC<HeaderBreadcrumbs> = (props) => {
	const { crumbs } = props;
	const {
		state: { subLogQuery },
	} = useHeaderContext();
	const [streamName, setStreamName] = useMountedState(subLogQuery.get().streamName);

	useEffect(() => {
		const listener = subLogQuery.subscribe((state) => {
			setStreamName(state.streamName);
		});
		return () => listener();
	}, []);

	return (
		<Breadcrumbs separator=">">
			<HomeIcon />
			{crumbs.map((crumb) => {
				if (crumb === 'streamName') {
					return <Text key={crumb}>{streamName}</Text>;
				}

				return <Text key={crumb}>{crumb}</Text>;
			})}
		</Breadcrumbs>
	);
};

const HomeIcon: FC = () => {
	const { classes } = useLogQueryStyles();
	const { homeIcon } = classes;
	return (
		<svg className={homeIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
			<path
				d="M9.99998 19V14H14V19C14 19.55 14.45 20 15 20H18C18.55 20 19 19.55 19 19V12H20.7C21.16 12 21.38 11.43 21.03 11.13L12.67 3.6C12.29 3.26 11.71 3.26 11.33 3.6L2.96998 11.13C2.62998 11.43 2.83998 12 3.29998 12H4.99998V19C4.99998 19.55 5.44998 20 5.99998 20H8.99998C9.54998 20 9.99998 19.55 9.99998 19Z"
				fill="#211F1F"
			/>
		</svg>
	);
};

export default HeaderBreadcrumbs;
