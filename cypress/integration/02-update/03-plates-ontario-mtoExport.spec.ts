/* eslint-disable unicorn/filename-case, promise/catch-or-return, promise/always-return */

import { testUpdate } from "../../../test/_globals.js";

import { logout, login } from "../../support/index.js";

const clearCurrentBatch = () => {

  cy.get("button[data-cy='clear-batch']")
    .should(Cypress._.noop)
    .then(($buttons) => {

      if ($buttons.length > 0) {

        cy.get("button[data-cy='clear-batch']").click();

        cy.get(".modal")
          .should("be.visible")
          .find("button")
          .contains("Yes")
          .click();
      }
    });
};

const addAllPlatesToBatch = () => {
  cy.intercept("POST", "/plates/doAddAllLicencePlatesToLookupBatch").as("add")

  cy.get("button[data-cy='add-plates']")
    .click();

  cy.wait("@add");

  cy.get("button[data-cy='add-plates']")
    .should("not.exist");
};

describe("MTO Licence Plate Export", () => {

  before(() => {
    logout();
    login(testUpdate)
  });

  // after(logout);

  it("Loads page", () => {

    cy.visit("/plates-ontario/mtoExport");

    cy.location("pathname")
      .should("equal", "/plates-ontario/mtoExport");

    clearCurrentBatch();
  });

  it("Creates a new batch", () => {

    cy.get("button[data-cy='select-batch']")
      .click();

    cy.get(".modal")
      .should("be.visible")
      .find("button")
      .contains("Create")
      .click();

    cy.get(".modal")
      .should("be.visible")
      .find("button")
      .contains("Yes")
      .click();
  });

  it("Adds all plates to the batch", () => {
    addAllPlatesToBatch();
  });

  it("Clears the batch", () => {
    clearCurrentBatch();
  });

  it("Adds plates individually", () => {
    cy.get("button[data-cy='add-plate']").each(($button) => {
      cy.wrap($button).click();
    });
  });

  it("Removes plates individually", () => {
    cy.get("button[data-cy='remove-plate']").each(($button) => {
      cy.wrap($button).click();
    });
  });

  it("Adds all plates to the batch again", () => {
    addAllPlatesToBatch();
  });

  it("Locks the batch", () => {

    cy.get("button[data-cy='lock-batch']")
      .click();

    cy.get(".modal")
      .should("be.visible")
      .find("button")
      .contains("Yes")
      .click();

    cy.get("button[data-cy='lock-batch']")
      .should("be.disabled");

      cy.get("button")
      .contains("Download File")
      .should("exist");
  });
});
