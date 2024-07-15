import { Box, Chip, CloseButton, Divider, Drawer, Text, px } from '@mantine/core';
import type { FC } from 'react';
import { Fragment, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import viewLogStyles from '../styles/ViewLogs.module.css';
import { CodeHighlight } from '@mantine/code-highlight';
import { useLogsStore, logsStoreReducers } from '../providers/LogsProvider';

const { setSelectedLog } = logsStoreReducers;

const ViewLog: FC = () => {
	const [selectedLog, setLogsStore] = useLogsStore((store) => store.selectedLog);
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
						code={JSON.stringify(selectedLog, null, 2)}
						language="json"
						styles={{ copy: { marginLeft: '550px' } }}
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

	const { headerContainer, headerTimeStampTitle, headerTimeStamp, headerCloseBtn } = classes;

	const timeStamp = useMemo(() => dayjs(`${props.timeStamp}+00:00`).utc().format('DD/MM/YYYY (hh:mm:ss A) z'), []);

	const isValidTimestamp = !isNaN(Date.parse(props.timeStamp));
	return (
		<Box className={headerContainer}>
			{isValidTimestamp ? (
				<Box>
					<Text className={headerTimeStampTitle}>Timestamp</Text>
					<Text className={headerTimeStamp}>{timeStamp}</Text>
				</Box>
			) : (
				<Box />
			)}

			<CloseButton className={headerCloseBtn} iconSize={px('1.5rem')} onClick={onClose} />
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
