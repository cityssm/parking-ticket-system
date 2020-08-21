import * as sqlite from "better-sqlite3";

import * as bcrypt from "bcrypt";

import * as stringFns from "@cityssm/expressjs-server-js/stringFns";
import * as userFns from "../userFns";

import { usersDB as dbPath } from "../../data/databasePaths";


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
