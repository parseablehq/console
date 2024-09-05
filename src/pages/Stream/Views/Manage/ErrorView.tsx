import { Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import classes from '../../styles/ErrorView.module.css';

const ErrorView = (props: { msg?: string }) => {
	const { msg = 'Something went wrong' } = props;
	return (
		<Stack gap={2} style={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
			<IconAlertTriangle stroke={1.2} className={classes.warningIcon} />
			<Text className={classes.errorMsgText}>{msg}</Text>
		</Stack>
	);
};

export default ErrorView;
