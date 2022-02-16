/* eslint-disable unicorn/filename-case, promise/catch-or-return, promise/always-return */

import { testAdmin } from "../../../test/_globals.js";

import { logout, login } from "../../support/index.js";


describe("Admin - Database Cleanup", () => {

  before(() => {
    logout();
    login(testAdmin)
  });

  after(logout);

  beforeEach("Loads page", () => {
    cy.visit("/admin/cleanup");
    cy.location("pathname").should("equal", "/admin/cleanup");
  });

  it("Has no detectable accessibility issues before purging", () => {
    cy.injectAxe();
    cy.checkA11y();
  });

  it("Purges all tables", () => {

    cy.get("button[data-cy='purge']")
      .should(Cypress._.noop)
      .each(($buttonElement) => {
        cy.wrap($buttonElement).click();

        cy.get(".modal button")
          .contains("Yes")
          .click();

        cy.get(".modal button")
          .contains("OK")
          .click();
      });

    cy.get("button[data-cy='purge']")
      .should("not.exist");
  });

  it("Has no detectable accessibility issues after purging", () => {
    cy.injectAxe();
    cy.checkA11y();
  });
});
