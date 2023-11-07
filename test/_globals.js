import { getConfigProperty } from '../helpers/functions.config.js';
export const testView = '*testView';
export const testUpdate = '*testUpdate';
export const testAdmin = '*testAdmin';
export const portNumber = 4000;
export const fakeViewOnlySession = {
    user: {
        userName: getConfigProperty('users.testing')[0],
        canUpdate: false,
        isAdmin: false,
        isOperator: false
    }
};
export const fakeAdminSession = {
    user: {
        userName: getConfigProperty('users.testing')[0],
        canUpdate: true,
        isAdmin: true,
        isOperator: true
    }
};
export const fakeViewOnlyRequest = {
    session: fakeViewOnlySession
};
export const fakeAdminRequest = {
    session: fakeAdminSession
};
