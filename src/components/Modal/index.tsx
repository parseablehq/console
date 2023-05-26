import { Modal as MantineModal, useMantineTheme } from '@mantine/core';
import type { ModalProps as MantineModalProps } from '@mantine/core';
import type { FC } from 'react';

const Modal: FC<MantineModalProps> = (props) => {
	const { children, ...rest } = props;

	const { colors } = useMantineTheme();

	return (
		<MantineModal
			{...rest}
			overlayProps={{
				color: colors.dimmed[0],
				opacity: 0.55,
				blur: 3,
			}}>
			{children}
		</MantineModal>
	);
};

export default Modal;
