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
    it("Purges all tables", function () {
        cy.get("button[data-cy='purge']")
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
});
