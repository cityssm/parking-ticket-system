import * as assert from "assert";

import { initUsersDB } from "../helpers/dbInit";

import * as usersDB from "../helpers/usersDB";


describe("helpers/usersDB", () => {

  before(() => {
    initUsersDB();
  });

  it("should execute getUser()", () => {
    assert.equal(usersDB.getUser("", ""), null);
  });

  it("should execute getAllUsers()", () => {
    assert.ok(usersDB.getAllUsers());
  });

  it("should execute getUserProperties()", () => {
    assert.ok(usersDB.getUserProperties(""));
  });

  it("should execute inactivateUser() with blank user name", () => {
    assert.equal(usersDB.inactivateUser(""), 0);
  });
});
