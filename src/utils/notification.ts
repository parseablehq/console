import type { NotificationProps } from '@mantine/notifications';
import { showNotification } from '@mantine/notifications';

export const notifyError = (payload?: Partial<NotificationProps>) => {
	const title = ['string', 'undefined'].includes(typeof payload?.title) ? payload?.title : 'Oops!';
	const message = payload?.message || 'Something went wrong!.';
	const color = payload?.color || 'red';
	const autoClose = payload?.autoClose || 6000;
	showNotification({
		...payload,
		title,
		message,
		color,
		autoClose,
	});
};

export const notify = (payload: NotificationProps) => {
	const color = payload.color || 'green';
	const autoClose = payload.autoClose || 6000;
	showNotification({
		...payload,
		color,
		autoClose,
	});
};

export const notifyApi = (payload: NotificationProps, customTitle: boolean = true) => {
	const autoClose = payload.autoClose ?? 3000;
	const title = customTitle && payload.color === 'green' ? 'Success' : 'Error';

	showNotification({
		...payload,
		autoClose,
		title,
	});
};
