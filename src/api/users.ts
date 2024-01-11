import { Axios } from './axios';
import { USERS_LIST_URL, USER_PASSWORD_URL, USER_ROLES_URL, USER_URL } from './constants';

export const getUsers = () => {
	return Axios().get(USERS_LIST_URL);
};

export const postUser = (username: string, roles?: object[]) => {
	return Axios().post(USER_URL(username), roles);
};

export const deleteUser = (username: string) => {
	return Axios().delete(USER_URL(username));
};

export const putUserRoles = (username: string, roles: string[]) => {
	return Axios().put(USER_ROLES_URL(username), roles);
};

export const getUserRoles = (username: string) => {
	return Axios().get(USER_ROLES_URL(username));
};

export const postUserResetPassword = (username: string) => {
	return Axios().post(USER_PASSWORD_URL(username));
};
