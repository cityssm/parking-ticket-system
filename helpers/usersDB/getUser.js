"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const sqlite = require("better-sqlite3");
const bcrypt = require("bcrypt");
const configFns = require("../configFns");
const databasePaths_1 = require("../../data/databasePaths");
exports.getUser = (userNameSubmitted, passwordPlain) => {
    const db = sqlite(databasePaths_1.usersDB);
    const row = db.prepare("select userName, passwordHash, isActive" +
        " from Users" +
        " where userName = ?")
        .get(userNameSubmitted);
    if (!row) {
        db.close();
        if (userNameSubmitted === "admin") {
            const adminPasswordPlain = configFns.getProperty("admin.defaultPassword");
            if (adminPasswordPlain === "") {
                return null;
            }
            if (adminPasswordPlain === passwordPlain) {
                const userProperties = Object.assign({}, configFns.getProperty("user.defaultProperties"));
                userProperties.isAdmin = true;
                userProperties.isDefaultAdmin = true;
                return {
                    userName: userNameSubmitted,
                    userProperties
                };
            }
        }
        return null;
    }
    else if (!row.isActive) {
        db.close();
        return null;
    }
    const databaseUserName = row.userName;
    let passwordIsValid = false;
    if (bcrypt.compareSync(databaseUserName + "::" + passwordPlain, row.passwordHash)) {
        passwordIsValid = true;
    }
    if (!passwordIsValid) {
        db.close();
        return null;
    }
    const userProperties = Object.assign({}, configFns.getProperty("user.defaultProperties"));
    userProperties.isDefaultAdmin = false;
    const userPropertyRows = db.prepare("select propertyName, propertyValue" +
        " from UserProperties" +
        " where userName = ?")
        .all(databaseUserName);
    for (const userProperty of userPropertyRows) {
        const propertyName = userProperty.propertyName;
        const propertyValue = userProperty.propertyValue;
        switch (propertyName) {
            case "canCreate":
            case "canUpdate":
            case "isAdmin":
            case "isOperator":
                userProperties[propertyName] = (propertyValue === "true");
                break;
            default:
                userProperties[propertyName] = propertyValue;
                break;
        }
    }
    db.close();
    return {
        userName: databaseUserName,
        userProperties
    };
};
