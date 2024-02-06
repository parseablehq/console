import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
import type { FC, ReactNode } from 'react';
import { theme } from './theme';

type MantineProps = {
	children?: ReactNode;
};

const Mantine: FC<MantineProps> = (props) => {
	const { children } = props;

	return (
		<MantineProvider theme={theme}>
			<Notifications />
			<DatesProvider settings={{ locale: 'en' }}>{children}</DatesProvider>
		</MantineProvider>
	);
};

export default Mantine;
