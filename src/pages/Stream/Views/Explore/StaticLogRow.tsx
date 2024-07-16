import { parseLogData } from '@/utils';
import { Group, CopyButton, ActionIcon, Tooltip, Box } from '@mantine/core';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import { FC, Fragment, useCallback, MouseEvent } from 'react';
import { Log } from '@/@types/parseable/api/query';
import tableStyles from '../../styles/Logs.module.css';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { IconCopy, IconCheck } from '@tabler/icons-react';

const columnsToSkip = ['p_metadata', 'p_tags'];

const { setSelectedLog } = logsStoreReducers;

type LogRowProps = {
	rowArrows?: boolean;
	isPinned?: boolean;
};

const CopyFieldValues = (props: { fieldValue: any }) => {
	const handleCopyBtnClick = useCallback((e:MouseEvent,copy: () => void) => {
		e.stopPropagation()
		copy();
	}, []);

	return (
		<CopyButton value={props.fieldValue} timeout={2000}>
			{({ copied, copy }) => (
				<Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
					<ActionIcon variant="subtle" onClick={(e) => handleCopyBtnClick(e,copy)}>
						{copied ? (
							<IconCheck style={{ backgroundColor: 'transparent', color: '#211F1F' }} stroke={1.2} />
						) : (
							<IconCopy style={{ backgroundColor: 'transparent', color: '#211F1F' }} stroke={1.2} />
						)}
					</ActionIcon>
				</Tooltip>
			)}
		</CopyButton>
	);
};

const LogRow: FC<LogRowProps> = (props) => {
	const { isPinned, rowArrows } = props;
	const classes = tableStyles;
	const { trStyle, trEvenStyle } = classes;
	const [tableOpts, setLogsStore] = useLogsStore((store) => store.tableOpts);
	const { pinnedColumns, disabledColumns, headers, pageData } = tableOpts;
	const columnsToIgnore = [
		...disabledColumns,
		...columnsToSkip,
		...headers.filter((header) => (isPinned ? !pinnedColumns.includes(header) : pinnedColumns.includes(header))),
	];
	const columnsToShow = headers.filter((header) => !columnsToIgnore.includes(header));
	const onClick = useCallback(( log: Log) => {

		const selectedText = window.getSelection()?.toString();
		if (selectedText !== undefined && selectedText?.length > 0) return;

		setLogsStore((store) => setSelectedLog(store, log));
	}, []);

	return (
		<Fragment>
			{pageData.map((log, logIndex) => {
				return (
					<tr key={logIndex} className={logIndex % 2 ? trStyle : trEvenStyle} onClick={() => onClick( log)}>
						{columnsToShow.map((header, logSchemaIndex) => {
							const parsedData = parseLogData(log[header], header);
							return (
								<td key={`${header}-${logSchemaIndex}`} className={classes.tableDivision}>
									<Group style={{ justifyContent: 'space-between', width: '100%' }} wrap="nowrap">
										{parsedData}
										<Group style={{ zIndex: 1 }} className={classes.copyBtn}>
											<CopyFieldValues fieldValue={parsedData} />
										</Group>
									</Group>
								</td>
							);
						})}
						{rowArrows && <ViewLogArrow />}
					</tr>
				);
			})}
		</Fragment>
	);
};

const ViewLogArrow: FC = () => {
	const classes = tableStyles;
	const { tdArrow, tdArrowContainer } = classes;

	return (
		<td className={tdArrow}>
			<Box className={tdArrowContainer}>
				<IconArrowNarrowRight size={'1.4rem'} stroke={1} />
			</Box>
		</td>
	);
};

export default LogRow;
