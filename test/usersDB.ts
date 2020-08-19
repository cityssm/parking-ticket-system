import * as assert from "assert";

import { initUsersDB } from "../helpers/dbInit";

import * as usersDB from "../helpers/usersDB";


describe("usersDB", () => {

  before(() => {
    initUsersDB();
  });

  it("Execute getUser()", () => {
    assert.equal(usersDB.getUser("", ""), null);
  });

  it("Execute getAllUsers()", () => {
    assert.ok(usersDB.getAllUsers());
  });

  it("Execute getUserProperties()", () => {
    assert.ok(usersDB.getUserProperties(""));
  });

  it("Execute inactivateUser() with blank user name", () => {
    assert.equal(usersDB.inactivateUser(""), 0);
  });
});
