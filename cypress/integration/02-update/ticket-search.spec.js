import { testUpdate } from "../../../test/_globals.js";
import { logout, login } from "../../support/index.js";
describe("Ticket Search - Update User", function () {
    before(function () {
        logout();
        login(testUpdate);
    });
    after(logout);
    it("Loads page", function () {
        cy.visit("/tickets");
        cy.location("pathname").should("equal", "/tickets");
    });
    it("Has no detectable accessibility issues", function () {
        cy.injectAxe();
        cy.checkA11y();
    });
    it("Has link to new ticket", function () {
        cy.get("a[href*='/new']")
            .should("exist");
    });
});
