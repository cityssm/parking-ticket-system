export declare const tryResetPassword: (userName: string, oldPasswordPlain: string, newPasswordPlain: string) => Promise<{
    success: boolean;
    message: string;
}>;
export default tryResetPassword;
