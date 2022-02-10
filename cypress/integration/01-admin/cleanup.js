import { testAdmin } from "../../../test/_globals.js";
import { logout, login } from "../../support/index.js";
describe("Admin - Database Cleanup", function () {
    before(function () {
        logout();
        login(testAdmin);
    });
    after(logout);
    it("Loads page", function () {
        cy.visit("/admin/cleanup");
        cy.location("pathname").should("equal", "/admin/cleanup");
    });
});
