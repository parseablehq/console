import { Box, Button, Modal, Stack, Text, TextInput } from '@mantine/core';
import classes from './styles/deletemodal.module.css';

type DeleteOrResetModalProps = {
	type: 'delete' | 'reset';
	header: string;
	content: string;
	isOpen: boolean;
	onClose: () => void;
	inputValue: string;
	confirmationText: string;
	onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	isProcessing: boolean;
	onConfirm: () => void;
};

const DeleteOrResetModal = ({
	type,
	header,
	content,
	isOpen,
	onClose,
	inputValue,
	confirmationText,
	onInputChange,
	isProcessing,
	onConfirm,
}: DeleteOrResetModalProps) => {
	return (
		<Modal
			withinPortal
			opened={isOpen}
			onClose={onClose}
			size="auto"
			centered
			styles={{
				body: { padding: '0 1rem 1rem 1rem', width: 400 },
				header: { padding: '1rem', paddingBottom: '0.4rem' },
			}}
			title={<Text style={{ fontSize: '0.9rem', fontWeight: 600 }}>{header}</Text>}>
			<Stack>
				<Stack gap={8}>
					<Text className={classes.warningText}>{content}</Text>
					<Text className={classes.confirmationText}>
						Please type <span className={classes.confirmationTextHighlight}>{`"${confirmationText}"`}</span> to confirm{' '}
						{type === 'delete' ? 'deletion' : 'reset'}.
					</Text>

					<TextInput value={inputValue} onChange={onInputChange} placeholder={'Type the dashboard name to confirm.'} />
				</Stack>
				<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
					<Box>
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
					</Box>
					<Box>
						<Button
							disabled={confirmationText !== inputValue || isProcessing}
							onClick={onConfirm}
							loading={isProcessing}>
							{type === 'delete' ? 'Delete' : 'Reset'}
						</Button>
					</Box>
				</Stack>
			</Stack>
		</Modal>
	);
};

export default DeleteOrResetModal;
