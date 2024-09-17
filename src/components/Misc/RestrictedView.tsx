import { Stack, Text } from '@mantine/core';

const RestrictedView = () => {
	return (
		<Stack
			style={{
				flex: 1,
				height: '100%',
				width: '100%',
				alignItems: 'center',
				justifyContent: 'center',
			}}>
			<Stack>
				<Text ta="center" c='gray.6'>You dont have access to this. Please contact your admin.</Text>
			</Stack>
		</Stack>
	);
};

export default RestrictedView;
