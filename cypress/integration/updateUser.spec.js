import { testUpdate } from "../../test/_globals.js";
import { logout, login } from "../support/index.js";
describe("Update User", function () {
    before(logout);
    after(logout);
    it("Logs In Successfully", function () {
        login(testUpdate);
    });
    describe("Ticket Search", function () {
        before(function () {
            cy.visit("/tickets");
        });
        it("Loads page", function () {
            cy.location("pathname").should("equal", "/tickets");
        });
        it("Have link to new ticket", function () {
            cy.get("a[href*='/new']")
                .should("exist");
        });
    });
    describe("New Ticket", function () {
        before(function () {
            cy.visit("/tickets/new");
        });
        it("Loads page", function () {
            cy.location("pathname").should("equal", "/tickets/new");
        });
    });
});
