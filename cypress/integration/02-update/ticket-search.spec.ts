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

  it("Have link to new ticket", () => {
    cy.get("a[href*='/new']")
      .should("exist");
  });
});
