import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import _ from 'lodash';
import { useDocumentTitle } from '@mantine/hooks';
import { Stack, Box, Pill } from '@mantine/core';
import LogsView from '../Stream/Views/Explore/LogsView';
import Querier from '../Stream/components/Querier';
import SecondaryToolbar from '../Stream/components/SecondaryToolbar';
import {
	PRIMARY_HEADER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_HEIGHT,
} from '@/constants/theme';
import { MaximizeButton } from '../Stream/components/PrimaryToolbar';
import TimeRange from '@/components/Header/TimeRange';
import RefreshInterval from '@/components/Header/RefreshInterval';
import RefreshNow from '@/components/Header/RefreshNow';
import ShareButton from '@/components/Header/ShareButton';

const Correlation = () => {
	useDocumentTitle('Parseable | Correlation');
	// const [opened, { toggle }] = useDisclosure(false);
	// const sideBarWidth = SECONDARY_SIDEBAR_WIDTH;
	return (
		<Box
			style={{
				flex: 1,
				display: 'flex',
				position: 'relative',
				width: '100%',
			}}>
			<Stack
				gap={0}
				style={{
					maxHeight: `calc(100vh - ${PRIMARY_HEADER_HEIGHT}px )`,
					overflowY: 'scroll',
					width: '100%',
				}}>
				<Stack
					style={{ flexDirection: 'row', padding: '10px', alignItems: 'center', borderBottom: '1px solid #DEE2E6' }}
					w="100%">
					<div style={{ display: 'flex', flexDirection: 'row', gap: '5px', width: '20%', marginLeft: '10px' }}>
						<Pill withRemoveButton>Stream 1</Pill>
						<Pill withRemoveButton>Stream 2</Pill>
						<Pill withRemoveButton>Stream 3</Pill>
					</div>
					<div style={{ width: '60%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
						Saved Correlations
					</div>
					<TimeRange />
				</Stack>
				<Stack style={{ flexDirection: 'row', borderBottom: '1px solid #DEE2E6' }} w="100%">
					<div
						style={{
							width: '50%',
							display: 'flex',
							justifyContent: 'center',
							borderRight: '1px solid #DEE2E6',
							padding: '24px',
							gap: '60px',
						}}>
						<div
							style={{
								border: '1px solid #D8B4FE',
								borderRadius: '5px',
								width: '113px',
								height: '276px',
								padding: '12px',
								display: 'flex',
								alignItems: 'center',
								flexDirection: 'column',
								gap: '24px',
							}}>
							<div>Stream A</div>
							<div>
								{new Array(5).fill(0).map((key, index) => {
									return <div>Field {index} A</div>;
								})}
							</div>
						</div>
						<div
							style={{
								border: '1px solid #FECDD3',
								borderRadius: '5px',
								width: '113px',
								height: '276px',
								padding: '12px',
							}}>
							Stream B
						</div>
						<div
							style={{
								border: '1px solid #FDE047',
								borderRadius: '5px',
								width: '113px',
								height: '276px',
								padding: '12px',
							}}>
							Stream C
						</div>
					</div>
					<div style={{ width: '50%' }}>Col 2</div>
				</Stack>
				<Stack
					style={{
						height: STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
						alignItems: 'center',
						justifyContent: 'center',
						padding: '0 1.25rem',
					}}>
					<Stack style={{ flexDirection: 'row', height: STREAM_PRIMARY_TOOLBAR_HEIGHT }} w="100%">
						<Querier />
						<RefreshInterval />
						<RefreshNow />
						<ShareButton />
						<MaximizeButton />
					</Stack>
				</Stack>
				<SecondaryToolbar />
				<LogsView schemaLoading={false} infoLoading={false} />
			</Stack>
		</Box>
	);
};

{
	/* <Group justify="center" mb={5}>
					<Button onClick={toggle}>Config</Button>
				</Group>
				<Collapse in={opened}>
					<h1>PKB</h1>
				</Collapse> */
}
{
	/* <Stack style={{ width: sideBarWidth }}>
				<SideBar />
			</Stack> */
}
export default Correlation;
