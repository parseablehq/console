import { Box, Chip, CloseButton, Divider, Drawer, Text, px } from '@mantine/core';
import type { FC } from 'react';
import { Fragment, useMemo, useCallback } from 'react';
import viewLogStyles from '../styles/ViewLogs.module.css';
import { CodeHighlight } from '@mantine/code-highlight';
import { useLogsStore, logsStoreReducers, formatLogTs } from '../providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import timeRangeUtils from '@/utils/timeRangeUtils';
import { useStreamStore } from '../providers/StreamProvider';
import _ from 'lodash';

const { setSelectedLog } = logsStoreReducers;
const { formatDateWithTimezone } = timeRangeUtils;

const ViewLog: FC = () => {
	const [selectedLog, setLogsStore] = useLogsStore((store) => store.selectedLog);
	const [fieldTypeMap] = useStreamStore((store) => store.fieldTypeMap);
	const [isSecureHTTPContext] = useAppStore((store) => store.isSecureHTTPContext);
	const onClose = useCallback(() => {
		setLogsStore((store) => setSelectedLog(store, null));
	}, []);
	const classes = viewLogStyles;
	const { container } = classes;

	const p_metadata = useMemo(() => {
		if (selectedLog) {
			const metadata = selectedLog.p_metadata?.split('^').filter(Boolean);
			if (metadata?.length) return metadata;
		}
		return [];
	}, [selectedLog]);

	const p_tags = useMemo(() => {
		if (selectedLog) {
			const tags = selectedLog.p_tags?.split('^').filter(Boolean);
			if (tags?.length) return tags;
		}
		return [];
	}, [selectedLog]);

	const sanitizedLog = useMemo(
		() =>
			_.reduce(
				selectedLog,
				(acc, v, k) => {
					const isTimestamp = _.get(fieldTypeMap, k, null) === 'timestamp';
					const sanitizedValue = isTimestamp ? formatLogTs(_.toString(v)) : v;
					return { ...acc, [k]: sanitizedValue };
				},
				{},
			),
		[selectedLog, fieldTypeMap],
	);

	return (
		<Drawer
			opened={Boolean(selectedLog)}
			onClose={onClose}
			position="right"
			size="lg"
			withCloseButton={false}
			padding={0}>
			<Header timeStamp={selectedLog?.p_timestamp ?? ''} onClose={onClose} />

			{Boolean(selectedLog) && (
				<Box className={container}>
					<DataChip title="Meta Data" dataList={p_metadata} />
					<DataChip title="Tags" dataList={p_tags} />
					<Divider label={'Logger Message'} variant="dashed" labelPosition="center" my="lg" color="gray.6" />
					<CodeHighlight
						code={JSON.stringify(sanitizedLog, null, 2)}
						language="json"
						withCopyButton={isSecureHTTPContext}
						styles={{ copy: { marginLeft: '550px' }, code: { fontSize: classes.viewLogsText } }}
						copyLabel="Copy Log"
					/>
				</Box>
			)}
		</Drawer>
	);
};

type HeaderProps = {
	timeStamp: string;
	onClose: () => void;
};

const Header: FC<HeaderProps> = (props) => {
	const { onClose } = props;
	const classes = viewLogStyles;

	const { headerContainer, headerTimeStampTitle, headerTimeStamp, closeBtn } = classes;
	const tsWithTimezone = formatDateWithTimezone(`${props.timeStamp}Z`);

	return (
		<Box className={headerContainer}>
			{tsWithTimezone !== 'Invalid date' ? (
				<Box>
					<Text className={headerTimeStampTitle}>Ingested at:</Text>
					<Text className={headerTimeStamp}>{tsWithTimezone}</Text>
				</Box>
			) : (
				<Box />
			)}

			<CloseButton className={closeBtn} iconSize={px('1.5rem')} onClick={onClose} />
		</Box>
	);
};

type DataChipProps = {
	title: string;
	dataList: string[];
};

const DataChip: FC<DataChipProps> = (props) => {
	const { dataList, title } = props;
	const classes = viewLogStyles;
	const { dataChipContainer } = classes;

	return dataList.length ? (
		<Fragment>
			<Divider label={title} variant="dashed" labelPosition="center" my="lg" color="gray.6" />
			<Box className={dataChipContainer}>
				{[...dataList].map((data, i) => {
					return (
						<Chip checked={false} key={data + i} variant="filled" mb="xs">
							{data}
						</Chip>
					);
				})}
			</Box>
		</Fragment>
	) : null;
};

export default ViewLog;
