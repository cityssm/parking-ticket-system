import type { User, UserProperties } from "./ptsTypes";
export declare function getUser(userNameSubmitted: string, passwordPlain: string): User;
export declare function tryResetPassword(userName: string, oldPasswordPlain: string, newPasswordPlain: string): {
    success: boolean;
    message: string;
};
export declare function getAllUsers(): User[];
export declare function getUserProperties(userName: string): UserProperties;
export declare function createUser(reqBody: any): string | false;
export declare function updateUser(reqBody: any): number;
export declare function updateUserProperty(reqBody: any): number;
export declare function generateNewPassword(userName: string): string;
export declare function inactivateUser(userName: string): number;
