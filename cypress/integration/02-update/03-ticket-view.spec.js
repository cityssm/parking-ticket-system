import { testUpdate } from "../../../test/_globals.js";
import { logout, login } from "../../support/index.js";
describe("Ticket View - Update User", function () {
    before(function () {
        logout();
        login(testUpdate);
    });
    after(logout);
    it("Unresolves a resolved ticket", function () {
        cy.intercept("POST", "/tickets/doGetTickets").as("results");
        cy.visit("/tickets");
        cy.wait("@results");
        cy.get("select[name='isResolved']")
            .select("1");
        cy.wait("@results");
        cy.get("[data-cy='results']")
            .find("a")
            .first()
            .click();
        cy.get("button")
            .contains("Remove Resolved Status", { matchCase: false })
            .click();
        cy.get(".modal")
            .should("be.visible")
            .find("button")
            .contains("Yes")
            .click();
        cy.get("a[href$='/edit']")
            .should("exist");
    });
});
