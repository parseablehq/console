import { Box, Button, Modal, Stack, Text, TextInput } from '@mantine/core';
import classes from './styles/DeleteOrResetModal.module.css';
import { ChangeEvent, useCallback, useState } from 'react';

type BaseProps = {
	isOpen: boolean;
	onClose: () => void;
	header: string;
	specialContent?: React.ReactNode;
	content: string;
	actionProcessingContent?: React.ReactNode;
	isActionInProgress?: boolean;
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
 * @param type - Specifies the type of modal ('simple', 'delete', or 'reset').
 * @param isOpen - Controls whether the modal is visible.
 * @param onClose - Callback to close the modal and reset the state.
 * @param header - Header text displayed in the modal title.
 * @param specialContent - Optional content for additional context or customization.
 * @param content - Main descriptive content of the modal.
 * @param placeholder - Input placeholder for confirmation text (applicable to 'delete' and 'reset').
 * @param confirmationText - Text required to confirm the action (applicable to 'delete' and 'reset').
 * @param actionProcessingContent - Optional content below text input for showing progress status or related information.
 * @param isActionInProgress - Disables the confirm button when action is in progress.
 * @param onConfirm - Callback function to be executed when the confirm button is clicked.
 */
const DeleteOrResetModal = ({
	type,
	isOpen,
	onClose,
	header,
	specialContent,
	content,
	placeholder,
	confirmationText,
	actionProcessingContent,
	isActionInProgress,
	onConfirm,
}: DeleteOrResetModalProps) => {
	const [confirmText, setConfirmText] = useState<string>('');

	// Handler for the confirmation input field
	const onChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setConfirmText(e.target.value);
	}, []);

	// Function to validate and trigger confirmation logic
	const tryConfirm = useCallback(() => {
		if (type === 'simple' || confirmationText === confirmText) {
			setConfirmText('');
			onConfirm();
		}
	}, [type, confirmationText, confirmText, onConfirm]);

	// Function to close the modal and reset the confirmation text state.
	const closeModal = useCallback(() => {
		setConfirmText('');
		onClose();
	}, [onClose]);

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

					{/* Render confirmation field for 'delete' or 'reset' types */}
					{type !== 'simple' && (
						<>
							<Text className={classes.confirmationText}>
								Please type <span className={classes.confirmationTextHighlight}>{`"${confirmationText}"`}</span> to
								confirm {type === 'delete' ? 'deletion' : 'reset'}.
							</Text>
							<TextInput value={confirmText} onChange={onChangeHandler} placeholder={placeholder} required />
						</>
					)}
					{actionProcessingContent}
				</Stack>

				{/* Action buttons */}
				<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
					<Box>
						<Button variant="outline" onClick={closeModal}>
							Cancel
						</Button>
					</Box>
					<Box>
						{/* Disable the button if the confirmation text is not correct or the action is processing. */}
						<Button
							disabled={(type !== 'simple' && confirmationText !== confirmText) || isActionInProgress}
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
