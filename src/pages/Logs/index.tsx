import { LOGIN_ROUTE } from '@/constants/routes';
import { Button, Center, Text } from '@mantine/core';
import { useDocumentTitle, useLocalStorage } from '@mantine/hooks';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

const SignOut: FC = () => {
	const nav = useNavigate();
	const [, , removeCredentials] = useLocalStorage({ key: 'credentials' });
	const [, , removeUsername] = useLocalStorage({ key: 'username' });

	const onSignOut = () => {
		removeCredentials();
		removeUsername();
		nav(
			{
				pathname: LOGIN_ROUTE,
			},
			{ replace: true },
		);
	};

	return (
		<Button onClick={onSignOut} color="blue">
			Sign out
		</Button>
	);
};

const Logs: FC = () => {
	useDocumentTitle('Parseable | Dashboard');

	return (
		<Center
			style={{
				flex: 1,
			}}>
			<Text mr="lg">Dashboard</Text>
			<SignOut />
		</Center>
	);
};

export default Logs;
