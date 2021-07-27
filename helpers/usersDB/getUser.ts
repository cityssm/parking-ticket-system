import sqlite from "better-sqlite3";

import bcrypt from "bcrypt";

import * as configFunctions from "../functions.config.js";
import { usersDB as dbPath } from "../../data/databasePaths.js";

import type { User, UserProperties } from "../../types/recordTypes.js";


export const getUser = (userNameSubmitted: string, passwordPlain: string): User => {

  const db = sqlite(dbPath);

  // Check if an active user exists

  const row: {
    userName: string;
    passwordHash: string;
    isActive: boolean;
  } = db.prepare("select userName, passwordHash, isActive" +
    " from Users" +
    " where userName = ?")
    .get(userNameSubmitted);

  if (!row) {

    db.close();

    if (userNameSubmitted === "admin") {

      const adminPasswordPlain = configFunctions.getProperty("admin.defaultPassword");

      if (adminPasswordPlain === "") {
        return null;
      }

      if (adminPasswordPlain === passwordPlain) {

        const userProperties: UserProperties = Object.assign({}, configFunctions.getProperty("user.defaultProperties"));
        userProperties.isAdmin = true;
        userProperties.isDefaultAdmin = true;

        return {
          userName: userNameSubmitted,
          userProperties
        };
      }
    }

    return null;

  } else if (!row.isActive) {

    db.close();
    return null;
  }

  // Check if the password matches

  const databaseUserName = row.userName;

  let passwordIsValid = false;

  if (bcrypt.compareSync(databaseUserName + "::" + passwordPlain, row.passwordHash)) {
    passwordIsValid = true;
  }

  if (!passwordIsValid) {
    db.close();
    return null;
  }

  // Get user properties

  const userProperties: UserProperties =
    Object.assign({}, configFunctions.getProperty("user.defaultProperties"));

  userProperties.isDefaultAdmin = false;

  const userPropertyRows = db.prepare("select propertyName, propertyValue" +
    " from UserProperties" +
    " where userName = ?")
    .all(databaseUserName);

  for (const userProperty of userPropertyRows) {

    const propertyName: string = userProperty.propertyName;
    const propertyValue: string = userProperty.propertyValue;

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


export default getUser;
