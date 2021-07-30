import type { User } from "../../types/recordTypes.js";
export declare const getUser: (userNameSubmitted: string, passwordPlain: string) => Promise<User>;
export default getUser;
