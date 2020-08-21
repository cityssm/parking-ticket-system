"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const sqlite = require("better-sqlite3");
const bcrypt = require("bcrypt");
const stringFns = require("@cityssm/expressjs-server-js/stringFns");
const userFns = require("../userFns");
const databasePaths_1 = require("../../data/databasePaths");
exports.createUser = (reqBody) => {
    const newPasswordPlain = stringFns.generatePassword();
    const hash = bcrypt.hashSync(userFns.getHashString(reqBody.userName, newPasswordPlain), 10);
    const db = sqlite(databasePaths_1.usersDB);
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
};
