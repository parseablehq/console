import _ from 'lodash';
import { useDocumentTitle } from '@mantine/hooks';
import { Stack, Box, TextInput, Text, Select, Button } from '@mantine/core';
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
import TimeRange from '@/components/Header/TimeRange';
import RefreshInterval from '@/components/Header/RefreshInterval';
import RefreshNow from '@/components/Header/RefreshNow';
import ShareButton from '@/components/Header/ShareButton';
import { MaximizeButton } from '../Stream/components/PrimaryToolbar';
import { useLogsStore } from '../Stream/providers/LogsProvider';
import MultiEventTimeLineGraph from './components/MultiEventTimeLineGraph';

const { changeStream } = appStoreReducers;
const { deleteStreamData, setSelectedFields, deleteSelectedField, setCorrelationCondition } = correlationStoreReducers;

type StreamSelectBoxProps = {
	label: string;
	placeholder: string;
	disabled: boolean;
	onChange: (value: string | null) => void;
	data: { value: string; label: string }[];
	isFirst: boolean;
};

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

const StreamSelectBox: React.FC<StreamSelectBoxProps> = ({ label, placeholder, disabled, onChange, data, isFirst }) => {
	return (
		<div className={classes.noStreamsWrapper} style={{ border: isFirst ? '1px dashed #9F1239' : '1px dashed #7E22CE' }}>
			<Select
				searchable
				classNames={{
					input: classes.streamInput,
					description: classes.streamSelectDescription,
				}}
				onChange={onChange}
				placeholder={placeholder}
				style={{ width: '100%', padding: '10px' }}
				data={data}
				disabled={disabled}
			/>
			<div>
				<Text fw={700} c={disabled ? '#CBCBCB' : '#000'}>
					{disabled ? 'Select Stream 1 first' : label}
				</Text>
			</div>
		</div>
	);
};

const Correlation = () => {
	useDocumentTitle('Parseable | Correlation');
	// State Management Hooks
	const [userSpecificStreams] = useAppStore((store) => store.userSpecificStreams);
	const [{ fields, selectedFields, tableOpts }, setCorrelationData] = useCorrelationStore((store) => store);
	const { getCorrelationData, loading: logsLoading, error: errorMessage, schemaLoading } = useCorrelationQueryLogs();
	const [timeRange] = useLogsStore((store) => store.timeRange);
	const [currentStream, setAppStore] = useAppStore((store) => store.currentStream);
	const [maximized] = useAppStore((store) => store.maximized);

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
		if (currentStream) {
			getCorrelationData();
		}
	}, [currentStream, timeRange]);

	// Utility Functions
	const filterFields = (fieldsIter: any) => {
		const typedFields = Object.keys(fieldsIter.fieldTypeMap) as string[];
		return searchText
			? typedFields.filter((field) => field.toLowerCase().includes(searchText.toLowerCase()))
			: typedFields;
	};

	const updateCorrelationCondition = () => {
		if (select1Value && select2Value) {
			const condition = `${streamNames[0]}.${select1Value} = ${streamNames[1]}.${select2Value}`;
			setCorrelationData((store) => setCorrelationCondition(store, condition));
		}
	};

	useEffect(() => {
		updateCorrelationCondition();
	}, [select1Value, select2Value]);

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

	// View Flags
	const hasContentLoaded = !schemaLoading && !logsLoading;
	const hasNoData = hasContentLoaded && !errorMessage && tableOpts.pageData.length === 0;
	const showTable = hasContentLoaded && !hasNoData && !errorMessage;

	return (
		<Box className={classes.correlationWrapper}>
			<div className={classes.correlationSideBarWrapper}>
				<Text>Streams</Text>
				<TextInput
					disabled={streamNames.length === 0}
					w="100%"
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
										onClick={() => setCorrelationData((store) => deleteStreamData(store, stream))}
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
						<div className={classes.fieldsJoinsWrapper}>
							<div style={{ color: Object.keys(selectedFields).length > 0 ? 'black' : '#CBCBCB' }}>Fields</div>
							<div className={classes.fieldsPillsWrapper}>
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
						<div className={classes.fieldsJoinsWrapper}>
							<div>Joins</div>
							<div className={classes.joinsWrapper}>
								<div style={{ width: '50%' }}>
									<Select
										disabled={streamNames.length === 0}
										placeholder={streamNames[0] ? `Select field from ${streamNames[0]}` : 'Select Stream 1'}
										style={{ height: '100%' }}
										data={streamNames.length > 0 ? Object.keys(fields[streamNames[0]].fieldTypeMap) : []}
										value={select1Value}
										onChange={(value) => handleFieldChange(value, true)}
									/>
								</div>
								<div> = </div>
								<div style={{ width: '50%' }}>
									<Select
										disabled={streamNames.length < 2}
										placeholder={streamNames[1] ? `Select field from ${streamNames[1]}` : 'Select Stream 2'}
										data={streamNames.length > 1 ? Object.keys(fields[streamNames[1]].fieldTypeMap) : []}
										value={select2Value}
										onChange={(value) => handleFieldChange(value, false)}
									/>
								</div>
							</div>
							<div>
								<Button
									onClick={() => getCorrelationData()}
									variant="outline"
									color="#4B52EA"
									disabled={!select1Value || !select2Value}
									style={{ height: '36px', borderRadius: '10px' }}>
									Correlate
								</Button>
							</div>
						</div>
					</Stack>
					<Stack className={classes.logTableControlWrapper} w="100%">
						{/* <CorrelationFilters /> */}
						<TimeRange />
						<RefreshInterval />
						<RefreshNow />
						<ShareButton />
						<MaximizeButton />
					</Stack>
				</Stack>
				<Stack className={classes.logsSecondaryToolbar} style={{ height: STREAM_SECONDARY_TOOLBAR_HRIGHT }}>
					<MultiEventTimeLineGraph />
				</Stack>
				{Object.keys(selectedFields).length > 0 && (
					<>
						<CorrelationTable
							{...{ errorMessage, logsLoading, showTable, hasNoData }}
							primaryHeaderHeight={primaryHeaderHeight}
						/>
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
