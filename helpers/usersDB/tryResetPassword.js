import sqlite from "better-sqlite3";
import bcrypt from "bcrypt";
import * as userFns from "../userFns.js";
import { usersDB as dbPath } from "../../data/databasePaths.js";
export const tryResetPassword = (userName, oldPasswordPlain, newPasswordPlain) => {
    const db = sqlite(dbPath);
    const row = db.prepare("select passwordHash from Users" +
        " where userName = ?" +
        " and isActive = 1")
        .get(userName);
    if (!row) {
        db.close();
        return {
            success: false,
            message: "User record not found."
        };
    }
    const oldPasswordMatches = bcrypt.compareSync(userFns.getHashString(userName, oldPasswordPlain), row.passwordHash);
    if (!oldPasswordMatches) {
        db.close();
        return {
            success: false,
            message: "Old password does not match."
        };
    }
    const newPasswordHash = bcrypt.hashSync(userFns.getHashString(userName, newPasswordPlain), 10);
    db.prepare("update Users" +
        " set passwordHash = ?" +
        " where userName = ?")
        .run(newPasswordHash, userName);
    db.close();
    return {
        success: true,
        message: "Password updated successfully."
    };
};
export default tryResetPassword;
