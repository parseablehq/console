import _ from 'lodash';
import { useDocumentTitle } from '@mantine/hooks';
import { Stack, Box, TextInput, Text, Select } from '@mantine/core';
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
import {
	IconChartCircles,
	IconClockHour5,
	IconLetterASmall,
	IconNumber123,
	IconTrashX,
	IconX,
} from '@tabler/icons-react';
import CorrelationFooter from './Views/CorrelationFooter';
import Querier from '../Stream/components/Querier';
import TimeRange from '@/components/Header/TimeRange';

const { changeStream } = appStoreReducers;
const { deleteStreamData, setSelectedFields, deleteSelectedField } = correlationStoreReducers;

const dataTypeIcons = (iconColor: string): Record<string, JSX.Element> => ({
	text: <IconLetterASmall size={16} style={{ color: iconColor }} />,
	timestamp: <IconClockHour5 size={16} style={{ color: iconColor }} />,
	number: <IconNumber123 size={16} style={{ color: iconColor }} />,
	boolean: <IconChartCircles size={16} style={{ color: iconColor }} />,
});

const FieldItem = ({
	headerColor,
	fieldName,
	backgroundColor,
	iconColor,
	dataType,
	onClick,
	onDelete,
}: {
	headerColor: string;
	fieldName: string;
	backgroundColor: string;
	iconColor: string;
	dataType?: string;
	onClick?: () => void;
	onDelete?: () => void;
}) => {
	return (
		<div
			style={{
				border: `1px solid ${headerColor}`,
				backgroundColor,
				color: headerColor,
				...(dataType ? {} : { width: 'fit-content', borderRadius: '12px' }),
			}}
			className={classes.fieldItem}
			onClick={onClick}>
			<Text size="sm">{fieldName}</Text>
			{!dataType && <IconX color={iconColor} size={16} onClick={onDelete} />}
			{dataType && dataTypeIcons(iconColor)[dataType]}
		</div>
	);
};

const Correlation = () => {
	useDocumentTitle('Parseable | Correlation');
	const [userSpecificStreams] = useAppStore((store) => store.userSpecificStreams);
	const [{ fields, selectedFields }, setCorrelationData] = useCorrelationStore((store) => store);
	const { getCorrelationData } = useCorrelationQueryLogs();
	const [currentStream, setAppStore] = useAppStore((store) => store.currentStream);
	const [maximized] = useAppStore((store) => store.maximized);
	const [searchText, setSearchText] = useState('');
	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT + STREAM_SECONDARY_TOOLBAR_HRIGHT
		: 0;

	useEffect(() => {
		getCorrelationData();
	}, [currentStream]);

	const addStream = (value: string | null) => {
		if (!value) return;

		setAppStore((store) => changeStream(store, value));
	};

	console.log(fields);

	const filterFields = (fieldsIter: any) => {
		const typedFields = Object.keys(fieldsIter.fieldTypeMap) as string[];
		if (!searchText) return typedFields;
		return typedFields.filter((field) => field.toLowerCase().includes(searchText.toLowerCase()));
	};

	const removeStream = (streamName: string) => {
		setCorrelationData((store) => deleteStreamData(store, streamName));
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
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
				/>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '14px',
						height: `calc(100vh - 220px)`,
					}}>
					{Object.entries(fields).map(([stream, fieldsIter]: [any, any]) => {
						const filteredFields = filterFields(fieldsIter);
						const totalStreams = Object.entries(fields).length;
						const heightPercentage = totalStreams === 1 ? '50%' : `${100 / totalStreams}%`;

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
										size="md"
										tt="capitalize"
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
									{filteredFields.length > 0 ? (
										filteredFields.map((field: string) => {
											const dataType = fieldsIter.fieldTypeMap[field];
											return (
												<FieldItem
													key={`${stream}-${field}`}
													headerColor={fieldsIter.headerColor}
													backgroundColor={fieldsIter.backgroundColor}
													iconColor={fieldsIter.iconColor}
													fieldName={field.replace(`${stream}.`, '')}
													dataType={dataType}
													onClick={() => addField(field, stream)}
												/>
											);
										})
									) : (
										<Text>No fields match your search.</Text>
									)}
								</div>
							</div>
						);
					})}
					{Object.keys(fields).length === 0 && (
						<>
							{/* First box */}
							<div className={classes.noStreamsWrapper} style={{ border: '1px dashed #9F1239' }}>
								<Select
									searchable
									classNames={{
										input: classes.streamInput,
										description: classes.streamSelectDescription,
									}}
									onChange={(value) => {
										if (value) addStream(value); // Add stream when selected, affecting Object.keys(fields).length
									}}
									placeholder="Select Stream 1"
									style={{ width: '100%', padding: '10px' }}
									data={
										userSpecificStreams?.map((stream: any) => ({
											value: stream.name,
											label: stream.name,
										})) ?? []
									}
								/>
								<div>
									<Text fw={700} c="#CBCBCB">
										Add Stream 1
									</Text>
								</div>
							</div>

							{/* Second box */}
							<div className={classes.noStreamsWrapper}>
								<Select
									searchable
									classNames={{
										input: classes.streamInput,
										description: classes.streamSelectDescription,
									}}
									disabled={Object.keys(fields).length < 1} // Enabled only after the first box adds a field
									onChange={(value) => addStream(value)}
									placeholder="Select Stream 2"
									style={{ width: '100%', padding: '10px' }}
									data={
										userSpecificStreams?.map((stream: any) => ({
											value: stream.name,
											label: stream.name,
										})) ?? []
									}
								/>
								<div>
									<Text fw={700} c={Object.keys(fields).length < 1 ? '#CBCBCB' : '#000'}>
										{Object.keys(fields).length < 1 ? 'Select Stream 1 first' : 'Add Stream 2'}
									</Text>
								</div>
							</div>
						</>
					)}
					{Object.keys(fields).length === 1 && (
						<>
							{/* Render the single existing field */}
							{Object.keys(fields).map((key) => (
								<div key={key} className={classes.noStreamsWrapper} style={{ border: '1px dashed #7E22CE' }}>
									<Select
										searchable
										classNames={{
											input: classes.streamInput,
											description: classes.streamSelectDescription,
										}}
										onChange={(value) => addStream(value)}
										placeholder="Select Stream 2"
										style={{ width: '100%', padding: '10px' }}
										data={
											userSpecificStreams?.map((stream: any) => ({
												value: stream.name,
												label: stream.name,
											})) ?? []
										}
									/>
									<div>
										<Text fw={700} c="#CBCBCB">
											Add Stream 2
										</Text>
									</div>
								</div>
							))}
						</>
					)}
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
							<div style={{ color: Object.keys(selectedFields).length > 0 ? 'black' : '#CBCBCB' }}>Fields</div>
							<div
								style={{
									width: '100%',
									backgroundColor: '#F7F8F9',
									height: '36px',
									borderRadius: '5px',
									display: 'flex',
									gap: '10px',
									padding: '5px 10px',
								}}>
								{Object.entries(selectedFields).map(([streamName, fieldsMap]: [any, any]) =>
									fieldsMap.map((field: any, index: any) => (
										<FieldItem
											key={`${streamName}-${index}`}
											headerColor={fields[streamName]['headerColor']}
											backgroundColor={fields[streamName]['backgroundColor']}
											iconColor={fields[streamName]['iconColor']}
											fieldName={field}
											onDelete={() => removeField(field, streamName)}
										/>
									)),
								)}
							</div>
						</div>
						<div style={{ display: 'flex', gap: '5px', alignItems: 'center', width: '100%' }}>
							<div style={{ color: Object.keys(selectedFields).length > 0 ? 'black' : '#CBCBCB' }}>Joins</div>
							<div
								style={{
									width: '100%',
									backgroundColor: '#F7F8F9',
									height: '36px',
									borderRadius: '5px',
									display: 'flex',
									flexDirection: 'row',
									gap: '10px',
									alignContent: 'center',
									padding: '5px',
								}}>
								<div>
									<Select
										disabled={Object.keys(fields).length === 0}
										placeholder={
											Object.keys(fields)[0] ? `Select field from ${Object.keys(fields)[0]}` : 'Select Stream 1'
										}
										style={{ width: '300px' }}
										data={
											Object.keys(fields).length > 0 ? Object.keys(fields[Object.keys(fields)[0]].fieldTypeMap) : []
										}
									/>
								</div>
								<div> = </div>
								<div>
									<Select
										disabled={Object.keys(fields).length < 2}
										placeholder={
											Object.keys(fields)[1] ? `Select field from ${Object.keys(fields)[1]}` : 'Select Stream 2'
										}
										style={{ width: '300px' }}
										data={
											Object.keys(fields).length > 1 ? Object.keys(fields[Object.keys(fields)[1]].fieldTypeMap) : []
										}
									/>
								</div>
							</div>
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
					</Stack>
				</Stack>
				{Object.keys(selectedFields).length > 0 && (
					<>
						<CorrelationTable primaryHeaderHeight={primaryHeaderHeight} />
						<CorrelationFooter loaded={true} hasNoData={true} isFetchingCount={true} />
					</>
				)}
				{Object.keys(selectedFields).length === 0 && (
					<Text fw={700} c="#CBCBCB" className={classes.addStreamPlaceholder}>
						Add Streams
					</Text>
				)}
			</Stack>
		</Box>
	);
};
export default Correlation;
