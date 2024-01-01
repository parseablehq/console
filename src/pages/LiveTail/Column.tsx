import { UnstyledButton } from '@mantine/core';
import { type FC } from 'react';

import { useTableColumnStyle } from './styles';
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';

type Column = {
	columnName: string;
};

const Column: FC<Column> = (props) => {
	const { columnName } = props;

	const { classes } = useTableColumnStyle();
	const { labelBtn } = classes;

	return (
		<th
			style={{
				height: '42px',
				padding: 0,
				textAlign: 'left',
			}}>
			<UnstyledButton className={labelBtn}>
				<span>{capitalizeFirstLetter(columnName)}</span>
			</UnstyledButton>
		</th>
	);
};

export default Column;
