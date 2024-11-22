import { Box, Button, Modal, Stack, Text, TextInput } from '@mantine/core';
import classes from './styles/deletemodal.module.css';
import { ChangeEvent, useCallback, useState } from 'react';

type BaseProps = {
	header: string;
	specialContent?: React.ReactNode;
	content: string;
	isOpen: boolean;
	onClose: () => void;
	processContent?: React.ReactNode;
	isProcessing?: boolean;
	onConfirm: () => void;
};

// Note: The `confirmationText` and `placeholder` props are required for 'delete' and 'reset' types, but not for 'simple' type.
type DeleteOrResetModalProps =
	| (BaseProps & {
			type: 'simple';
			confirmationText?: never; // Will throw an error if `confirmationText` is passed
			placeholder?: never;
	  })
	| (BaseProps & {
			type: 'delete' | 'reset';
			confirmationText: string;
			placeholder: string;
	  });

/**
 * Confirmation modal for deleting or resetting an item.
 * @param type - Type of the modal, could be 'delete', 'reset' or 'simple'.
 * @param isOpen - Whether the modal is open.
 * @param onClose - Function to close the modal.
 * @param header - Header text for the modal.
 * @param specialContent - Could be used to render additional text or components.
 * @param content - Content text for the modal.
 * @param confirmationText - Text to confirm the action.
 * @param processContent - Content below text input ideally for some process.
 * @param isProcessing - Whether the action is processing.
 * @param onConfirm - Function to confirm the action.
 * @param placeholder - Placeholder text for the input field.
 */
const DeleteOrResetModal = ({
	type,
	header,
	specialContent,
	content,
	isOpen,
	onClose,
	confirmationText,
	processContent,
	isProcessing,
	onConfirm,
	placeholder,
}: DeleteOrResetModalProps) => {
	const [confirmText, setConfirmText] = useState<string>('');

	const onChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setConfirmText(e.target.value);
	}, []);

	const tryConfirm = () => {
		if (type === 'simple' || confirmationText === confirmText) {
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
					{specialContent}
					<Text className={classes.warningText}>{content}</Text>
					{type !== 'simple' && (
						<>
							<Text className={classes.confirmationText}>
								Please type <span className={classes.confirmationTextHighlight}>{`"${confirmationText}"`}</span> to
								confirm {type === 'delete' ? 'deletion' : 'reset'}.
							</Text>
							<TextInput value={confirmText} onChange={onChangeHandler} placeholder={placeholder} required />
						</>
					)}
					{processContent}
				</Stack>
				<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
					<Box>
						<Button variant="outline" onClick={closeModal}>
							Cancel
						</Button>
					</Box>
					<Box>
						<Button
							disabled={type !== 'simple' && (confirmationText !== confirmText || isProcessing)}
							onClick={tryConfirm}>
							{type === 'reset' ? 'Reset' : 'Delete'}
						</Button>
					</Box>
				</Stack>
			</Stack>
		</Modal>
	);
};

export default DeleteOrResetModal;
