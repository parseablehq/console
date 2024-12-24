import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { Modal, Stack } from '@mantine/core';
import { Text } from '@mantine/core';
import Cookies from 'js-cookie';
import responsive from '@/styles/responsiveText.module.css';

const ModalTitle = () => {
	return (
		<Text className={responsive.responsiveText} style={{ fontWeight: 600, marginLeft: '0.5rem' }}>
			User Details
		</Text>
	);
};

type UserModalProps = {
	opened: boolean;
	onClose: () => void;
	userData: { [key: string]: string };
};

const UserModal = (props: UserModalProps) => {
	const username = Cookies.get('username');

	const [userRoles] = useAppStore((store) => store.userRoles);
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
					<Text className={responsive.responsiveText} style={{ fontWeight: 500 }}>
						Username:
					</Text>
					<Text className={responsive.responsiveText}>{username}</Text>
				</Stack>
				<Stack gap={0}>
					<Text className={responsive.responsiveText} style={{ fontWeight: 500 }}>
						Roles:
					</Text>
					{Object.entries(userRoles).map(([key, value], index) => {
						return (
							<Text key={index} className={responsive.responsiveText}>
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
