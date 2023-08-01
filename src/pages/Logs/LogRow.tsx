import { LogStreamData } from '@/@types/parseable/api/stream';
import { parseLogData } from '@/utils';
import { Box, px } from '@mantine/core';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import { FC, Fragment, useEffect, useRef } from 'react';
import { useLogsPageContext } from './Context';
import { useLogTableStyles } from './styles';
import { Log } from '@/@types/parseable/api/query';

const skipFields = ['p_metadata', 'p_tags'];

type LogRowProps = {
	logData: Log[];
	logsSchema: LogStreamData;
	isColumnActive: (columnName: string) => boolean;
	isColumnPinned: (columnName: string) => boolean;
};

const LogRow: FC<LogRowProps> = (props) => {
	const { logData, logsSchema, isColumnActive,isColumnPinned } = props;
	const {
		state: { subViewLog },
	} = useLogsPageContext();

	const onShow = (log: Log) => {
		subViewLog.set(log);
	};

	const { classes } = useLogTableStyles();
	const { trStyle } = classes;



	return (
		<Fragment>
			{logData.map((log, logIndex) => {
				return (
					/*
					 TODO: It seems like p_timestamp is not unique so i cant be used as a key
					 And there is no way to tell if a user will add a unique id field
					 Hopefully there will be a plan to add a p_id filed internally
					 For now index is a better option for uniqueness, if you have a better way to handle this let us know
					*/
					<tr key={logIndex} className={trStyle} onClick={() => onShow(log)}>
						{logsSchema.map((logSchema, logSchemaIndex) => (
							<TdText log={log} logSchema={logSchema} logSchemaIndex={logSchemaIndex} isColumnActive={isColumnActive} isColumnPinned={isColumnPinned} 
							logsSchema={logsSchema}
							/>
			))}
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


type TdTextProps = {
	log: Log;
	logSchema: any;
	logSchemaIndex: number;
	isColumnActive: (columnName: string) => boolean;
	isColumnPinned: (columnName: string) => boolean;
	logsSchema: LogStreamData;
};

const TdText: FC<TdTextProps> = (props) => {

	const { log, logSchema, logSchemaIndex, isColumnActive,isColumnPinned , logsSchema} = props;
	const ref = useRef<HTMLTableCellElement>(null);

	useEffect(() => {
		if (ref.current) {
			ref.current.style.left = `${ref.current.offsetLeft}px`;
			ref.current.style.position = 'sticky';
			ref.current.style.backgroundColor = "inherit";

		}
	}, [ref.current, logsSchema]);

	if (!isColumnActive(logSchema.name) || skipFields.includes(logSchema.name)) return null;

	return (
		<td key={`${logSchema.name}-${logSchemaIndex}`} 
		ref={isColumnPinned(logSchema.name) ? ref : null}

		> {parseLogData(log[logSchema.name], logSchema.name)}
		
		</td>
	);
};



export default LogRow;
