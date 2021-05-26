import sqlite from "better-sqlite3";
import { usersDB as dbPath } from "../../data/databasePaths.js";
export const getAllUsers = () => {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const rows = db.prepare("select userName, firstName, lastName" +
        " from Users" +
        " where isActive = 1" +
        " order by userName")
        .all();
    db.close();
    return rows;
};
export default getAllUsers;
