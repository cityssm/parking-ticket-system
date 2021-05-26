import * as assert from "assert";

import * as stringFns from "@cityssm/expressjs-server-js/stringFns.js";

import { userName } from "./_globals.js";

import { initializeDatabase } from "../helpers/usersDB/initializeDatabase.js";

import * as usersDB_getUser from "../helpers/usersDB/getUser.js";
import * as usersDB_createUser from "../helpers/usersDB/createUser.js";
import * as usersDB_generateNewPassword from "../helpers/usersDB/generateNewPassword.js";
import * as usersDB_tryResetPassword from "../helpers/usersDB/tryResetPassword.js";
import * as usersDB_getAllUsers from "../helpers/usersDB/getAllUsers.js";
import * as usersDB_updateUser from "../helpers/usersDB/updateUser.js";
import * as usersDB_updateUserProperty from "../helpers/usersDB/updateUserProperty.js";
import * as usersDB_getUserProperties from "../helpers/usersDB/getUserProperties.js";
import * as usersDB_inactivateUser from "../helpers/usersDB/inactivateUser.js";


describe("helpers/usersDB", () => {

  let password: string;

  before(() => {
    initializeDatabase();
    usersDB_inactivateUser.inactivateUser(userName);

    password = usersDB_createUser.createUser({
      userName,
      firstName: "Test",
      lastName: "User"
    }) as string;

    usersDB_updateUserProperty.updateUserProperty({
      userName,
      propertyName: "isOperator",
      propertyValue: "false"
    });

    usersDB_updateUserProperty.updateUserProperty({
      userName,
      propertyName: "isAdmin",
      propertyValue: "false"
    });

    usersDB_updateUserProperty.updateUserProperty({
      userName,
      propertyName: "canUpdate",
      propertyValue: "true"
    });

    usersDB_updateUserProperty.updateUserProperty({
      userName,
      propertyName: "canCreate",
      propertyValue: "true"
    });
  });

  after(() => {
    usersDB_inactivateUser.inactivateUser(userName);
  });

  it("should execute getUser() successfully", () => {
    assert.equal(usersDB_getUser.getUser(userName, password).userName, userName);
  });

  it("should execute getUser() unsuccessfully", () => {
    assert.equal(usersDB_getUser.getUser(userName, password + "_"), null);
  });

  it("should execute getAllUsers()", () => {
    assert.ok(usersDB_getAllUsers.getAllUsers().length > 0);
  });

  it("should execute updateUser()", () => {
    assert.ok(usersDB_updateUser.updateUser({
      userName,
      firstName: "Test",
      lastName: "Rename"
    }) > 0);
  });

  it("getUserProperties().canCreate => true", () => {
    assert.equal(usersDB_getUserProperties.getUserProperties(userName).canCreate, true);
  });

  it("getUserProperties().isAdmin   => false", () => {
    assert.equal(usersDB_getUserProperties.getUserProperties(userName).isAdmin, false);
  });

  it("should execute tryResetPassword() successfully", () => {
    const oldPassword = password;
    password = stringFns.generatePassword();

    const results = usersDB_tryResetPassword.tryResetPassword(userName, oldPassword, password);

    assert.equal(results.success, true);
  });

  it("should execute tryResetPassword() unsuccessfully", () => {

    const newPassword = stringFns.generatePassword();

    const results = usersDB_tryResetPassword.tryResetPassword(userName, password + "_", newPassword);

    assert.equal(results.success, false);
  });

  it("should execute generateNewPassword()", () => {
    const oldPassword = password;
    password = usersDB_generateNewPassword.generateNewPassword(userName);
    assert.notEqual(password, oldPassword);
  });

  it("should execute inactivateUser()", () => {
    assert.equal(usersDB_inactivateUser.inactivateUser(userName), 1);
  });
});
