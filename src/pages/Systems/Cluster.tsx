import { Divider, Stack } from '@mantine/core';
import classes from './styles/Systems.module.css';
import ServerList from './ServerList';
import ServerDetail from './ServerDetails';
import { PRIMARY_HEADER_HEIGHT } from '@/constants/theme';

const Cluster = () => {
	return (
		<Stack
			className={classes.container}
			w="100%"
			style={{
				maxHeight: `calc(100vh - ${PRIMARY_HEADER_HEIGHT}px )`,
				overflowY: 'scroll',
				flex: 1,
			}}>
			<Stack style={{ flexDirection: 'row', width: '100%', overflow: 'hidden' }} gap={0}>
				<Stack style={{ width: '20%', height: '100%' }}>
					<ServerList />
				</Stack>
				<Divider orientation="vertical" />
				<Stack style={{ width: '80%' }}>
					<ServerDetail />
				</Stack>
			</Stack>
		</Stack>
	);
};

export default Cluster;
