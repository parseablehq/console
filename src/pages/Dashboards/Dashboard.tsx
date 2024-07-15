import { Stack } from '@mantine/core';
import Toolbar from './Toolbar';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './styles/ReactGridLayout.css'
import GridLayout from 'react-grid-layout';
import { DASHBOARDS_SIDEBAR_WIDTH, NAVBAR_WIDTH } from '@/constants/theme';
import Tile from './Tile';
import classes from './styles/tile.module.css'
import CreateTileForm from './CreateTileForm';

const BasicSample = () => {
	const layout = [
		{ i: 'a', x: 0, y: 0, w: 4, h: 1, minH: 1 },
		// { i: 'a', x: 0, y: 0, w: 4, h: 1, minH: 1 },
		// { i: 'a', x: 0, y: 0, w: 4, h: 1, minH: 1 },
		// { i: 'b', x: 4, y: 0, w: 4, h: 1, minH: 1 },
		// { i: 'c', x: 8, y: 0, w: 4, h: 1, minH: 1 },
		// { i: 'd', x: 12, y: 0, w: 4, h: 1, minH: 1 },
	];

	return (
		<Stack>
			<GridLayout
				className="layout"
				layout={layout}
				cols={12}
				rowHeight={300}
				width={window.innerWidth - NAVBAR_WIDTH - DASHBOARDS_SIDEBAR_WIDTH}
				isResizable={false}
				margin={[16,16]}
				containerPadding={[20, 10]}
				compactType="horizontal"
				isDraggable={true}
				>
				<div key="a" style={{ transition: 'none', background: 'white' }} className={`${classes.container} capture-class`}>
					<Tile/>
				</div>
				{/* <div key="b" style={{ border: '1px solid black', transition: 'none', backgroundColor: 'lightblue' }}>
					Item B
				</div>
				<div key="c" style={{ border: '1px solid black', transition: 'none', backgroundColor: 'lightgreen' }}>
					Item C
				</div>
				<div key="d" style={{ border: '1px solid black', transition: 'none', backgroundColor: 'lightcoral' }}>
					Item D
				</div> */}
			</GridLayout>
		</Stack>
	);
};

const Dashboard = () => {
	return (
		<Stack style={{ flex: 1 }} gap={0}>
			<Toolbar />
			{/* <BasicSample /> */}
			<CreateTileForm/>
		</Stack>
	);
};

export default Dashboard;
