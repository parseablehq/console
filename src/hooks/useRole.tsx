import { useMutation, useQuery, useQueryClient } from 'react-query';
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
	} = useMutation((data: { userName: string; privilege: object[] }) => putRole(data.userName, data.privilege), {});

	const {
		mutate: deleteRoleMutation,
		isSuccess: deleteRoleIsSuccess,
		isError: deleteRoleIsError,
		isLoading: deleteRoleIsLoading,
	} = useMutation((data: { roleName: string }) => deleteRole(data.roleName), {
		onError: () => {
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
		retry: false,
	});

	const {
		data: updateDefaultRoleData,
		isError: updateDefaultRoleIsError,
		isSuccess: updateDefaultRoleIsSuccess,
		isLoading: updateDefaultRoleIsLoading,
		mutate: updateDefaultRoleMutation,
	} = useMutation((data: { roleName: string }) => putDeafultRole(data?.roleName), {
		retry: false,
	});

	const {
		data: getDefaultRoleData,
		isError: getDefaultRoleIsError,
		isSuccess: getDefaultRoleIsSuccess,
		isLoading: getDefaultRoleIsLoading,
		mutate: getDefaultRoleMutation,
	} = useMutation(() => getDefaultRole(), {
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
