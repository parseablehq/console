import { useEffect, useState } from 'react';
import { useDocumentTitle } from '@mantine/hooks';
import { Stack, Box, TextInput, Text, Select, Button, Center, Skeleton, Stepper } from '@mantine/core';
import { IconTrashX } from '@tabler/icons-react';
import {
	PRIMARY_HEADER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_HEIGHT,
	STREAM_SECONDARY_TOOLBAR_HRIGHT,
} from '@/constants/theme';
import classes from './styles/Correlation.module.css';
import { useCorrelationQueryLogs } from '@/hooks/useCorrelationQueryLogs';
import { useGetStreamSchema } from '@/hooks/useGetCorrelationStreamSchema';
import { useFetchStreamData } from '@/hooks/useFetchStreamData';
import { correlationStoreReducers, useCorrelationStore } from './providers/CorrelationProvider';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import CorrelationTable from './Views/CorrelationTable';
import CorrelationFooter from './Views/CorrelationFooter';
import TimeRange from '@/components/Header/TimeRange';
import RefreshInterval from '@/components/Header/RefreshInterval';
import RefreshNow from '@/components/Header/RefreshNow';
import ShareButton from '@/components/Header/ShareButton';
import MultiEventTimeLineGraph from './components/MultiEventTimeLineGraph';
import { CorrelationEmptyPlaceholder } from './components/CorrelationEmptyPlaceholder';
import { StreamSelectBox } from './components/StreamSelectBox';
import { CorrelationFieldItem } from './components/CorrelationFieldItem';
import { MaximizeButton } from '../Stream/components/PrimaryToolbar';

const { changeStream } = appStoreReducers;
const { deleteStreamData, setSelectedFields, deleteSelectedField, setCorrelationCondition, setIsCorrelatedFlag } =
	correlationStoreReducers;

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
	const { isLoading: schemaLoading } = useGetStreamSchema({
		streamName: currentStream || '',
	});
	const { getCorrelationData, loading: logsLoading, error: errorMessage } = useCorrelationQueryLogs();
	const { getFetchStreamData, loading: streamsLoading } = useFetchStreamData();

	// Local State
	const [searchText, setSearchText] = useState('');
	const [select1Value, setSelect1Value] = useState<string | null>(null);
	const [select2Value, setSelect2Value] = useState<string | null>(null);
	const [isCorrelationEnabled, setIsCorrelationEnabled] = useState<boolean>(false);

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
		if (currentStream && streamNames.length > 0 && Object.keys(fields).includes(currentStream)) {
			getFetchStreamData();
		}
	}, [currentStream, fields]);

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
			setIsCorrelationEnabled(true);
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
											setCorrelationData((store) => setIsCorrelatedFlag(store, false));
											setSelect1Value(null);
											setSelect2Value(null);
											setCorrelationData((store) => deleteStreamData(store, stream));
										}}
									/>
								</div>
								{logsLoading || schemaLoading || streamsLoading ? (
									<Stack style={{ padding: '0.5rem 0.7rem' }}>
										{Array.from({ length: 8 }).map((_, index) => (
											<Skeleton key={index} height="24px" />
										))}
									</Stack>
								) : filteredFields.length > 0 ? (
									<div className={classes.fieldsWrapper}>
										{filteredFields.map((field: string) => {
											const isSelected = selectedFields[stream]?.includes(field);
											const dataType = fieldsIter.fieldTypeMap[field];
											return (
												<CorrelationFieldItem
													key={`${stream}-${field}`}
													headerColor={fieldsIter.headerColor}
													backgroundColor={fieldsIter.backgroundColor}
													iconColor={fieldsIter.iconColor}
													fieldName={field.replace(`${stream}.`, '')}
													dataType={dataType}
													isSelected={isSelected}
													onClick={() => {
														if (isCorrelatedData) setIsCorrelationEnabled(true);
														setCorrelationData((store) => setSelectedFields(store, field, stream));
													}}
												/>
											);
										})}
									</div>
								) : (
									<Text className={classes.noFieldText}>No fields match your search.</Text>
								)}
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
								disabled={logsLoading}
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
										<CorrelationFieldItem
											key={`${streamName}-${index}`}
											headerColor={fields[streamName]['headerColor']}
											backgroundColor={fields[streamName]['backgroundColor']}
											iconColor={fields[streamName]['iconColor']}
											fieldName={field}
											onDelete={() => {
												isCorrelatedData && setIsCorrelationEnabled(true);
												setCorrelationData((store) => deleteSelectedField(store, field, streamName));
											}}
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
												? Object.keys(fields[streamNames[1]].fieldTypeMap).filter(
														(key) => fields[streamNames[1]].fieldTypeMap[key] !== 'list',
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
								variant="outline"
								disabled={!isCorrelationEnabled}
								onClick={() => {
									setCorrelationData((store) => setIsCorrelatedFlag(store, true));
									setIsCorrelationEnabled(false);
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
						<CorrelationFooter loaded={showTable} hasNoData={hasNoData} isFetchingCount={true} />
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
