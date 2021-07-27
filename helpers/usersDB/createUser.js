import sqlite from "better-sqlite3";
import bcrypt from "bcrypt";
import * as stringFns from "@cityssm/expressjs-server-js/stringFns.js";
import * as userFunctions from "../functions.user.js";
import { usersDB as dbPath } from "../../data/databasePaths.js";
export const createUser = (reqBody) => {
    const newPasswordPlain = stringFns.generatePassword();
    const hash = bcrypt.hashSync(userFunctions.getHashString(reqBody.userName, newPasswordPlain), 10);
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
};
export default createUser;
