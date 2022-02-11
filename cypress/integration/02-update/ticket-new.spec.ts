import { testUpdate } from "../../../test/_globals.js";

import { logout, login } from "../../support/index.js";

describe("Create a New Ticket", () => {

  before(() => {
    logout();
    login(testUpdate)
  });

  // after(logout);

  it("Loads page", () => {
    cy.visit("/tickets/new");
    cy.location("pathname").should("equal", "/tickets/new");
  });

});
