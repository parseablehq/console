import { Axios } from "./axios";
import { ROLE_URL, ROLES_LIST_URL } from "./constants";

export const getRoles = () => {
    return Axios().get(ROLES_LIST_URL);
}

export const deleteRole = (roleName: string) => {
    return Axios().delete(ROLE_URL(roleName));
}

export const putRole = (roleName: string, privilege: object[]) => {
    return Axios().put(ROLE_URL(roleName), privilege);
}

export const getRole = (roleName: string) => {
    return Axios().get(ROLE_URL(roleName));
}