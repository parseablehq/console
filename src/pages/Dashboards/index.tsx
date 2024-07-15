import { Box, px, Stack } from '@mantine/core';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import GridLayout from 'react-grid-layout';
import { NAVBAR_WIDTH } from '@/constants/theme';
import SideBar from './SideBar';
import Dashboard from './Dashboard';
import { IconMaximize, IconTrash } from '@tabler/icons-react'

const Dashboards = () => {
	return (
		<Box
			style={{
				flex: 1,
				display: 'flex',
				position: 'relative',
				flexDirection: 'row',
				width: '100%',
			}}>
			<SideBar />
			<Dashboard />
		</Box>
	);
};

export default Dashboards;
