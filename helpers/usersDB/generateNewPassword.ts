import sqlite from "better-sqlite3";

import bcrypt from "bcrypt";

import * as stringFns from "@cityssm/expressjs-server-js/stringFns.js";
import * as userFns from "../userFns.js";

import { usersDB as dbPath } from "../../data/databasePaths.js";


export const generateNewPassword = (userName: string) => {

  const newPasswordPlain: string = stringFns.generatePassword();
  const hash = bcrypt.hashSync(userFns.getHashString(userName, newPasswordPlain), 10);

  const db = sqlite(dbPath);

  db.prepare("update Users" +
    " set passwordHash = ?" +
    " where userName = ?")
    .run(hash, userName);

  db.close();

  return newPasswordPlain;
};


export default generateNewPassword;
