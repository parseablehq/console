import { EmptySimple } from '@/components/Empty';
import { Text, Button, Center } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import type { FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import classes from './Home.module.css';

const Home: FC = () => {
	const location = useLocation();
	const pathname = location.state?.from?.pathname;

	const { container, messageStyle, btnStyle } = classes;
	if (pathname) {
		return <Navigate to={{ pathname }} />;
	} else {
		return (
			<Center className={container}>
				<EmptySimple height={70} width={100} />
				<Text className={messageStyle}>No Stream found on this account</Text>
				<Button
					target="_blank"
					component="a"
					href="https://www.parseable.io/docs/category/log-ingestion"
					className={btnStyle}
					leftSection={<IconExternalLink size="0.9rem" />}>
					Documentation
				</Button>
			</Center>
		);
	}
};

export default Home;
