import { testAdmin } from "../../test/_globals.js";
import { logout, login } from "../support/index.js";
describe("Admin User", function () {
    before(logout);
    after(logout);
    it("Logs In Successfully", function () {
        login(testAdmin);
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
