import sqlite from "better-sqlite3";
import * as configFns from "../configFns.js";
import { usersDB as dbPath } from "../../data/databasePaths.js";
export const getUserProperties = (userName) => {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const userProperties = Object.assign({}, configFns.getProperty("user.defaultProperties"));
    const userPropertyRows = db.prepare("select propertyName, propertyValue" +
        " from UserProperties" +
        " where userName = ?")
        .all(userName);
    for (const userProperty of userPropertyRows) {
        userProperties[userProperty.propertyName] = (userProperty.propertyValue === "true");
    }
    db.close();
    return userProperties;
};
export default getUserProperties;
