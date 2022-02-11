import { testUpdate } from "../../../test/_globals.js";
import { logout, login } from "../../support/index.js";
describe("Create a New Ticket", function () {
    before(function () {
        logout();
        login(testUpdate);
    });
    it("Loads page", function () {
        cy.visit("/tickets/new");
        cy.location("pathname").should("equal", "/tickets/new");
    });
});
