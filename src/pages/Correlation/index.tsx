import { Box, Center, Stack, Stepper } from '@mantine/core';
import {
	PRIMARY_HEADER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
	STREAM_SECONDARY_TOOLBAR_HRIGHT,
} from '@/constants/theme';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { correlationStoreReducers, useCorrelationStore } from './providers/CorrelationProvider';
import { useEffect, useState } from 'react';
import { useGetMultipleStreamSchemas, useGetStreamSchema } from '@/hooks/useGetCorrelationStreamSchema';

import { CorrelationEmptyPlaceholder } from './components/CorrelationEmptyPlaceholder';
import CorrelationFooter from './Views/CorrelationFooter';
import { CorrelationSidebar } from './components/CorrelationSideBar';
import CorrelationTable from './Views/CorrelationTable';
import { CorrelationToolbar } from './components/CorrelationToolbar';
import CorrleationJSONView from './Views/CorrelationJSONView';
import SaveCorrelationModal from './components/SaveCorrelationModal';
import SavedCorrelationsModal from './components/SavedCorrelationsModal';
import _ from 'lodash';
import classes from './styles/Correlation.module.css';
import dayjs from 'dayjs';
import { useCorrelationFetchCount } from './hooks/useCorrelationFetchCount';
import { useCorrelationQueryLogs } from '@/hooks/useCorrelationQueryLogs';
import { useCorrelationsQuery } from '@/hooks/useCorrelations';
import { useDocumentTitle } from '@mantine/hooks';
import { useFetchStreamData } from '@/hooks/useFetchStreamData';
import useParamsController from './hooks/useParamsController';

const { setStreamForCorrelation, setTimeRange } = appStoreReducers;
const { setSelectedFields, setCorrelationCondition, setActiveCorrelation, setPageAndPageData, setTargetPage } =
	correlationStoreReducers;

const Correlation = () => {
	useDocumentTitle('Parseable | Correlation');
	// State Management Hooks
	const [
		{
			fields,
			selectedFields,
			tableOpts,
			isCorrelatedData,
			activeCorrelation,
			correlationCondition,
			correlationId,
			savedCorrelationId,
			viewMode,
			correlations,
		},
		setCorrelationData,
	] = useCorrelationStore((store) => store);

	const { isStoreSynced } = useParamsController();
	const [timeRange] = useAppStore((store) => store.timeRange);
	const [streamForCorrelation, setAppStore] = useAppStore((store) => store.streamForCorrelation);
	const [maximized] = useAppStore((store) => store.maximized);
	const { isLoading: schemaLoading } = useGetStreamSchema({
		streamName: streamForCorrelation || '',
	});
	const isSavedCorrelation = correlationId !== savedCorrelationId;
	const streamsToFetch =
		(isSavedCorrelation && activeCorrelation?.tableConfigs.map((config: { tableName: string }) => config.tableName)) ||
		[];
	const { isLoading: multipleSchemasLoading } = useGetMultipleStreamSchemas(streamsToFetch);

	const { getCorrelationData, loadingState, error: errorMessage } = useCorrelationQueryLogs();
	const { getFetchStreamData, loading: streamsLoading } = useFetchStreamData();
	const { fetchCorrelations } = useCorrelationsQuery();
	const { refetchCount, countLoading } = useCorrelationFetchCount();

	// Local State
	const [select1Value, setSelect1Value] = useState<{
		value: string | null;
		dataType?: '' | 'number' | 'boolean' | 'text' | 'timestamp' | 'list' | null;
	}>({
		value: null,
		dataType: '',
	});
	const [select2Value, setSelect2Value] = useState<{
		value: string | null;
		dataType?: '' | 'number' | 'boolean' | 'text' | 'timestamp' | 'list' | null;
	}>({
		value: null,
		dataType: '',
	});
	const [isCorrelationEnabled, setIsCorrelationEnabled] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	// Derived Constants
	const primaryHeaderHeight = maximized
		? 0
		: PRIMARY_HEADER_HEIGHT + STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT + STREAM_SECONDARY_TOOLBAR_HRIGHT;

	const streamNames = Object.keys(fields);
	const { currentOffset, pageData, targetPage, currentPage } = tableOpts;

	// Effects
	useEffect(() => {
		if (isStoreSynced) {
			fetchCorrelations();
			setIsLoading(false);
		}
	}, [isStoreSynced]);

	useEffect(() => {
		if (multipleSchemasLoading || !activeCorrelation) return;

		const tableOrder = activeCorrelation?.tableConfigs.reduce((acc, config, index) => {
			acc[config.tableName] = index;
			return acc;
		}, {} as Record<string, number>);

		const sortedJoinConditions = [...(activeCorrelation?.joinConfig.joinConditions || [])].sort(
			(a, b) => (tableOrder[a.tableName] || 0) - (tableOrder[b.tableName] || 0),
		);

		if (sortedJoinConditions[0]) {
			setSelect1Value({ value: sortedJoinConditions[0].field });
		}
		if (sortedJoinConditions[1]) {
			setSelect2Value({ value: sortedJoinConditions[1].field });
		}

		activeCorrelation?.tableConfigs.flatMap((config) =>
			config.selectedFields.map((field: string) =>
				setCorrelationData((store) => setSelectedFields(store, field, config.tableName)),
			),
		) || [];
	}, [activeCorrelation, multipleSchemasLoading]);

	useEffect(() => {
		if (!isSavedCorrelation || !correlationId) return;
		const activeCorrelation = correlations?.find((correlation) => correlation.id === correlationId) || null;
		activeCorrelation?.startTime &&
			activeCorrelation?.endTime &&
			setAppStore((store) =>
				setTimeRange(store, {
					startTime: dayjs(activeCorrelation?.startTime),
					endTime: dayjs(activeCorrelation?.endTime),
					type: 'custom',
				}),
			);
		setSelect1Value({ value: null, dataType: '' });
		setSelect2Value({ value: null, dataType: '' });
		setCorrelationData((store) => setCorrelationCondition(store, ''));
		setCorrelationData((store) => setSelectedFields(store, '', '', true));
		setCorrelationData((store) => setActiveCorrelation(store, activeCorrelation));
	}, [correlationId, correlations]);

	useEffect(() => {
		if (streamForCorrelation && streamNames.length > 0 && Object.keys(fields).includes(streamForCorrelation)) {
			getFetchStreamData();
		}
	}, [streamForCorrelation, fields]);

	useEffect(() => {
		if (isCorrelatedData) {
			getCorrelationData();
		} else {
			getFetchStreamData();
		}
	}, [currentOffset, timeRange]);

	useEffect(() => {
		updateCorrelationCondition();
		if (activeCorrelation && correlationCondition && isSavedCorrelation) {
			refetchCount();
			getCorrelationData();
		}
		correlationCondition && setIsCorrelationEnabled(true);
	}, [select1Value, select2Value, activeCorrelation, correlationCondition]);

	const updateCorrelationCondition = () => {
		if (select1Value.value && select2Value.value) {
			const condition = `"${streamNames[0]}".${select1Value.value} = "${streamNames[1]}".${select2Value.value}`;
			setAppStore((store) => setStreamForCorrelation(store, 'correlatedStream'));
			setCorrelationData((store) => setCorrelationCondition(store, condition));
		}
	};

	// View Flags
	const hasContentLoaded = !schemaLoading && !loadingState && !streamsLoading && !multipleSchemasLoading;
	const hasNoData = hasContentLoaded && !errorMessage && pageData.length === 0;
	const showTable = hasContentLoaded && !hasNoData && !errorMessage;

	const isStreamsLoading = loadingState || schemaLoading || streamsLoading || multipleSchemasLoading;

	useEffect(() => {
		if (!showTable) return;

		if (targetPage) {
			setCorrelationData((store) => setPageAndPageData(store, targetPage));
			if (currentPage === targetPage) {
				setCorrelationData((store) => setTargetPage(store, undefined));
			}
		}
	}, [loadingState, currentPage]);

	if (isLoading || !Object.keys(fields) || !Object.keys(selectedFields)) return;

	return (
		<Box className={classes.correlationWrapper}>
			<SavedCorrelationsModal />
			<SaveCorrelationModal />
			<CorrelationSidebar
				isLoading={isStreamsLoading}
				loadingState={loadingState}
				setSelect1Value={setSelect1Value}
				setSelect2Value={setSelect2Value}
				setIsCorrelationEnabled={setIsCorrelationEnabled}
			/>
			<Stack
				gap={0}
				style={{ maxHeight: maximized ? '100vh' : `calc(100vh - ${PRIMARY_HEADER_HEIGHT}px)` }}
				className={classes.selectionWrapper}>
				<CorrelationToolbar
					setIsCorrelationEnabled={setIsCorrelationEnabled}
					select1Value={select1Value}
					select2Value={select2Value}
					setSelect1Value={setSelect1Value}
					setSelect2Value={setSelect2Value}
					isCorrelationEnabled={isCorrelationEnabled}
				/>
				{Object.keys(selectedFields).length > 0 && (
					<>
						{viewMode === 'table' ? (
							<>
								<CorrelationTable
									{...{ errorMessage, logsLoading: loadingState, streamsLoading, showTable, hasNoData }}
									primaryHeaderHeight={primaryHeaderHeight}
								/>
							</>
						) : (
							<CorrleationJSONView
								{...{ errorMessage, logsLoading: loadingState, streamsLoading, showTable, hasNoData }}
							/>
						)}
						<CorrelationFooter loaded={showTable} hasNoData={hasNoData} isFetchingCount={countLoading} />
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
