import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import _ from 'lodash';
import { useDocumentTitle } from '@mantine/hooks';
import { Stack, Box, Pill, PillsInput, Badge, TextInput, px, Select } from '@mantine/core';
import LogsView from '../Stream/Views/Explore/LogsView';
import Querier from '../Stream/components/Querier';
import SecondaryToolbar from '../Stream/components/SecondaryToolbar';
import { PRIMARY_HEADER_HEIGHT, STREAM_PRIMARY_TOOLBAR_HEIGHT } from '@/constants/theme';
import { MaximizeButton } from '../Stream/components/PrimaryToolbar';
import TimeRange from '@/components/Header/TimeRange';
import RefreshInterval from '@/components/Header/RefreshInterval';
import RefreshNow from '@/components/Header/RefreshNow';
import ShareButton from '@/components/Header/ShareButton';
import { useRef, useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import classes from '../../components/Header/styles/LogQuery.module.css';

const Correlation = () => {
	useDocumentTitle('Parseable | Correlation');
	// const [opened, { toggle }] = useDisclosure(false);
	const [fields, setFileds] = useState<any>([]);
	const searchIcon = <IconSearch size={px('0.8rem')} />;
	const [selectedStreams, setSelectedStreams] = useState<any>([]);
	const valueRef = useRef<string | null>();

	const handleChange = (value: string | null) => {
		if (value === null) return;

		const selectedData = {
			value,
			fields: ['status', 'id', 'erros'],
		};

		setSelectedStreams((prev: any) => [...prev, selectedData]);
	};

	const removeStream = (streamName: string) => {
		setSelectedStreams((prev: any) => prev.filter((stream: any) => stream.value !== streamName));
	};

	const handleColor = (streamName: string) => {
		switch (streamName) {
			case 'streamA':
				return 'grape';
			case 'streamB':
				return 'teal';
			case 'streamA-field':
				return '#DA77F1';
			case 'streamB-field':
				return '#38D9A9';
		}
	};

	const addField = (field: string, streamName: string) => {
		const selectedField = {
			field,
			streamName: `${streamName}-field`,
		};
		setFileds((prev: any) => [...prev, selectedField]);
	};

	const removeField = (field: string) => {
		setFileds((prev: any) => prev.filter((fieldItr: any) => fieldItr.field !== field));
	};

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
				<TextInput
					disabled={selectedStreams.length === 0}
					style={{ width: '100%' }}
					placeholder="Search Fields"
					leftSection={searchIcon}
					key="search-fields"
				/>
				<Select
					searchable
					limit={20}
					value={valueRef.current}
					classNames={{ input: classes.streamInput, description: classes.streamSelectDescription }}
					onChange={handleChange}
					styles={{
						input: {
							height: STREAM_PRIMARY_TOOLBAR_HEIGHT,
						},
					}}
					data={[
						{ value: 'streamA', label: 'Stream A' },
						{ value: 'streamB', label: 'Stream B' },
						{ value: 'streamC', label: 'Stream C' },
						{ value: 'streamD', label: 'Stream D' },
					]}
				/>
				{selectedStreams.map((stream: any) => {
					return (
						<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between' }}>
								<div>{stream.value}</div>
								<div style={{ cursor: 'pointer' }} onClick={() => removeStream(stream.value)}>
									X
								</div>
							</div>
							{stream.fields.map((field: any) => {
								return (
									<Badge
										color={handleColor(stream.value)}
										size="xl"
										onClick={() => addField(field, stream.value)}
										style={{ width: '160px', display: 'flex', justifyContent: 'center' }}>
										{field}
									</Badge>
								);
							})}
						</div>
					);
				})}
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
								<div style={{ display: 'flex', gap: '5px' }}>
									{fields.map((field: any, index: any) => {
										return (
											<Pill
												key={index}
												color={handleColor(field.streamName)}
												size="xl"
												withRemoveButton
												onRemove={() => removeField(field.field)}
												style={{ backgroundColor: handleColor(field.streamName) }}>
												{field.field}
											</Pill>
										);
									})}
								</div>
							</PillsInput>
						</div>
						<div style={{ display: 'flex', gap: '5px', alignItems: 'center', width: '100%' }}>
							<div>Joins</div>
							<PillsInput style={{ width: '100%' }} variant="filled" size="md" radius="md">
								<Pill.Group>
									<Pill size="xl" withRemoveButton>
										Stream A.Status = Stream B.Status Code
									</Pill>
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
export default Correlation;
