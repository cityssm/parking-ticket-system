import { testUpdate } from "../../../test/_globals.js";

import { logout, login } from "../../support/index.js";

describe("Update User", () => {

  before(logout);

  after(logout);

  it("Logs In Successfully", () => {
    login(testUpdate);
  });

  describe("Ticket Search", () => {
    before(() => {
      cy.visit("/tickets");
    });

    it("Loads page", () => {
      cy.location("pathname").should("equal", "/tickets");
    });

    it("Have link to new ticket", () => {
      cy.get("a[href*='/new']")
      .should("exist");
    });
  });

  describe("New Ticket", () => {
    before(() => {
      cy.visit("/tickets/new");
    });

    it("Loads page", () => {
      cy.location("pathname").should("equal", "/tickets/new");
    });
  });

});
