import { Axios } from "./axios";
import { USERS_LIST_URL, USER_ROLES_URL, USER_URL } from "./constants";

export const getUsers = () => {
    return Axios().get(USERS_LIST_URL);
}

export const putUser = (username: string, roles?: object[]) => {
    return Axios().put(USER_URL(username), roles );
}

export const deleteUser = (username: string) => {
    return Axios().delete(USER_URL(username));
}

export const putUserRoles = (username: string, roles: object[]) => {
    return Axios().put(USER_ROLES_URL(username), roles);
}

export const getUserRoles = (username: string) => {
    return Axios().get(USER_ROLES_URL(username));
}