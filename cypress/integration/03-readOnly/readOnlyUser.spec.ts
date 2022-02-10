import { testView } from "../../../test/_globals.js";

import { logout, login } from "../../support/index.js";


describe("Read Only User", () => {

  before(logout);

  after(logout);

  it("Logs In Successfully", () => {
    login(testView);
  });

  describe("Dashboard", () => {
    before(() => {
      cy.visit("/dashboard");
    });

    it("Has no links to new ticket", () => {
      cy.get("a[href*='/new']")
        .should(Cypress._.noop)
        .should("have.length", 0);
    });

    it("Has no links to admin areas", () => {
      cy.get("a[href*='/admin']")
        .should(Cypress._.noop)
        .should("have.length", 0);
    });
  });

  describe("Ticket Search", () => {
    before(() => {
      cy.visit("/tickets");
    });

    it("Loads page", () => {
      cy.location("pathname").should("equal", "/tickets");
    });

    it("Has no links to new ticket", () => {
      cy.get("a[href*='/new']")
        .should(Cypress._.noop)
        .should("have.length", 0);
    });
  });

  describe("Create a Ticket", () => {
    it("Redirects to Dashboard", () => {
      cy.visit("/tickets/new")
      cy.location("pathname").should("equal", "/dashboard");
    });
  });

  describe("Plate Search", () => {
    before(() => {
      cy.visit("/plates");
    });

    it("Loads page", () => {
      cy.location("pathname").should("equal", "/plates");
    });
  });

  describe("Reports", () => {
    before(() => {
      cy.visit("/reports");
    });

    it("Loads page", () => {
      cy.location("pathname").should("equal", "/reports");
    });
  });

  describe("Admin - Database Cleanup", () => {

    it("Redirects to Dashboard", () => {
      cy.visit("/admin/cleanup");
      cy.location("pathname").should("not.contain", "/admin");
    });
  });
});
