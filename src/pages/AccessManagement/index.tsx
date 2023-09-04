import { Box } from '@mantine/core';
import { FC } from 'react';
import Users from './Users';
import Roles from './Roles';

const AccessMangement: FC = () => {
	return (
		<Box sx={{
            display: 'flex',
            width: '100%',
        }}>
			<Users />
            <Roles/>
		</Box>
	);
};

export default AccessMangement;
