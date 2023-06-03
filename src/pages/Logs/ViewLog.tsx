import useMountedState from '@/hooks/useMountedState';
import { Box, Chip, CloseButton, Divider, Drawer, Text, px } from '@mantine/core';
import { Prism } from '@mantine/prism';
import type { FC } from 'react';
import { useEffect, Fragment, useMemo } from 'react';
import { useLogsPageContext } from './Context';
import { useViewLogStyles } from './styles';
import dayjs from 'dayjs';

const ViewLog: FC = () => {
	const {
		state: { subViewLog },
	} = useLogsPageContext();

	const [log, setLog] = useMountedState(subViewLog.get());

	useEffect(() => {
		const listener = subViewLog.subscribe(setLog);

		return () => listener();
	}, []);

	const onClose = () => {
		subViewLog.set(null);
	};

	const { classes } = useViewLogStyles();
	const { container } = classes;

	const p_metadata = useMemo(() => {
		if (log) {
			const metadata = log.p_metadata.split('^').filter(Boolean);
			if (metadata.length) return metadata;
		}
		return [];
	}, [log]);

	const p_tags = useMemo(() => {
		if (log) {
			const tags = log.p_tags.split('^').filter(Boolean);
			if (tags.length) return tags;
		}
		return [];
	}, [log]);

	return (
		<Drawer opened={!!log} onClose={onClose} position="right" size="lg" withCloseButton={false} padding={0}>
			<Header timeStamp={log?.p_timestamp ?? ''} onClose={onClose} />

			{!!log && (
				<Fragment>
					<Box className={container}>
						<DataChip title="Meta Data" dataList={p_metadata} />
						<DataChip title="Tags" dataList={p_tags} />
						<Divider label={'Logger Message'} variant="dashed" labelPosition="center" my="lg" />
						<Prism
							copyLabel="Copy"
							language="json"
							withLineNumbers
							style={{
								maxWidth: '100%',
							}}>
							{JSON.stringify(log, null, 2)}
						</Prism>
					</Box>
				</Fragment>
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
	const { classes } = useViewLogStyles();

	const { headerContainer, headerTimeStampTitle, headerTimeStamp } = classes;

	const timeStamp = useMemo(() => dayjs(props.timeStamp).format('DD/MM/YYYY (hh:mm:ss A)'), []);

	return (
		<Box className={headerContainer}>
			<Box>
				<Text className={headerTimeStampTitle}>Timestamp</Text>
				<Text className={headerTimeStamp}>{timeStamp}</Text>
			</Box>

			<CloseButton iconSize={px('1.5rem')} onClick={onClose} />
		</Box>
	);
};

type DataChipProps = {
	title: string;
	dataList: string[];
};

const DataChip: FC<DataChipProps> = (props) => {
	const { dataList, title } = props;
	const { classes } = useViewLogStyles();
	const { dataChipContainer } = classes;

	return dataList.length ? (
		<Fragment>
			<Divider label={title} variant="dashed" labelPosition="center" my="lg" />
			<Box className={dataChipContainer}>
				{[...dataList, ...dataList, ...dataList, ...dataList, ...dataList].map((data) => {
					return (
						<Chip checked={false} key={data} variant="filled" mb="xs">
							{data}
						</Chip>
					);
				})}
			</Box>
		</Fragment>
	) : null;
};

export default ViewLog;
