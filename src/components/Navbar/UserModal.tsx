import { Box, Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { Text } from '@mantine/core';
import { Editor } from '@monaco-editor/react';
import { useAlertsEditor } from '@/hooks/useAlertsEditor';

const ModalTitle = () => {
	return <Text style={{ fontSize: '1.2rem', fontWeight: 700, marginLeft: '0.5rem' }}>User</Text>;
};

type UserInfoProps = {
	username: string;
	previlage: string;
}

type UserModalProps = {
	opened: boolean;
	onClose: () => void;
	userData: {[key: string]: string}
}

const UserInfo = ({username, previlage}) => {
	return (
		<Stack> 
			<Text></Text>
		</Stack>
	)
}

const UserModal = (props: UserModalProps) => {
	return (
		<Modal
			opened={props.opened}
			onClose={props.onClose}
			centered
			styles={{ body: { padding: '0 0.5rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
			title={<ModalTitle />}>
			<Stack style={{ padding: '1rem 0' }}>
				<Box style={{ height: '500px', padding: '1rem 1rem 1rem -2rem' }}>
					
				</Box>
			</Stack>
		</Modal>
	);
};

export default UserModal;
