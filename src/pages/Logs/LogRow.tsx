import { LogStreamData, LogsData } from '@/@types/parseable/api/stream';
import { parseLogData } from '@/utils';
import { Box, px } from '@mantine/core';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import { FC, Fragment } from 'react';
import { useLogsPageContext } from './Context';
import { useLogTableStyles } from './styles';

const skipFields = ['p_metadata', 'p_tags'];

type LogRowProps = {
	logData: LogsData;
	logsSchema: LogStreamData;
	isColumnActive: (columnName: string) => boolean;
};

const LogRow: FC<LogRowProps> = (props) => {
	const { logData, logsSchema, isColumnActive } = props;
	const {
		state: { subViewLog },
	} = useLogsPageContext();

	const onShow = (log: LogsData[number]) => {
		subViewLog.set(log);
	};

	const { classes } = useLogTableStyles();
	const { trStyle } = classes;

	return (
		<Fragment>
			{logData.map((log) => {
				return (
					// Using  p_timestamp as a key since it's guaranteed felid and unique
					<tr key={log.p_timestamp} className={trStyle} onClick={() => onShow(log)}>
						{logsSchema.map((logSchema) => {
							if (!isColumnActive(logSchema.name) || skipFields.includes(logSchema.name)) return null;

							// Using logSchema name and  p_timestamp as a key since it's guaranteed felid and unique
							return <td key={`${logSchema.name}-${log.p_timestamp}`}>{parseLogData(log[logSchema.name])}</td>;
						})}
						<TdArrow />
					</tr>
				);
			})}
		</Fragment>
	);
};

const TdArrow: FC = () => {
	const { classes } = useLogTableStyles();
	const { tdArrow, tdArrowContainer } = classes;

	return (
		<td className={tdArrow}>
			<Box className={tdArrowContainer}>
				<IconArrowNarrowRight size={px('1.6rem')} stroke={1} />
			</Box>
		</td>
	);
};

export default LogRow;
