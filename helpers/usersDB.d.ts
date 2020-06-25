import type { User, UserProperties } from "./ptsTypes";
export declare const getUser: (userNameSubmitted: string, passwordPlain: string) => User;
export declare const tryResetPassword: (userName: string, oldPasswordPlain: string, newPasswordPlain: string) => {
    success: boolean;
    message: string;
};
export declare const getAllUsers: () => User[];
export declare const getUserProperties: (userName: string) => UserProperties;
export declare const createUser: (reqBody: {
    userName: string;
    lastName: string;
    firstName: string;
}) => string | false;
export declare const updateUser: (reqBody: {
    userName: string;
    lastName: string;
    firstName: string;
}) => number;
export declare const updateUserProperty: (reqBody: {
    userName: string;
    propertyName: string;
    propertyValue: string;
}) => number;
export declare const generateNewPassword: (userName: string) => string;
export declare const inactivateUser: (userName: string) => number;
