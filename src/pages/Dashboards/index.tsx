import { Box } from '@mantine/core';
import { BasicSetup, VariableSizes } from './GridStory';

const Dashboards = () => {
	return (
		<Box style={{ flex: 1, display: 'flex', position: 'relative', flexDirection: 'row', width: '100%' }}>
			<div style={{ border: '1px solid', height: '100%', width: '100%' }}>
				{/* <Sample /> */}
				<VariableSizes/>
			</div>
		</Box>
	);
};

export default Dashboards;
