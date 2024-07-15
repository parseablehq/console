import { parseLogData } from '@/utils';
import { Box } from '@mantine/core';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import { FC, Fragment, useCallback } from 'react';
import { Log } from '@/@types/parseable/api/query';
import tableStyles from '../../styles/Logs.module.css';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';

const columnsToSkip = ['p_metadata', 'p_tags'];

const { setSelectedLog } = logsStoreReducers;

type LogRowProps = {
	rowArrows?: boolean;
	isPinned?: boolean;
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
	const onClick = useCallback((log: Log) => {
		const selectedText = window.getSelection()?.toString();
		if (selectedText!== undefined && selectedText?.length > 0) return;
		
		setLogsStore((store) => setSelectedLog(store, log));
	}, []);

	return (
		<Fragment>
			{pageData.map((log, logIndex) => {
				return (
					<tr key={logIndex} className={logIndex % 2 ? trStyle : trEvenStyle} onClick={() => onClick(log)}>
						{columnsToShow.map((header, logSchemaIndex) => {
							return <td key={`${header}-${logSchemaIndex}`}>{parseLogData(log[header], header)}</td>;
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
