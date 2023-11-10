import { ActionIcon, Tooltip } from '@mantine/core';
import { IconBook2 } from '@tabler/icons-react';
import type { FC } from 'react';

const DocsUser: FC = () => {

	return (
		<Tooltip label={'Docs'} withArrow position="left">
			<ActionIcon
				variant="default"
				onClick={() => {
					window.open('https://www.parseable.io/docs/rbac', '_blank');
				}}
				radius={"md"}
				size={"lg"}
				>
				<IconBook2 stroke={1.5} />
			</ActionIcon>
		</Tooltip>
	);
};

export default DocsUser;
