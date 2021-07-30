export declare const createUser: (requestBody: {
    userName: string;
    lastName: string;
    firstName: string;
}) => Promise<string | boolean>;
export default createUser;
