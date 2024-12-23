import _ from 'lodash';
import { useDocumentTitle } from '@mantine/hooks';
import { Stack, Box, TextInput, Text, Select, Button, Center, Skeleton, Stepper } from '@mantine/core';
import {
	PRIMARY_HEADER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_HEIGHT,
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
	IconLetterLSmall,
	IconNumber123,
	IconTrashX,
	IconX,
} from '@tabler/icons-react';
import CorrelationFooter from './Views/CorrelationFooter';
import TimeRange from '@/components/Header/TimeRange';
import RefreshInterval from '@/components/Header/RefreshInterval';
import RefreshNow from '@/components/Header/RefreshNow';
import ShareButton from '@/components/Header/ShareButton';
import { MaximizeButton } from '../Stream/components/PrimaryToolbar';
import MultiEventTimeLineGraph from './components/MultiEventTimeLineGraph';
import { useGetStreamSchema } from '@/hooks/useGetCorrelationStreamSchema';
import { CorrelationEmptyPlaceholder } from './components/CorrelationEmptyPlaceholder';
import { StreamSelectBox } from './components/StreamSelectBox';
import { useFetchStreamData } from '@/hooks/useFetchStreamData';

const { changeStream } = appStoreReducers;
const { deleteStreamData, setSelectedFields, deleteSelectedField, setCorrelationCondition, setIsCorrelatedFlag } =
	correlationStoreReducers;

const dataTypeIcons = (iconColor: string): Record<string, JSX.Element> => ({
	text: <IconLetterASmall size={16} style={{ color: iconColor }} />,
	timestamp: <IconClockHour5 size={16} style={{ color: iconColor }} />,
	number: <IconNumber123 size={16} style={{ color: iconColor }} />,
	boolean: <IconChartCircles size={16} style={{ color: iconColor }} />,
	list: <IconLetterLSmall size={16} style={{ color: iconColor }} />,
});

const FieldItem = ({
	headerColor,
	fieldName,
	backgroundColor,
	iconColor,
	dataType,
	isSelected,
	onClick,
	onDelete,
}: {
	headerColor: string;
	fieldName: string;
	backgroundColor: string;
	iconColor: string;
	dataType?: string;
	isSelected?: boolean;
	onClick?: () => void;
	onDelete?: () => void;
}) => {
	return (
		<div
			style={{
				border: `1px solid ${headerColor}`,
				backgroundColor,
				color: headerColor,
				opacity: isSelected ? 0.5 : 1,
				...(dataType
					? { height: '24px', minHeight: '24px' }
					: { width: 'fit-content', borderRadius: '12px', height: '100%' }),
			}}
			className={classes.fieldItem}
			onClick={onClick}>
			<Text size="sm" className={classes.fieldItemText}>
				{fieldName}
			</Text>
			{!dataType && <IconX color={iconColor} size={12} onClick={onDelete} />}
			{dataType && dataTypeIcons(iconColor)[dataType]}
		</div>
	);
};

const Correlation = () => {
	useDocumentTitle('Parseable | Correlation');
	// State Management Hooks
	const [userSpecificStreams] = useAppStore((store) => store.userSpecificStreams);
	const [{ fields, selectedFields, tableOpts, isCorrelatedData }, setCorrelationData] = useCorrelationStore(
		(store) => store,
	);
	const [timeRange] = useAppStore((store) => store.timeRange);
	const [currentStream, setAppStore] = useAppStore((store) => store.currentStream);
	const [maximized] = useAppStore((store) => store.maximized);
	const {
		isLoading: schemaLoading,
		streamName: schemaStreamName,
		isSuccess,
	} = useGetStreamSchema({ streamName: currentStream || '' });
	const { getCorrelationData, loading: logsLoading, error: errorMessage } = useCorrelationQueryLogs();
	const { getFetchStreamData, loading: streamsLoading } = useFetchStreamData();

	// Local State
	const [searchText, setSearchText] = useState('');
	const [select1Value, setSelect1Value] = useState<string | null>(null);
	const [select2Value, setSelect2Value] = useState<string | null>(null);

	// Derived Constants
	const primaryHeaderHeight = maximized
		? 0
		: PRIMARY_HEADER_HEIGHT + STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT + STREAM_SECONDARY_TOOLBAR_HRIGHT;

	const streamNames = Object.keys(fields);
	const streamData =
		userSpecificStreams?.map((stream: any) => ({
			value: stream.name,
			label: stream.name,
		})) ?? [];

	// Effects
	useEffect(() => {
		if (currentStream && streamNames && isSuccess) {
			getFetchStreamData();
		}
	}, [currentStream, isSuccess]);

	useEffect(() => {
		getFetchStreamData();
	}, [isCorrelatedData]);

	useEffect(() => {
		if (isCorrelatedData) {
			getCorrelationData();
		} else {
			getFetchStreamData();
		}
	}, [timeRange]);

	useEffect(() => {
		updateCorrelationCondition();
	}, [select1Value, select2Value]);

	// Utility Functions
	const filterFields = (fieldsIter: any) => {
		const typedFields = Object.keys(fieldsIter.fieldTypeMap) as string[];
		return searchText
			? typedFields.filter((field) => field.toLowerCase().includes(searchText.toLowerCase()))
			: typedFields;
	};

	const updateCorrelationCondition = () => {
		if (select1Value && select2Value) {
			const condition = `"${streamNames[0]}".${select1Value} = "${streamNames[1]}".${select2Value}`;
			setAppStore((store) => changeStream(store, 'correlatedStream'));
			setCorrelationData((store) => setCorrelationCondition(store, condition));
		}
	};

	// Event Handlers
	const addStream = (value: string | null) => {
		if (value) {
			setAppStore((store) => changeStream(store, value));
		}
	};

	const handleFieldChange = (fieldValue: string | null, isFirstField: boolean) => {
		if (isFirstField) {
			setSelect1Value(fieldValue);
		} else {
			setSelect2Value(fieldValue);
		}
	};

	const clearQuery = () => {
		setSelect1Value(null);
		setSelect2Value(null);
		setCorrelationData((store) => setCorrelationCondition(store, ''));
		setCorrelationData((store) => setSelectedFields(store, '', '', true));
		setCorrelationData((store) => setIsCorrelatedFlag(store, false));
	};

	// View Flags
	const hasContentLoaded = !schemaLoading && !logsLoading && !streamsLoading;
	const hasNoData = hasContentLoaded && !errorMessage && tableOpts.pageData.length === 0;
	const showTable = hasContentLoaded && !hasNoData && !errorMessage;

	return (
		<Box className={classes.correlationWrapper}>
			<div className={classes.correlationSideBarWrapper}>
				<Text>Streams</Text>
				<TextInput
					disabled={streamNames.length === 0}
					w="100%"
					radius="md"
					placeholder="Search Fields"
					key="search-fields"
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
				/>
				<div className={classes.streamBox}>
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
										onClick={() => {
											setAppStore((store) => changeStream(store, ''));
											setCorrelationData((store) => deleteStreamData(store, stream));
										}}
									/>
								</div>
								<div className={classes.fieldsWrapper}>
									{schemaStreamName === stream && (logsLoading || schemaLoading || streamsLoading) ? (
										<Stack style={{ padding: '0.5rem 0.7rem' }}>
											<Skeleton height="24px" />
											<Skeleton height="24px" />
											<Skeleton height="24px" />
											<Skeleton height="24px" />
											<Skeleton height="24px" />
											<Skeleton height="24px" />
											<Skeleton height="24px" />
											<Skeleton height="24px" />
										</Stack>
									) : filteredFields.length > 0 ? (
										filteredFields.map((field: string) => {
											const isSelected = selectedFields[stream]?.includes(field);
											const dataType = fieldsIter.fieldTypeMap[field];
											return (
												<FieldItem
													key={`${stream}-${field}`}
													headerColor={fieldsIter.headerColor}
													backgroundColor={fieldsIter.backgroundColor}
													iconColor={fieldsIter.iconColor}
													fieldName={field.replace(`${stream}.`, '')}
													dataType={dataType}
													isSelected={isSelected}
													onClick={() => setCorrelationData((store) => setSelectedFields(store, field, stream))}
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
					{streamNames.length === 0 && (
						<>
							{/* First box */}
							<StreamSelectBox
								label="Add Stream 1"
								placeholder="Select Stream 1"
								disabled={false}
								onChange={(value) => value && addStream(value)}
								data={streamData}
								isFirst={true}
							/>

							{/* Second box */}
							<StreamSelectBox
								label="Add Stream 2"
								placeholder="Select Stream 2"
								disabled={streamNames.length < 1}
								onChange={(value) => addStream(value)}
								data={streamData}
								isFirst={false}
							/>
						</>
					)}
					{streamNames.length === 1 && (
						<>
							{/* Render the single existing field */}
							<StreamSelectBox
								label="Add Stream 2"
								placeholder="Select Stream 2"
								disabled={false}
								onChange={(value) => addStream(value)}
								data={streamData}
								isFirst={false}
							/>
						</>
					)}
				</div>
			</div>
			<Stack gap={0} className={classes.selectionWrapper}>
				<Stack className={classes.topSectionWrapper}>
					<Stack>
						<div className={classes.fieldsJoinsWrapper} style={{ height: STREAM_PRIMARY_TOOLBAR_HEIGHT }}>
							<Text
								style={{
									width: '35px',
									color: streamNames.length > 0 ? 'black' : '#CBCBCB',
								}}>
								Fields
							</Text>
							<div
								style={{
									border: streamNames.length > 0 ? '1px solid #CBCBCB' : '1px solid #e1e5e8',
									backgroundColor: streamNames.length > 0 ? 'white' : '#F7F8F9',
								}}
								className={classes.fieldsPillsWrapper}>
								{Object.keys(selectedFields).length < 1 && (
									<Text c={'#ACB5BD'} size="sm">
										Click on fields to correlate
									</Text>
								)}
								{Object.entries(selectedFields).map(([streamName, fieldsMap]: [any, any]) =>
									fieldsMap.map((field: any, index: any) => (
										<FieldItem
											key={`${streamName}-${index}`}
											headerColor={fields[streamName]['headerColor']}
											backgroundColor={fields[streamName]['backgroundColor']}
											iconColor={fields[streamName]['iconColor']}
											fieldName={field}
											onDelete={() => setCorrelationData((store) => deleteSelectedField(store, field, streamName))}
										/>
									)),
								)}
							</div>
						</div>
						<div className={classes.fieldsJoinsWrapper} style={{ height: STREAM_PRIMARY_TOOLBAR_HEIGHT }}>
							<Text
								style={{
									width: '35px',
									color: streamNames.length > 0 ? 'black' : '#CBCBCB',
									flexShrink: 0,
									flexGrow: 0,
								}}>
								Joins
							</Text>
							<div className={classes.joinsWrapper}>
								<div style={{ width: '50%' }}>
									<Select
										styles={{
											input: { height: 26 },
										}}
										disabled={streamNames.length === 0}
										placeholder={streamNames[0] ? `Select field from ${streamNames[0]}` : 'Select Stream 1'}
										style={{ height: '100%' }}
										radius="md"
										data={
											streamNames.length > 0
												? Object.keys(fields[streamNames[0]].fieldTypeMap).filter(
														(key) => fields[streamNames[0]].fieldTypeMap[key] !== 'list',
												  )
												: []
										}
										value={select1Value}
										onChange={(value) => handleFieldChange(value, true)}
									/>
								</div>
								<Text size="md"> = </Text>
								<div style={{ width: '50%' }}>
									<Select
										styles={{
											input: { height: 26 },
										}}
										disabled={streamNames.length < 2}
										placeholder={streamNames[1] ? `Select field from ${streamNames[1]}` : 'Select Stream 2'}
										radius="md"
										data={
											streamNames.length > 1
												? Object.keys(fields[streamNames[0]].fieldTypeMap).filter(
														(key) => fields[streamNames[0]].fieldTypeMap[key] !== 'list',
												  )
												: []
										}
										value={select2Value}
										onChange={(value) => handleFieldChange(value, false)}
									/>
								</div>
							</div>
						</div>
					</Stack>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							width: '100%',
						}}>
						{/* <CorrelationFilters /> */}
						<div className={classes.logTableControlWrapper}>
							<TimeRange />
							<RefreshInterval />
							<RefreshNow />
							<ShareButton />
							<MaximizeButton />
						</div>
						<div style={{ display: 'flex', gap: '5px', alignItems: 'center', height: '25px' }}>
							<Button
								className={classes.correlateBtn}
								onClick={() => {
									setCorrelationData((store) => setIsCorrelatedFlag(store, true));
									getCorrelationData();
								}}>
								Correlate
							</Button>
							<Button className={classes.clearBtn} onClick={clearQuery} disabled={streamNames.length == 0}>
								Clear
							</Button>
						</div>
					</div>
				</Stack>
				<Stack className={classes.logsSecondaryToolbar} style={{ height: STREAM_SECONDARY_TOOLBAR_HRIGHT }}>
					<MultiEventTimeLineGraph />
				</Stack>
				{Object.keys(selectedFields).length > 0 && (
					<>
						<CorrelationTable
							{...{ errorMessage, logsLoading, streamsLoading, showTable, hasNoData }}
							primaryHeaderHeight={primaryHeaderHeight}
						/>
						<CorrelationFooter loaded={true} hasNoData={true} isFetchingCount={true} />
					</>
				)}
				{Object.keys(selectedFields).length === 0 && (
					<Center className={classes.container}>
						<CorrelationEmptyPlaceholder height={200} width={200} />
						<Stepper
							styles={{
								stepBody: {
									marginTop: '5%',
									color: 'var(--mantine-color-gray-6)',
								},
								stepCompletedIcon: {
									color: '#535BED',
								},
								stepIcon: {
									color: 'var(--mantine-color-gray-6)',
								},
							}}
							color="gray"
							active={streamNames.length}
							orientation="vertical">
							<Stepper.Step label="Select first stream" />
							<Stepper.Step label="Select second stream" />
							<Stepper.Step label="Click on fields to correlate" />
						</Stepper>
					</Center>
				)}
			</Stack>
		</Box>
	);
};
export default Correlation;
