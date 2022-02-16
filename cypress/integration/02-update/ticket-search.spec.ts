/* eslint-disable unicorn/filename-case */

import { testUpdate } from "../../../test/_globals.js";

import { logout, login } from "../../support/index.js";

describe("Ticket Search - Update User", () => {

  before(() => {
    logout();
    login(testUpdate)
  });

  after(logout);

  it("Loads page", () => {
    cy.visit("/tickets");
    cy.location("pathname").should("equal", "/tickets");
  });

  it("Has no detectable accessibility issues", () => {
    cy.injectAxe();
    cy.checkA11y();
  });

  it("Has link to new ticket", () => {
    cy.get("a[href*='/new']")
      .should("exist");
  });
});
