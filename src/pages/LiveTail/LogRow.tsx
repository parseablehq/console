import { parseLogData } from '@/utils';
import { FC, Fragment } from 'react';
import { useLiveTailTableStyles } from './styles';
import { Log } from '@/@types/parseable/api/query';
import { LogStreamData } from '@/@types/parseable/api/stream';

type LogRowProps = {
	logData: Log[];
	logsSchema: LogStreamData;
};

const LogRow: FC<LogRowProps> = (props) => {
	const { logData, logsSchema } = props;

	const { classes } = useLiveTailTableStyles();
	const { trStyle, trEvenStyle } = classes;

	return (
		<Fragment>
			{logData.map((log: any, logIndex: any) => {
				return (
					<tr key={logIndex} className={logIndex % 2 ? trStyle : trEvenStyle}>
						{logsSchema.map((logSchema: any, logSchemaIndex: any) => {
							return (
								<td key={`${logSchema.name}-${logSchemaIndex}`}>{parseLogData(log[logSchema.name], logSchema.name)}</td>
							);
						})}
					</tr>
				);
			})}
		</Fragment>
	);
};

export default LogRow;
