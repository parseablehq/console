import type { NotificationData } from '@mantine/notifications';
import { showNotification } from '@mantine/notifications';

export const notifyError = (payload?: Partial<NotificationData>) => {
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

export const notify = (payload: NotificationData) => {
	const color = payload.color || 'green';
	const autoClose = payload.autoClose || 6000;
	showNotification({
		...payload,
		color,
		autoClose,
	});
};
