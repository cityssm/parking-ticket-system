import { testView, testUpdate, testAdmin } from "../../test/_globals.js";


const logoutLogin = () => {
  cy.visit("/logout");
  cy.visit("/login");
};


describe('Parking Ticket System', () => {

  before(logoutLogin);

  describe("Login Page", () => {

    it("Contains a login form", () => {
      cy.get("form").should("have.length", 1);
      cy.get("form [name='_csrf']").should("have.length", 1);
      cy.get("form [name='userName']").should("have.length", 1);
      cy.get("form [name='password']").should("have.length", 1);
    });
  });

  describe("Read Only User", () => {

    before(logoutLogin);

    it("Logs In Successfully", () => {

      cy.$$("form [name='userName']").val(testView);
      cy.$$("form [name='password']").val(testView);

      cy.get("form").submit();

      // Logged in pages have a navbar
      cy.get(".navbar").should("have.length", 1);
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

      it("Redirects to dashboard", () => {
        cy.visit("/admin/cleanup");
        cy.location("pathname").should("not.contain", "/admin");
      });
    });
  });

  describe("Update User", () => {

    before(logoutLogin);

    it("Logs In Successfully", () => {

      cy.$$("form [name='userName']").val(testUpdate);
      cy.$$("form [name='password']").val(testUpdate);

      cy.get("form").submit();

      // Logged in pages have a navbar
      cy.get(".navbar").should("have.length", 1);
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

  describe("Admin User", () => {

    before(logoutLogin);

    it("Logs In Successfully", () => {

      cy.$$("form [name='userName']").val(testAdmin);
      cy.$$("form [name='password']").val(testAdmin);

      cy.get("form").submit();

      // Logged in pages have a navbar
      cy.get(".navbar").should("have.length", 1);
    });

    describe("Admin - Database Cleanup", () => {
      before(() => {
        cy.visit("/admin/cleanup");
      });

      it("Loads page", () => {
        cy.location("pathname").should("equal", "/admin/cleanup");
      });
    });

    describe("Admin - Parking Offences", () => {
      before(() => {
        cy.visit("/admin/offences");
      });

      it("Loads page", () => {
        cy.location("pathname").should("equal", "/admin/offences");
      });
    });

    describe("Admin - Parking Locations", () => {
      before(() => {
        cy.visit("/admin/locations");
      });

      it("Loads page", () => {
        cy.location("pathname").should("equal", "/admin/locations");
      });
    });

    describe("Admin - Parking By-Laws", () => {
      before(() => {
        cy.visit("/admin/bylaws");
      });

      it("Loads page", () => {
        cy.location("pathname").should("equal", "/admin/bylaws");
      });
    });

  });
})
