import { Stack, Text } from '@mantine/core';

const defaultMsg = 'Access restricted, Please contact your administrator.';

type RestrictedViewOpts = {
	msg?: string;
};

const RestrictedView = (opts: RestrictedViewOpts) => {
	const msg = opts.msg || defaultMsg;
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
				<Text ta="center" c="gray.6">
					{msg}
				</Text>
			</Stack>
		</Stack>
	);
};

export default RestrictedView;
