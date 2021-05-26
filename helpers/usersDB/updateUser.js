import sqlite from "better-sqlite3";
import { usersDB as dbPath } from "../../data/databasePaths.js";
export const updateUser = (reqBody) => {
    const db = sqlite(dbPath);
    const info = db.prepare("update Users" +
        " set firstName = ?," +
        " lastName = ?" +
        " where userName = ?" +
        " and isActive = 1")
        .run(reqBody.firstName, reqBody.lastName, reqBody.userName);
    db.close();
    return info.changes;
};
export default updateUser;
