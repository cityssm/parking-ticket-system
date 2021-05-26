import sqlite from "better-sqlite3";
import { usersDB as dbPath } from "../../data/databasePaths.js";
export const updateUserProperty = (reqBody) => {
    const db = sqlite(dbPath);
    let info;
    if (reqBody.propertyValue === "") {
        info = db.prepare("delete from UserProperties" +
            " where userName = ?" +
            " and propertyName = ?")
            .run(reqBody.userName, reqBody.propertyName);
    }
    else {
        info = db.prepare("replace into UserProperties" +
            " (userName, propertyName, propertyValue)" +
            " values (?, ?, ?)")
            .run(reqBody.userName, reqBody.propertyName, reqBody.propertyValue);
    }
    db.close();
    return info.changes;
};
export default updateUserProperty;
