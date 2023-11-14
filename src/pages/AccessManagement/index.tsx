import { Box } from '@mantine/core';
import { FC } from 'react';
import Users from './Users';
import Roles from './Roles';

const AccessMangement: FC = () => {
	return (
		<Box
			style={{
				display: 'flex',
				flexDirection: 'row',
				flex: '1 1 auto',
				overflow: 'scroll',
			}}>
			<Users />
			<Roles />
		</Box>
	);
};

export default AccessMangement;
