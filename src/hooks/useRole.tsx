import { useMutation, useQuery, useQueryClient } from 'react-query';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';
import { notifyApi } from '@/utils/notification';
import { deleteRole, getDefaultRole, getRole, getRoles, putDeafultRole, putRole } from '@/api/roles';
import Cookies from 'js-cookie';

export const useRole = () => {
	const queryClient = useQueryClient();
	const username = Cookies.get('username');

	const {
		mutate: updateRoleMutation,
		isSuccess: updateRoleIsSuccess,
		isError: updateRoleIsError,
		isLoading: updateRoleIsLoading,
		data: updateRoleData,
	} = useMutation((data: { userName: string; privilege: object[] }) => putRole(data.userName, data.privilege), {
		onSuccess: () => {
			notifyApi({
				color: 'green',
				title: 'Role was udpated',
				message: 'Successfully updated',
				icon: <IconCheck size="1rem" />,
				autoClose: 8000,
			});
		},
		onError: () => {
			notifyApi(
				{
					color: 'red',
					title: 'Error occurred',
					message: 'Error occurred while updating role',
					icon: <IconFileAlert size="1rem" />,
					autoClose: 2000,
				},
				true,
			);
		},
	});

	const {
		mutate: deleteRoleMutation,
		isSuccess: deleteRoleIsSuccess,
		isError: deleteRoleIsError,
		isLoading: deleteRoleIsLoading,
	} = useMutation((data: { roleName: string }) => deleteRole(data.roleName), {
		onSuccess: () => {
			notifyApi({
				color: 'green',
				title: 'Role was deleted',
				message: 'Successfully Deleted',
				icon: <IconCheck size="1rem" />,
				autoClose: 8000,
			});
		},
		onError: () => {
			notifyApi(
				{
					color: 'red',
					title: 'Error occurred',
					message: 'Error occurred while deleting role',
					icon: <IconFileAlert size="1rem" />,
					autoClose: 2000,
				},
				true,
			);
			queryClient.invalidateQueries(['fetch-roles']);
		},
	});

	const {
		data: getRolesData,
		isError: getRolesIsError,
		isSuccess: getRolesIsSuccess,
		isLoading: getRolesIsLoading,
		refetch: getRolesRefetch,
	} = useQuery(['fetch-roles', username, updateRoleIsSuccess, deleteRoleIsSuccess], () => getRoles(), {
		onError: () => {
			notifyApi({
				color: 'red',
				message: 'Failed to get Roles',
				icon: <IconFileAlert size="1rem" />,
			});
		},
		onSuccess: () => {},
		retry: false,
		refetchOnWindowFocus: false,
	});

	const {
		data: getRoleData,
		isError: getRoleIsError,
		isSuccess: getRoleIsSuccess,
		isLoading: getRoleIsLoading,
		mutate: getRoleMutation,
	} = useMutation((data: { roleName: string }) => getRole(data?.roleName), {
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

	const {
		data: updateDefaultRoleData,
		isError: updateDefaultRoleIsError,
		isSuccess: updateDefaultRoleIsSuccess,
		isLoading: updateDefaultRoleIsLoading,
		mutate: updateDefaultRoleMutation,
	} = useMutation((data: { roleName: string }) => putDeafultRole(data?.roleName), {
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

	const {
		data: getDefaultRoleData,
		isError: getDefaultRoleIsError,
		isSuccess: getDefaultRoleIsSuccess,
		isLoading: getDefaultRoleIsLoading,
		mutate: getDefaultRoleMutation,
	} = useMutation(() => getDefaultRole(), {
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
		deleteRoleMutation,
		deleteRoleIsSuccess,
		deleteRoleIsError,
		deleteRoleIsLoading,
		updateRoleMutation,
		updateRoleIsSuccess,
		updateRoleIsError,
		updateRoleIsLoading,
		updateRoleData,
		getRolesRefetch,
		getRolesData,
		getRolesIsError,
		getRolesIsSuccess,
		getRolesIsLoading,
		getRoleMutation,
		getRoleData,
		getRoleIsError,
		getRoleIsSuccess,
		getRoleIsLoading,
		updateDefaultRoleMutation,
		updateDefaultRoleData,
		updateDefaultRoleIsError,
		updateDefaultRoleIsSuccess,
		updateDefaultRoleIsLoading,
		getDefaultRoleMutation,
		getDefaultRoleData,
		getDefaultRoleIsError,
		getDefaultRoleIsSuccess,
		getDefaultRoleIsLoading,
	};
};
