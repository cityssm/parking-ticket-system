import { testView, testUpdate, testAdmin } from "../../test/_globals.js";
var logoutLogin = function () {
    cy.visit("/logout");
    cy.visit("/login");
};
describe('Parking Ticket System', function () {
    before(logoutLogin);
    describe("Login Page", function () {
        it("Contains a login form", function () {
            cy.get("form").should("have.length", 1);
            cy.get("form [name='_csrf']").should("have.length", 1);
            cy.get("form [name='userName']").should("have.length", 1);
            cy.get("form [name='password']").should("have.length", 1);
        });
    });
    describe("Read Only User", function () {
        before(logoutLogin);
        it("Logs In Successfully", function () {
            cy.$$("form [name='userName']").val(testView);
            cy.$$("form [name='password']").val(testView);
            cy.get("form").submit();
            cy.get(".navbar").should("have.length", 1);
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
            it("Redirects to dashboard", function () {
                cy.visit("/admin/cleanup");
                cy.location("pathname").should("not.contain", "/admin");
            });
        });
    });
    describe("Update User", function () {
        before(logoutLogin);
        it("Logs In Successfully", function () {
            cy.$$("form [name='userName']").val(testUpdate);
            cy.$$("form [name='password']").val(testUpdate);
            cy.get("form").submit();
            cy.get(".navbar").should("have.length", 1);
        });
        describe("Ticket Search", function () {
            before(function () {
                cy.visit("/tickets");
            });
            it("Loads page", function () {
                cy.location("pathname").should("equal", "/tickets");
            });
            it("Have link to new ticket", function () {
                cy.get("a[href*='/new']")
                    .should("exist");
            });
        });
        describe("New Ticket", function () {
            before(function () {
                cy.visit("/tickets/new");
            });
            it("Loads page", function () {
                cy.location("pathname").should("equal", "/tickets/new");
            });
        });
    });
    describe("Admin User", function () {
        before(logoutLogin);
        it("Logs In Successfully", function () {
            cy.$$("form [name='userName']").val(testAdmin);
            cy.$$("form [name='password']").val(testAdmin);
            cy.get("form").submit();
            cy.get(".navbar").should("have.length", 1);
        });
        describe("Admin - Database Cleanup", function () {
            before(function () {
                cy.visit("/admin/cleanup");
            });
            it("Loads page", function () {
                cy.location("pathname").should("equal", "/admin/cleanup");
            });
        });
        describe("Admin - Parking Offences", function () {
            before(function () {
                cy.visit("/admin/offences");
            });
            it("Loads page", function () {
                cy.location("pathname").should("equal", "/admin/offences");
            });
        });
        describe("Admin - Parking Locations", function () {
            before(function () {
                cy.visit("/admin/locations");
            });
            it("Loads page", function () {
                cy.location("pathname").should("equal", "/admin/locations");
            });
        });
        describe("Admin - Parking By-Laws", function () {
            before(function () {
                cy.visit("/admin/bylaws");
            });
            it("Loads page", function () {
                cy.location("pathname").should("equal", "/admin/bylaws");
            });
        });
    });
});
