import { testAdmin } from "../../../test/_globals.js";
import { logout, login } from "../../support/index.js";
describe("Dashboard - Admin User", function () {
    before(function () {
        logout();
        login(testAdmin);
    });
    after(logout);
    beforeEach("Loads page", function () {
        cy.visit("/dashboard");
        cy.location("pathname").should("equal", "/dashboard");
    });
    it("Sets the data-is-admin attribute to true", function () {
        cy.get("main")
            .invoke("attr", "data-is-admin")
            .should("equal", "true");
    });
    it("Has a link to Database Cleanup", function () {
        cy.get("a[href*='/admin/cleanup']").should("exist");
    });
    it("Has a link to Parking Offence Maintenance", function () {
        cy.get("a[href*='/admin/offences']").should("exist");
    });
    it("Has a link to Parking Location Maintenance", function () {
        cy.get("a[href*='/admin/locations']").should("exist");
    });
    it("Has a link to Parking By-Law Maintenance", function () {
        cy.get("a[href*='/admin/bylaws']").should("exist");
    });
});
