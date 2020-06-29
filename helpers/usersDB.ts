import * as sqlite from "better-sqlite3";

import * as bcrypt from "bcrypt";

import * as stringFns from "@cityssm/expressjs-server-js/stringFns";
import * as configFns from "./configFns";
import type { User, UserProperties } from "./ptsTypes";

const dbPath = "data/users.db";


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

  if (row == null) {

    db.close();

    if (userNameSubmitted === "admin") {

      const adminPasswordPlain = configFns.getProperty("admin.defaultPassword");

      if (adminPasswordPlain === "") {
        return null;
      }

      if (adminPasswordPlain === passwordPlain) {

        const userProperties: UserProperties = Object.assign({}, configFns.getProperty("user.defaultProperties"));
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
    Object.assign({}, configFns.getProperty("user.defaultProperties"));

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

export const tryResetPassword = (userName: string, oldPasswordPlain: string, newPasswordPlain: string) => {

  const db = sqlite(dbPath);

  const row = db.prepare("select passwordHash from Users" +
    " where userName = ?" +
    " and isActive = 1")
    .get(userName);

  if (row == null) {

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
};

export const getAllUsers = () => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: User[] =
    db.prepare("select userName, firstName, lastName" +
      " from Users" +
      " where isActive = 1" +
      " order by userName")
      .all();

  db.close();

  return rows;
};

export const getUserProperties = (userName: string) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const userProperties: UserProperties =
    Object.assign({}, configFns.getProperty("user.defaultProperties"));

  const userPropertyRows = db.prepare("select propertyName, propertyValue" +
    " from UserProperties" +
    " where userName = ?")
    .all(userName);

  for (const userProperty of userPropertyRows) {
    userProperties[userProperty.propertyName] = userProperty.propertyValue;
  }

  db.close();

  return userProperties;
};

export const createUser = (reqBody: {
  userName: string;
  lastName: string;
  firstName: string;
}) => {

  const newPasswordPlain = stringFns.generatePassword();
  const hash = bcrypt.hashSync(reqBody.userName + "::" + newPasswordPlain, 10);

  const db = sqlite(dbPath);

  const row: {
    isActive: boolean;
  } = db.prepare("select isActive" +
    " from Users" +
    " where userName = ?")
    .get(reqBody.userName);

  if (row != null) {

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

  } else {

    db.prepare("insert into Users" +
      " (userName, firstName, lastName, isActive, passwordHash)" +
      " values (?, ?, ?, 1, ?)")
      .run(reqBody.userName, reqBody.firstName, reqBody.lastName, hash);

  }

  return newPasswordPlain;

};

export const updateUser = (reqBody: {
  userName: string;
  lastName: string;
  firstName: string;
}) => {

  const db = sqlite(dbPath);

  const info = db.prepare("update Users" +
    " set firstName = ?," +
    " lastName = ?" +
    " where userName = ?" +
    " and isActive = 1")
    .run(
      reqBody.firstName,
      reqBody.lastName,
      reqBody.userName
    );

  db.close();

  return info.changes;
};

export const updateUserProperty = (reqBody: {
  userName: string;
  propertyName: string;
  propertyValue: string;
}) => {

  const db = sqlite(dbPath);

  let info: sqlite.RunResult;

  if (reqBody.propertyValue === "") {

    info = db.prepare("delete from UserProperties" +
      " where userName = ?" +
      " and propertyName = ?")
      .run(
        reqBody.userName,
        reqBody.propertyName
      );

  } else {

    info = db.prepare("replace into UserProperties" +
      " (userName, propertyName, propertyValue)" +
      " values (?, ?, ?)")
      .run(
        reqBody.userName,
        reqBody.propertyName,
        reqBody.propertyValue
      );

  }

  db.close();

  return info.changes;
};

export const generateNewPassword = (userName: string) => {

  const newPasswordPlain: string = stringFns.generatePassword();
  const hash = bcrypt.hashSync(userName + "::" + newPasswordPlain, 10);

  const db = sqlite(dbPath);

  db.prepare("update Users" +
    " set passwordHash = ?" +
    " where userName = ?")
    .run(hash, userName);

  db.close();

  return newPasswordPlain;
};

export const inactivateUser = (userName: string) => {

  const db = sqlite(dbPath);

  const info = db.prepare("update Users" +
    " set isActive = 0" +
    " where userName = ?" +
    " and isActive = 1")
    .run(userName);

  db.close();

  return info.changes;
};
