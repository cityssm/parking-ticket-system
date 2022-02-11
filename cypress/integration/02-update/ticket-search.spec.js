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
    it("Have link to new ticket", function () {
        cy.get("a[href*='/new']")
            .should("exist");
    });
});
