import sqlite from "better-sqlite3";
import bcrypt from "bcrypt";
import * as userFunctions from "../functions.user.js";
import { usersDB as databasePath } from "../../data/databasePaths.js";
export const tryResetPassword = async (userName, oldPasswordPlain, newPasswordPlain) => {
    const database = sqlite(databasePath);
    const row = database.prepare("select passwordHash from Users" +
        " where userName = ?" +
        " and isActive = 1")
        .get(userName);
    if (!row) {
        database.close();
        return {
            success: false,
            message: "User record not found."
        };
    }
    const oldPasswordMatches = await bcrypt.compare(userFunctions.getHashString(userName, oldPasswordPlain), row.passwordHash);
    if (!oldPasswordMatches) {
        database.close();
        return {
            success: false,
            message: "Old password does not match."
        };
    }
    const newPasswordHash = await bcrypt.hash(userFunctions.getHashString(userName, newPasswordPlain), 10);
    database.prepare("update Users" +
        " set passwordHash = ?" +
        " where userName = ?")
        .run(newPasswordHash, userName);
    database.close();
    return {
        success: true,
        message: "Password updated successfully."
    };
};
export default tryResetPassword;
