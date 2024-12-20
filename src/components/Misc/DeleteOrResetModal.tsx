import { Box, Button, Modal, Stack, Text, TextInput } from '@mantine/core';
import classes from './styles/DeleteOrResetModal.module.css';
import { ChangeEvent, useCallback, useState } from 'react';

type BaseProps = {
	isModalOpen: boolean;
	onClose: () => void;
	modalHeader: string;
	specialContent?: React.ReactNode;
	modalContent: string;
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
 * @param isModalOpen - Controls whether the modal is visible.
 * @param onClose - Callback to close the modal and reset the state.
 * @param modalHeader - Header text displayed in the modal title.
 * @param specialContent - Optional content for additional context or customization.
 * @param modalContent - Main descriptive content of the modal.
 * @param placeholder - Input placeholder for confirmation text (applicable to 'delete' and 'reset').
 * @param confirmationText - Text required to confirm the action (applicable to 'delete' and 'reset').
 * @param actionProcessingContent - Optional content below text input for showing progress status or related information.
 * @param isActionInProgress - Disables the confirm button when action is in progress.
 * @param onConfirm - Callback function to be executed when the confirm button is clicked.
 */
const DeleteOrResetModal = ({
	type,
	isModalOpen,
	onClose,
	modalHeader,
	specialContent,
	modalContent,
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
			opened={isModalOpen}
			onClose={closeModal}
			size="auto"
			centered
			classNames={{
				body: classes.modalBody,
				header: classes.modalHeader,
			}}
			title={<Text className={classes.headerText}>{modalHeader}</Text>}>
			<Stack>
				<Stack gap={8}>
					{specialContent}
					<Text className={classes.warningText}>{modalContent}</Text>

					{/* Render confirmation field for 'delete' or 'reset' types */}
					{type !== 'simple' && (
						<>
							<Text className={classes.confirmationText}>
								Please type <span className={classes.confirmationTextHighlight}>{`"${confirmationText}"`}</span> to
								confirm {type === 'delete' ? 'deletion' : 'reset'}.
							</Text>
							<TextInput size="lg" value={confirmText} onChange={onChangeHandler} placeholder={placeholder} required />
						</>
					)}

					{/* Renders the action processing content if provided */}
					{actionProcessingContent}
				</Stack>

				{/* Action buttons */}
				<Stack className={classes.actionButtonsContainer}>
					<Box>
						<Button variant="outline" size="lg" onClick={closeModal}>
							Cancel
						</Button>
					</Box>
					<Box>
						{/* Disable the button if the confirmation text is not correct or the action is processing. */}
						<Button
							size="lg"
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
