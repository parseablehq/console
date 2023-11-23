import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { ActionIcon, Breadcrumbs, Select, Text } from '@mantine/core';
import type { FC } from 'react';
import { useEffect } from 'react';
import { IconCaretRight, IconHome2 } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@/@types/parseable/api/query';

type HeaderBreadcrumbs = {
	crumbs: string[];
};

const HeaderBreadcrumbs: FC<HeaderBreadcrumbs> = (props) => {
	const { crumbs } = props;
	const {
		state: { subAppContext },
	} = useHeaderContext();
	const navigate = useNavigate();
	const [appContext, setAppContext] = useMountedState<AppContext>(subAppContext.get());

	useEffect(() => {
		const subAppContextListener = subAppContext.subscribe((value) => {
			setAppContext(value);
		});

		return () => {
			subAppContextListener();
		};
	}, []);

	const navigatetoHome = () => {
		subAppContext.set({ ...appContext, activePage: '/' });
		navigate('/');
	};

	return (
		<Breadcrumbs separator={<IconCaretRight />}>
			<ActionIcon variant="transparent" onClick={navigatetoHome}>
				<IconHome2 stroke={1.5} />
			</ActionIcon>
			{crumbs.map((crumb) => {
				if (crumb === 'streamName') {
					return (
						<Select
							key={crumb}
							placeholder="Pick one"
							searchable
							required
							value={appContext.selectedStream}
							onChange={(value) => {
								subAppContext.set({ ...appContext, selectedStream: value });
							}}
							allowDeselect={false}
							selectFirstOptionOnChange
							data={appContext && appContext.userSpecificStreams ? appContext.userSpecificStreams : []}
						/>
					);
				}
				return <Text key={crumb}>{crumb}</Text>;
			})}
		</Breadcrumbs>
	);
};

export default HeaderBreadcrumbs;
