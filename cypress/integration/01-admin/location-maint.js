import { testAdmin } from "../../../test/_globals.js";
import { logout, login } from "../../support/index.js";
describe("Admin - Locations", function () {
    before(function () {
        logout();
        login(testAdmin);
    });
    after(logout);
    it("Loads page", function () {
        cy.visit("/admin/locations");
        cy.location("pathname").should("equal", "/admin/locations");
    });
});
