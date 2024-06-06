import { Divider, Stack } from '@mantine/core';
import classes from './styles/Systems.module.css';
import _ from 'lodash';
import ServerList from './ServerList';
import ServerDetail from './ServerDetails';

const Cluster = () => {
	return (
		<Stack className={classes.container} w="100%">
			<Stack style={{ flexDirection: 'row', width: '100%' }} gap={0}>
				<Stack style={{ width: '20%' }}>
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
