import * as assert from "assert";

import { initializeDatabase } from "../helpers/usersDB/initializeDatabase";

import * as usersDB_getUser from "../helpers/usersDB/getUser";
import * as usersDB_getAllUsers from "../helpers/usersDB/getAllUsers";
import * as usersDB_getUserProperties from "../helpers/usersDB/getUserProperties";
import * as usersDB_inactivateUser from "../helpers/usersDB/inactivateUser";


describe("helpers/usersDB", () => {

  before(() => {
    initializeDatabase();
  });

  it("should execute getUser()", () => {
    assert.equal(usersDB_getUser.getUser("", ""), null);
  });

  it("should execute getAllUsers()", () => {
    assert.ok(usersDB_getAllUsers.getAllUsers());
  });

  it("should execute getUserProperties()", () => {
    assert.ok(usersDB_getUserProperties.getUserProperties(""));
  });

  it("should execute inactivateUser() with blank user name", () => {
    assert.equal(usersDB_inactivateUser.inactivateUser(""), 0);
  });
});
