import sqlite from "better-sqlite3";
import { usersDB as databasePath } from "../../data/databasePaths.js";
export const inactivateUser = (userName) => {
    const database = sqlite(databasePath);
    const info = database.prepare("update Users" +
        " set isActive = 0" +
        " where userName = ?" +
        " and isActive = 1")
        .run(userName);
    database.close();
    return info.changes > 0;
};
export default inactivateUser;
