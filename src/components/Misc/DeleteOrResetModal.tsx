import { Box, Button, Modal, Stack, Text, TextInput } from '@mantine/core';
import classes from './styles/deletemodal.module.css';
import { ChangeEvent, useCallback, useState } from 'react';

type DeleteOrResetModalProps = {
	type: 'delete' | 'reset';
	header: string;
	content: string;
	isOpen: boolean;
	onClose: () => void;
	confirmationText: string;
	isProcessing?: boolean;
	onConfirm: () => void;
	placeholder: string;
};

/**
 * Confirmation modal for deleting or resetting an item.
 * @param type - Type of the modal.
 * @param isOpen - Whether the modal is open.
 * @param onClose - Function to close the modal.
 * @param header - Header text for the modal.
 * @param content - Content text for the modal.
 * @param confirmationText - Text to confirm the action.
 * @param isProcessing - Whether the action is processing.
 * @param onConfirm - Function to confirm the action.
 * @param placeholder - Placeholder text for the input field.
 * */
const DeleteOrResetModal = ({
	type,
	header,
	content,
	isOpen,
	onClose,
	confirmationText,
	isProcessing,
	onConfirm,
	placeholder,
}: DeleteOrResetModalProps) => {
	const [confirmText, setConfirmText] = useState<string>('');

	const onChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setConfirmText(e.target.value);
	}, []);

	const tryConfirm = () => {
		if (confirmationText === confirmText) {
			setConfirmText('');
			onConfirm();
		}
	};

	const closeModal = () => {
		setConfirmText('');
		onClose();
	};
	return (
		<Modal
			withinPortal
			opened={isOpen}
			onClose={closeModal}
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

					<TextInput value={confirmText} onChange={onChangeHandler} placeholder={placeholder} required />
				</Stack>
				<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
					<Box>
						<Button variant="outline" onClick={closeModal}>
							Cancel
						</Button>
					</Box>
					<Box>
						<Button
							disabled={confirmationText !== confirmText || isProcessing}
							onClick={tryConfirm}
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
