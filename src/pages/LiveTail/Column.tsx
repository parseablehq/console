import { UnstyledButton } from '@mantine/core';
import { type FC } from 'react';

import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';
import styles from './styles/Column.module.css'

type Column = {
	columnName: string;
};

const Column: FC<Column> = (props) => {
	const { columnName } = props;

	const classes = styles;
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
