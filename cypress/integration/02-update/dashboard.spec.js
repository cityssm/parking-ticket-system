import { testUpdate } from "../../../test/_globals.js";
import { logout, login } from "../../support/index.js";
describe("Dashboard - Update User", function () {
    before(function () {
        logout();
        login(testUpdate);
    });
    after(logout);
    beforeEach("Loads page", function () {
        cy.visit("/dashboard");
        cy.location("pathname").should("equal", "/dashboard");
    });
    it("Sets the data-can-update attribute to true", function () {
        cy.get("main")
            .invoke("attr", "data-can-update")
            .should("equal", "true");
    });
    it("Sets the data-is-admin attribute to false", function () {
        cy.get("main")
            .invoke("attr", "data-is-admin")
            .should("equal", "false");
    });
    it("Has a link to create a new ticket", function () {
        cy.get("a[href*='/tickets/new']").should("exist");
    });
    it("Does not have a link to Database Cleanup", function () {
        cy.get("a[href*='/admin/cleanup']").should("not.exist");
    });
    it("Does not have a link to Parking Offence Maintenance", function () {
        cy.get("a[href*='/admin/offences']").should("not.exist");
    });
    it("Does not have a link to Parking Location Maintenance", function () {
        cy.get("a[href*='/admin/locations']").should("not.exist");
    });
    it("Does not have a link to Parking By-Law Maintenance", function () {
        cy.get("a[href*='/admin/bylaws']").should("not.exist");
    });
});
