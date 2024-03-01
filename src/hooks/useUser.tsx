import { useMutation, useQuery } from 'react-query';
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
	} = useMutation(
		(data: { userName: string; roles: object[]; onSuccess?: () => void }) => postUser(data.userName, data.roles),
		{
			onError: (data: AxiosError) => {
				if (isAxiosError(data) && data.response) {
					const error = data.response.data as string;
					setCreateUserError(error);
				}
			},
			onSuccess: (_data, variables) => {
				variables.onSuccess && variables.onSuccess();
			},
		},
	);

	const {
		mutate: deleteUserMutation,
		isSuccess: deleteUserIsSuccess,
		isError: deleteUserIsError,
		isLoading: deleteUserIsLoading,
		data: deleteUserData,
	} = useMutation((data: { userName: string, onSuccess?: () => void; }) => deleteUser(data.userName), {
		onSuccess: (_data, variables) => {
			variables.onSuccess && variables.onSuccess();
		},
	});

	const {
		mutate: updateUserMutation,
		isSuccess: updateUserIsSuccess,
		isError: updateUserIsError,
		isLoading: updateUserIsLoading,
		data: udpateUserData,
	} = useMutation((data: { userName: string; roles: string[] }) => putUserRoles(data.userName, data.roles), {});

	const {
		mutate: updateUserPasswordMutation,
		isSuccess: updateUserPasswordIsSuccess,
		isError: updateUserPasswordIsError,
		isLoading: updateUserPasswordIsLoading,
		data: udpateUserPasswordData,
	} = useMutation((data: { userName: string }) => postUserResetPassword(data.userName), {
		onError: (data: AxiosError) => {
			if (isAxiosError(data) && data.response) {
				const error = data.response.data as string;
				setResetPasswordError(error);
			}
		},
	});

	const {
		data: getUserRolesData,
		isError: getUserRolesIsError,
		isSuccess: getUserRolesIsSuccess,
		isLoading: getUserRolesIsLoading,
		mutate: getUserRolesMutation,
	} = useMutation((data: { userName: string }) => getUserRoles(data?.userName), {
		retry: false,
	});

	return {
		createUserMutation,
		createUserIsSuccess,
		createUserIsError,
		createUserIsLoading,
		createUserData,
		createUserReset,
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

export const useGetUser = () => {
	const {
		data: getUserData,
		isError: getUserIsError,
		isSuccess: getUserIsSuccess,
		isLoading: getUserIsLoading,
		refetch: getUserRefetch,
	} = useQuery(['fetch-user'], () => getUsers(), {
		retry: false,
		refetchOnWindowFocus: false
	});
	return {
		getUserRefetch,
		getUserData,
		getUserIsError,
		getUserIsSuccess,
		getUserIsLoading,
	};
};
