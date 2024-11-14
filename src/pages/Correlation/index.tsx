import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import _ from 'lodash';
import { useDocumentTitle } from '@mantine/hooks';
import { Stack, Box, Pill, PillsInput, Badge } from '@mantine/core';
import LogsView from '../Stream/Views/Explore/LogsView';
import Querier from '../Stream/components/Querier';
import SecondaryToolbar from '../Stream/components/SecondaryToolbar';
import { PRIMARY_HEADER_HEIGHT } from '@/constants/theme';
import { MaximizeButton } from '../Stream/components/PrimaryToolbar';
import TimeRange from '@/components/Header/TimeRange';
import RefreshInterval from '@/components/Header/RefreshInterval';
import RefreshNow from '@/components/Header/RefreshNow';
import ShareButton from '@/components/Header/ShareButton';

const Correlation = () => {
	useDocumentTitle('Parseable | Correlation');
	// const [opened, { toggle }] = useDisclosure(false);
	return (
		<Box
			style={{
				flex: 1,
				display: 'flex',
				position: 'relative',
				width: '100%',
			}}>
			<div
				style={{
					width: '200px',
					borderRight: '1px solid #DEE2E6',
					padding: '5px',
					display: 'flex',
					flexDirection: 'column',
					gap: '20px',
				}}>
				<div>Streams</div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
					<div>Stream A</div>
					<Badge color="grape" size="xl" style={{ width: '180px', display: 'flex', justifyContent: 'center' }}>
						React
					</Badge>
					<Badge color="grape" size="xl" style={{ width: '180px', display: 'flex', justifyContent: 'center' }}>
						React
					</Badge>
					<Badge color="grape" size="xl" style={{ width: '180px', display: 'flex', justifyContent: 'center' }}>
						React
					</Badge>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
					<div>Stream B</div>
					<Badge color="teal" size="xl" style={{ width: '180px', display: 'flex', justifyContent: 'center' }}>
						React
					</Badge>
					<Badge color="teal" size="xl" style={{ width: '180px', display: 'flex', justifyContent: 'center' }}>
						React
					</Badge>
					<Badge color="teal" size="xl" style={{ width: '180px', display: 'flex', justifyContent: 'center' }}>
						React
					</Badge>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
					<div>Stream C</div>
					<Badge size="xl" style={{ width: '180px', display: 'flex', justifyContent: 'center' }}>
						React
					</Badge>
					<Badge size="xl" style={{ width: '180px', display: 'flex', justifyContent: 'center' }}>
						React
					</Badge>
					<Badge size="xl" style={{ width: '180px', display: 'flex', justifyContent: 'center' }}>
						React
					</Badge>
				</div>
			</div>
			<Stack
				gap={0}
				style={{
					maxHeight: `calc(100vh - ${PRIMARY_HEADER_HEIGHT}px )`,
					overflowY: 'scroll',
					width: '100%',
				}}>
				<Stack
					style={{
						justifyContent: 'center',
						borderBottom: '1px solid #DEE2E6',
						padding: '10px',
					}}>
					<Stack>
						<div style={{ display: 'flex', gap: '5px', alignItems: 'center', width: '100%' }}>
							<div>Fields</div>
							<PillsInput style={{ width: '100%' }} variant="filled" size="md" radius="md">
								<Pill.Group>
									<Pill size="xl" withRemoveButton>
										Stream A.Status
									</Pill>
									<Pill size="xl" withRemoveButton>
										Stream B.Status Code
									</Pill>
									<Pill size="xl" withRemoveButton>
										Errors
									</Pill>
									{/* <PillsInput.Field placeholder="Enter tags" /> */}
								</Pill.Group>
							</PillsInput>
						</div>
						<div style={{ display: 'flex', gap: '5px', alignItems: 'center', width: '100%' }}>
							<div>Joins</div>
							<PillsInput style={{ width: '100%' }} variant="filled" size="md" radius="md">
								<Pill.Group>
									<Pill size="xl" withRemoveButton>
										Stream A.Status = Stream B.Status Code
									</Pill>

									{/* <PillsInput.Field placeholder="Enter tags" /> */}
								</Pill.Group>
							</PillsInput>
						</div>
					</Stack>
					<Stack
						style={{
							flexDirection: 'row',
							padding: '5px',
							height: '100%',
						}}
						w="100%">
						<Querier />
						<TimeRange />
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
