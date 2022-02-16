import { testAdmin } from "../../../test/_globals.js";
import { logout, login } from "../../support/index.js";
describe("Admin - Database Cleanup", function () {
    before(function () {
        logout();
        login(testAdmin);
    });
    after(logout);
    beforeEach("Loads page", function () {
        cy.visit("/admin/cleanup");
        cy.location("pathname").should("equal", "/admin/cleanup");
    });
    it("Has no detectable accessibility issues before purging", function () {
        cy.injectAxe();
        cy.checkA11y();
    });
    it("Purges all tables", function () {
        cy.get("button[data-cy='purge']")
            .should(Cypress._.noop)
            .each(function ($buttonElement) {
            cy.wrap($buttonElement).click();
            cy.get(".modal button")
                .contains("Yes")
                .click();
            cy.get(".modal button")
                .contains("OK")
                .click();
        });
        cy.get("button[data-cy='purge']")
            .should("not.exist");
    });
    it("Has no detectable accessibility issues after purging", function () {
        cy.injectAxe();
        cy.checkA11y();
    });
});
