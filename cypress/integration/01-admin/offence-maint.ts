/* eslint-disable unicorn/filename-case, promise/catch-or-return, promise/always-return */

import { testAdmin } from "../../../test/_globals.js";

import { logout, login } from "../../support/index.js";
// import { randomString } from "../../support/utilities.js";


describe("Admin - Parking Offences", () => {

  before(() => {
    logout();
    login(testAdmin)
  });

  after(logout);

  it("Loads page", () => {
    cy.visit("/admin/offences");
    cy.location("pathname").should("equal", "/admin/offences");
  });
});
