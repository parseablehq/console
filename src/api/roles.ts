import { Axios } from './axios';
import { DEFAULT_ROLE_URL, ROLE_URL, ROLES_LIST_URL } from './constants';

export const getRoles = () => {
	return Axios().get(ROLES_LIST_URL);
};

export const deleteRole = (roleName: string) => {
	return Axios().delete(ROLE_URL(roleName));
};

export const putRole = (roleName: string, privilege: object[]) => {
	return Axios().put(ROLE_URL(roleName), privilege);
};

export const getRole = (roleName: string) => {
	return Axios().get(ROLE_URL(roleName));
};

export const putDeafultRole = (roleName: string) => {
	return Axios().put(DEFAULT_ROLE_URL, roleName, { headers: { 'Content-Type': 'application/json' } });
};

export const getDefaultRole = () => {
	return Axios().get(DEFAULT_ROLE_URL);
};
