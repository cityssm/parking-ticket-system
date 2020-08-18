import * as assert from "assert";

import { fakeViewOnlyRequest, fakeAdminRequest } from "./1_serverStart";

import * as userFns from "../helpers/userFns";


describe("userFns", () => {

  // View Only

  it("userCanCreate(fakeViewOnlyRequest) is false", () => {
    assert.equal(userFns.userCanCreate(fakeViewOnlyRequest), false);
  });

  it("userCanUpdate(fakeViewOnlyRequest) is false", () => {
    assert.equal(userFns.userCanUpdate(fakeViewOnlyRequest), false);
  });

  it("userIsAdmin(fakeViewOnlyRequest) is false", () => {
    assert.equal(userFns.userIsAdmin(fakeViewOnlyRequest), false);
  });

  it("userIsOperator(fakeViewOnlyRequest) is false", () => {
    assert.equal(userFns.userIsOperator(fakeViewOnlyRequest), false);
  });

  // Admin

  it("userCanCreate(fakeAdminRequest) is true", () => {
    assert.ok(userFns.userCanCreate(fakeAdminRequest));
  });

  it("userCanUpdate(fakeAdminRequest) is true", () => {
    assert.ok(userFns.userCanUpdate(fakeAdminRequest));
  });

  it("userIsAdmin(fakeAdminRequest) is true", () => {
    assert.ok(userFns.userIsAdmin(fakeAdminRequest));
  });

  it("userIsOperator(fakeAdminRequest) is true", () => {
    assert.ok(userFns.userIsOperator(fakeAdminRequest));
  });

});
