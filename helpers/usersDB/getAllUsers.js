import sqlite from "better-sqlite3";
import { usersDB as databasePath } from "../../data/databasePaths.js";
export const getAllUsers = () => {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const rows = database.prepare("select userName, firstName, lastName" +
        " from Users" +
        " where isActive = 1" +
        " order by userName")
        .all();
    database.close();
    return rows;
};
export default getAllUsers;
