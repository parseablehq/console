import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import _ from 'lodash';
import { useDocumentTitle } from '@mantine/hooks';
import { Stack, Box, Pill, PillsInput, TextInput, Autocomplete, Text, ActionIcon } from '@mantine/core';
import {
	PRIMARY_HEADER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
	STREAM_SECONDARY_TOOLBAR_HRIGHT,
} from '@/constants/theme';
import { useEffect, useState } from 'react';
import classes from './styles/Correlation.module.css';
import { correlationStoreReducers, useCorrelationStore } from './providers/CorrelationProvider';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useCorrelationQueryLogs } from '@/hooks/useCorrelationQueryLogs';
import CorrelationTable from './Views/CorrelationTable';
import { IconPlus, IconTrashX } from '@tabler/icons-react';

const { changeStream } = appStoreReducers;
const { deleteStreamData, setSelectedFields, deleteSelectedField } = correlationStoreReducers;

const FieldItem = ({
	headerColor,
	fieldName,
	backgroundColor,
	onClick,
}: {
	headerColor: string;
	fieldName: string;
	backgroundColor: string;
	onClick: () => void;
}) => {
	return (
		<div
			style={{ border: `1px solid ${headerColor}`, backgroundColor, color: headerColor }}
			className={classes.fieldItem}
			onClick={onClick}>
			<Text tt="capitalize" size="sm">
				{fieldName}
			</Text>
		</div>
	);
};

const Correlation = () => {
	useDocumentTitle('Parseable | Correlation');
	const [userSpecificStreams] = useAppStore((store) => store.userSpecificStreams);
	const [{ fields, selectedFields }, setCorrelationData] = useCorrelationStore((store) => store);
	const { getCorrelationData } = useCorrelationQueryLogs();
	const [currentStream, setAppStore] = useAppStore((store) => store.currentStream);
	const [selectedStream, setSelectedStream] = useState<string>('');
	const [maximized] = useAppStore((store) => store.maximized);
	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT + STREAM_SECONDARY_TOOLBAR_HRIGHT
		: 0;
	const [showLogData, setShowLogData] = useState<boolean>(false);

	useEffect(() => {
		getCorrelationData();
	}, [currentStream]);

	console.log(fields);

	const addStream = () => {
		setAppStore((store) => changeStream(store, selectedStream));
		setShowLogData(true);
		setSelectedStream('');
	};

	const removeStream = (streamName: string) => {
		setCorrelationData((store) => deleteStreamData(store, streamName));
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
		setCorrelationData((store) => setSelectedFields(store, field, streamName));
	};

	const removeField = (field: string, streamName: string) => {
		setCorrelationData((store) => deleteSelectedField(store, field, streamName));
	};

	return (
		<Box className={classes.correlationWrapper}>
			<div className={classes.correlationSideBarWrapper}>
				<Text>Streams</Text>
				<TextInput
					disabled={Object.keys(fields).length === 0}
					w="100%"
					placeholder="Search Fields"
					key="search-fields"
				/>
				{Object.keys(fields).length < 4 && (
					<div style={{ display: 'flex', gap: '5px' }}>
						<Autocomplete
							value={selectedStream}
							onChange={(value: string) => setSelectedStream(value)}
							placeholder="Select Stream"
							data={userSpecificStreams?.map((stream: any) => stream.name) ?? []}
						/>
						<ActionIcon
							size={38}
							variant="filled"
							color="#339AF0"
							aria-label="Add Stream"
							disabled={!userSpecificStreams?.some((stream) => stream.name === selectedStream)}
							onClick={addStream}>
							<IconPlus stroke={1.5} />
						</ActionIcon>
					</div>
				)}
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '14px',
						height: `calc(100vh - 220px)`,
					}}>
					{Object.entries(fields).map(([stream, fieldsIter]: [any, any]) => {
						const typedFields = fieldsIter.headers as string[];
						const totalStreams = Object.entries(fields).length;
						const heightPercentage = totalStreams > 1 ? `${100 / totalStreams}%` : '100%';
						return (
							<div
								key={stream}
								className={classes.streamWrapper}
								style={{
									height: heightPercentage,
									flexShrink: 0,
									border: `1px solid ${fieldsIter.color}`,
								}}>
								<div className={classes.streamNameWrapper}>
									<Text
										tt="capitalize"
										size="md"
										style={{ color: fieldsIter.headerColor }}
										className={classes.streamName}>
										{stream}
									</Text>
									<IconTrashX
										color={fieldsIter.headerColor}
										cursor="pointer"
										size={14}
										onClick={() => removeStream(stream)}
									/>
								</div>
								<div className={classes.fieldsWrapper}>
									{typedFields.map((field: string) => {
										return (
											<FieldItem
												key={`${stream}-${field}`}
												headerColor={fieldsIter.headerColor}
												backgroundColor={fieldsIter.backgroundColor}
												fieldName={field}
												onClick={() => addField(field, stream)}
											/>
										);
									})}
								</div>
							</div>
						);
					})}
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
								<div style={{ display: 'flex', gap: '5px' }}>
									{Object.entries(selectedFields).map(([streamName, fields]: [any, any]) =>
										fields.map((field: any, index: any) => (
											<Pill
												key={`${streamName}-${index}`}
												color={handleColor(streamName)}
												size="xl"
												withRemoveButton
												onRemove={() => removeField(field, streamName)}
												style={{ backgroundColor: handleColor(streamName) }}>
												{field}
											</Pill>
										)),
									)}
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
						w="100%"></Stack>
				</Stack>
				{showLogData && <CorrelationTable primaryHeaderHeight={primaryHeaderHeight} />}
			</Stack>
		</Box>
	);
};
export default Correlation;
