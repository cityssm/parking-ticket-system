"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite = require("better-sqlite3");
const dbPath = "data/users.db";
const bcrypt = require("bcrypt");
const stringFns = require("./stringFns");
const configFns = require("./configFns");
function getUser(userNameSubmitted, passwordPlain) {
    const db = sqlite(dbPath);
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
                    userProperties: userProperties
                };
            }
        }
        return null;
    }
    else if (row.isActive === 0) {
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
    for (let userPropertyIndex = 0; userPropertyIndex < userPropertyRows.length; userPropertyIndex += 1) {
        const propertyName = userPropertyRows[userPropertyIndex].propertyName;
        const propertyValue = userPropertyRows[userPropertyIndex].propertyValue;
        switch (propertyName) {
            case "canCreate":
            case "canUpdate":
            case "isAdmin":
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
        userProperties: userProperties
    };
}
exports.getUser = getUser;
function tryResetPassword(userName, oldPasswordPlain, newPasswordPlain) {
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
    const oldPasswordMatches = bcrypt.compareSync(userName + "::" + oldPasswordPlain, row.passwordHash);
    if (!oldPasswordMatches) {
        db.close();
        return {
            success: false,
            message: "Old password does not match."
        };
    }
    const newPasswordHash = bcrypt.hashSync(userName + "::" + newPasswordPlain, 10);
    db.prepare("update Users" +
        " set passwordHash = ?" +
        " where userName = ?")
        .run(newPasswordHash, userName);
    db.close();
    return {
        success: true,
        message: "Password updated successfully."
    };
}
exports.tryResetPassword = tryResetPassword;
function getAllUsers() {
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
}
exports.getAllUsers = getAllUsers;
function getUserProperties(userName) {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const userProperties = Object.assign({}, configFns.getProperty("user.defaultProperties"));
    const userPropertyRows = db.prepare("select propertyName, propertyValue" +
        " from UserProperties" +
        " where userName = ?")
        .all(userName);
    for (let userPropertyIndex = 0; userPropertyIndex < userPropertyRows.length; userPropertyIndex += 1) {
        userProperties[userPropertyRows[userPropertyIndex].propertyName] =
            userPropertyRows[userPropertyIndex].propertyValue;
    }
    db.close();
    return userProperties;
}
exports.getUserProperties = getUserProperties;
function createUser(reqBody) {
    const newPasswordPlain = stringFns.generatePassword();
    const hash = bcrypt.hashSync(reqBody.userName + "::" + newPasswordPlain, 10);
    const db = sqlite(dbPath);
    const row = db.prepare("select isActive" +
        " from Users" +
        " where userName = ?")
        .get(reqBody.userName);
    if (row) {
        if (row.isActive) {
            db.close();
            return false;
        }
        db.prepare("update Users" +
            " set firstName = ?," +
            " lastName = ?," +
            " passwordHash = ?," +
            " isActive = 1" +
            " where userName = ?")
            .run(reqBody.firstName, reqBody.lastName, hash, reqBody.userName);
        db.prepare("delete from UserProperties" +
            " where userName = ?")
            .run(reqBody.userName);
    }
    else {
        db.prepare("insert into Users" +
            " (userName, firstName, lastName, isActive, passwordHash)" +
            " values (?, ?, ?, 1, ?)")
            .run(reqBody.userName, reqBody.firstName, reqBody.lastName, hash);
    }
    return newPasswordPlain;
}
exports.createUser = createUser;
function updateUser(reqBody) {
    const db = sqlite(dbPath);
    const info = db.prepare("update Users" +
        " set firstName = ?," +
        " lastName = ?" +
        " where userName = ?" +
        " and isActive = 1")
        .run(reqBody.firstName, reqBody.lastName, reqBody.userName);
    db.close();
    return info.changes;
}
exports.updateUser = updateUser;
function updateUserProperty(reqBody) {
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
}
exports.updateUserProperty = updateUserProperty;
function generateNewPassword(userName) {
    const newPasswordPlain = stringFns.generatePassword();
    const hash = bcrypt.hashSync(userName + "::" + newPasswordPlain, 10);
    const db = sqlite(dbPath);
    db.prepare("update Users" +
        " set passwordHash = ?" +
        " where userName = ?")
        .run(hash, userName);
    db.close();
    return newPasswordPlain;
}
exports.generateNewPassword = generateNewPassword;
function inactivateUser(userName) {
    const db = sqlite(dbPath);
    const info = db.prepare("update Users" +
        " set isActive = 0" +
        " where userName = ?" +
        " and isActive = 1")
        .run(userName);
    db.close();
    return info.changes;
}
exports.inactivateUser = inactivateUser;
