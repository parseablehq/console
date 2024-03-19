import { useAppStore } from '@/layouts/MainLayout/AppProvider';
import { Modal, Stack } from '@mantine/core';
import { Text } from '@mantine/core';
import Cookies from 'js-cookie';

const ModalTitle = () => {
	return <Text style={{ fontSize: '1.2rem', fontWeight: 700, marginLeft: '0.5rem' }}>User Details</Text>;
};

type UserModalProps = {
	opened: boolean;
	onClose: () => void;
	userData: {[key: string]: string}
}

const UserModal = (props: UserModalProps) => {
	const username = Cookies.get('username');

	const [userRoles] = useAppStore(store => store.userRoles);
	if (!userRoles) return null;

	return (
		<Modal
			opened={props.opened}
			onClose={props.onClose}
			centered
			styles={{ body: { padding: '0 0.5rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
			title={<ModalTitle />}>
			<Stack style={{ padding: '1rem' }}>
				<Stack gap={0}>
					<Text style={{ fontSize: '1rem', fontWeight: 600 }}>Username:</Text>
					<Text>{username}</Text>
				</Stack>
				<Stack gap={0}>
					<Text style={{ fontSize: '1rem', fontWeight: 600 }}>Roles:</Text>
					{Object.entries(userRoles).map(([key, value], index) => {
						return (
							<Text key={index}>
								{index + 1}. {key} ({value[0].privilege})
							</Text>
						);
					})}
				</Stack>
			</Stack>
		</Modal>
	);
};

export default UserModal;
