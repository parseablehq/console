import { Box } from '@mantine/core';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import GridLayout from 'react-grid-layout';

const BasicSample = () => {
	const layout = [
		{ i: 'a', x: 0, y: 0, w: 3, h: 1, minH: 1 },
		{ i: 'b', x: 3, y: 0, w: 4, h: 1, minH: 1 },
		{ i: 'c', x: 7, y: 0, w: 6, h: 1, minH: 1 },
		{ i: 'd', x: 0, y: 1, w: 8, h: 1, minH: 1 },
		{ i: 'e', x: 8, y: 1, w: 4, h: 1, minH: 1 },
	];

	return (
		<GridLayout
			className="layout"
			layout={layout}
			cols={12}
			rowHeight={200}
			width={window.innerWidth}
			isResizable={false}
			margin={[10, 10]}
			containerPadding={[0, 0]}
			compactType="horizontal">
			<div key="a" style={{ border: '1px solid black', backgroundColor: 'lightgrey' }}>
				Item A
			</div>
			<div key="b" style={{ border: '1px solid black', backgroundColor: 'lightblue' }}>
				Item B
			</div>
			<div key="c" style={{ border: '1px solid black', backgroundColor: 'lightgreen' }}>
				Item C
			</div>
			<div key="d" style={{ border: '1px solid black', backgroundColor: 'lightcoral' }}>
				Item D
			</div>
			<div key="e" style={{ border: '1px solid black', backgroundColor: 'lightyellow' }}>
				Item E
			</div>
		</GridLayout>
	);
};

const Dashboards = () => {
	return (
		<Box
			style={{
				flex: 1,
				display: 'flex',
				position: 'relative',
				flexDirection: 'row',
				width: '100%',
				border: '1px solid',
			}}>
			<BasicSample />
		</Box>
	);
};

export default Dashboards;
