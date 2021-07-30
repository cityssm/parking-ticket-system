import sqlite from "better-sqlite3";
import { usersDB as databasePath } from "../../data/databasePaths.js";
export const updateUser = (requestBody) => {
    const database = sqlite(databasePath);
    const info = database.prepare("update Users" +
        " set firstName = ?," +
        " lastName = ?" +
        " where userName = ?" +
        " and isActive = 1")
        .run(requestBody.firstName, requestBody.lastName, requestBody.userName);
    database.close();
    return info.changes > 0;
};
export default updateUser;
