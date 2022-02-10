import { testView } from "../../test/_globals.js";
import { logout, login } from "../support/index.js";
describe("Read Only User", function () {
    before(logout);
    after(logout);
    it("Logs In Successfully", function () {
        login(testView);
    });
    describe("Ticket Search", function () {
        before(function () {
            cy.visit("/tickets");
        });
        it("Loads page", function () {
            cy.location("pathname").should("equal", "/tickets");
        });
        it("Has no links to new ticket", function () {
            cy.get("a[href*='/new']")
                .should(Cypress._.noop)
                .should("have.length", 0);
        });
    });
    describe("Create a Ticket", function () {
        it("Redirects to Dashboard", function () {
            cy.visit("/tickets/new");
            cy.location("pathname").should("equal", "/dashboard");
        });
    });
    describe("Plate Search", function () {
        before(function () {
            cy.visit("/plates");
        });
        it("Loads page", function () {
            cy.location("pathname").should("equal", "/plates");
        });
    });
    describe("Reports", function () {
        before(function () {
            cy.visit("/reports");
        });
        it("Loads page", function () {
            cy.location("pathname").should("equal", "/reports");
        });
    });
    describe("Admin - Database Cleanup", function () {
        it("Redirects to Dashboard", function () {
            cy.visit("/admin/cleanup");
            cy.location("pathname").should("not.contain", "/admin");
        });
    });
});
