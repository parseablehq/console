import { useMutation, useQuery } from 'react-query';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';
import { notifyApi } from '@/utils/notification';
import { deleteUser, getUserRoles, getUsers, postUser, postUserResetPassword, putUserRoles } from '@/api/users';
import { isAxiosError, AxiosError } from 'axios';
import useMountedState from './useMountedState';

export const useUser = () => {
	const [resetPasswordError, setResetPasswordError] = useMountedState<string>('');
	const [createUserError, setCreateUserError] = useMountedState<string>('');

	const {
		mutate: createUserMutation,
		isSuccess: createUserIsSuccess,
		isError: createUserIsError,
		isLoading: createUserIsLoading,
		data: createUserData,
		reset: createUserReset,
	} = useMutation((data: { userName: string; roles: object[] }) => postUser(data.userName, data.roles), {
		onSuccess: () => {
			notifyApi({
				color: 'green',
				title: 'User was created',
				message: 'Successfully created',
				icon: <IconCheck size="1rem" />,
				autoClose: 3000,
			});
		},
		onError: (data: AxiosError) => {
			if (isAxiosError(data) && data.response) {
				const error = data.response.data as string;
				setCreateUserError(error);
				notifyApi(
					{
						color: 'red',
						title: 'Error occurred',
						message: `${error}`,
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
					},
					true,
				);
			}
		},
	});

	const {
		mutate: deleteUserMutation,
		isSuccess: deleteUserIsSuccess,
		isError: deleteUserIsError,
		isLoading: deleteUserIsLoading,
		data: deleteUserData,
	} = useMutation((data: { userName: string }) => deleteUser(data.userName), {
		onSuccess: () => {
			notifyApi({
				color: 'green',
				title: 'User was deleted',
				message: 'Successfully deleted',
				icon: <IconCheck size="1rem" />,
				autoClose: 3000,
			});
		},
		onError: () => {
			notifyApi(
				{
					color: 'red',
					title: 'Error occurred',
					message: 'Error occurred while deleting user',
					icon: <IconFileAlert size="1rem" />,
					autoClose: 2000,
				},
				true,
			);
		},
	});

	const {
		mutate: updateUserMutation,
		isSuccess: updateUserIsSuccess,
		isError: updateUserIsError,
		isLoading: updateUserIsLoading,
		data: udpateUserData,
	} = useMutation((data: { userName: string; roles: string[] }) => putUserRoles(data.userName, data.roles), {
		onSuccess: () => {
			notifyApi({
				color: 'green',
				title: 'User was updated',
				message: 'Successfully updated',
				icon: <IconCheck size="1rem" />,
				autoClose: 3000,
			});
		},
		onError: (data: AxiosError) => {
			if (isAxiosError(data) && data.response) {
				const error = data.response.data;
				notifyApi(
					{
						color: 'red',
						title: 'Error occurred',
						message: `${error}`,
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
					},
					true,
				);
			}
		},
	});

	const {
		mutate: updateUserPasswordMutation,
		isSuccess: updateUserPasswordIsSuccess,
		isError: updateUserPasswordIsError,
		isLoading: updateUserPasswordIsLoading,
		data: udpateUserPasswordData,
	} = useMutation((data: { userName: string }) => postUserResetPassword(data.userName), {
		onSuccess: () => {
			notifyApi({
				color: 'green',
				title: 'Password was Changed',
				message: 'Successfully Changed',
				icon: <IconCheck size="1rem" />,
				autoClose: 3000,
			});
		},
		onError: (data: AxiosError) => {
			if (isAxiosError(data) && data.response) {
				const error = data.response.data as string;
				setResetPasswordError(error);
				notifyApi(
					{
						color: 'red',
						title: 'Error occurred',
						message: `${error}`,
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
					},
					true,
				);
			}
		},
	});

	const {
		data: getUserData,
		isError: getUserIsError,
		isSuccess: getUserIsSuccess,
		isLoading: getUserIsLoading,
		refetch: getUserRefetch,
	} = useQuery(['fetch-user', createUserIsSuccess, deleteUserIsSuccess], () => getUsers(), {
		onError: () => {
			notifyApi({
				color: 'red',
				message: 'Failed to get user',
				icon: <IconFileAlert size="1rem" />,
			});
		},
		onSuccess: () => {},
		retry: false,
	});

	const {
		data: getUserRolesData,
		isError: getUserRolesIsError,
		isSuccess: getUserRolesIsSuccess,
		isLoading: getUserRolesIsLoading,
		mutate: getUserRolesMutation,
	} = useMutation((data: { userName: string }) => getUserRoles(data?.userName), {
		onError: () => {
			notifyApi({
				color: 'red',
				message: 'Failed to get Roles',
				icon: <IconFileAlert size="1rem" />,
			});
		},
		onSuccess: () => {},
		retry: false,
	});

	return {
		createUserMutation,
		createUserIsSuccess,
		createUserIsError,
		createUserIsLoading,
		createUserData,
		createUserReset,
		getUserRefetch,
		getUserData,
		getUserIsError,
		getUserIsSuccess,
		getUserIsLoading,
		deleteUserMutation,
		deleteUserIsSuccess,
		deleteUserIsError,
		deleteUserIsLoading,
		deleteUserData,
		updateUserMutation,
		updateUserIsSuccess,
		updateUserIsError,
		updateUserIsLoading,
		udpateUserData,
		getUserRolesMutation,
		getUserRolesData,
		getUserRolesIsError,
		getUserRolesIsSuccess,
		getUserRolesIsLoading,
		updateUserPasswordMutation,
		updateUserPasswordIsSuccess,
		updateUserPasswordIsError,
		updateUserPasswordIsLoading,
		udpateUserPasswordData,
		resetPasswordError,
		createUserError,
	};
};
