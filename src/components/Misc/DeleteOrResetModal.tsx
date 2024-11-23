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
 * @param type - Type of the modal, could be 'delete', 'reset' or 'simple'.
 * @param isOpen - Whether the modal is open.
 * @param onClose - Function to close the modal.
 * @param header - Header text for the modal.
 * @param specialContent - Could be used to render additional text or components.
 * @param content - Content text for the modal.
 * @param placeholder - Placeholder text for the input field.
 * @param confirmationText - Expected text to confirm the action.
 * @param actionProcessingContent - Content below text input ideally to show processing status or related information.
 * @param isActionInProgress - Whether the action is processing, to disable the confirm button.
 * @param onConfirm - Function to confirm the action.
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
					{actionProcessingContent}
				</Stack>
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
