import * as configFunctions from "./functions.config.js";
import ActiveDirectory from "activedirectory2";
const userDomain = configFunctions.getProperty("application.userDomain");
const activeDirectoryConfig = configFunctions.getProperty("activeDirectory");
const authenticateViaActiveDirectory = async (userName, password) => {
    return new Promise((resolve) => {
        try {
            const ad = new ActiveDirectory(activeDirectoryConfig);
            ad.authenticate(userDomain + "\\" + userName, password, async (error, auth) => {
                if (error) {
                    resolve(false);
                }
                resolve(auth);
            });
        }
        catch {
            resolve(false);
        }
    });
};
export const authenticate = async (userName, password) => {
    if (!userName || userName === "" || !password || password === "") {
        return false;
    }
    return await authenticateViaActiveDirectory(userName, password);
};
