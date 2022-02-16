import { logout } from "../../support/index.js";
describe("Login Page", function () {
    before(logout);
    it("Has no detectable accessibility issues", function () {
        cy.injectAxe();
        cy.checkA11y();
    });
    it("Contains a login form", function () {
        cy.get("form").should("have.length", 1);
    });
    it("Contains a _csrf field", function () {
        cy.get("form [name='_csrf']").should("exist");
    });
    it("Contains a userName field", function () {
        cy.get("form [name='userName']").should("exist");
    });
    it("Contains a password field", function () {
        cy.get("form [name='password']")
            .should("have.length", 1)
            .invoke("attr", "type")
            .should("equal", "password");
    });
    it("Contains a help link", function () {
        cy.get("a").contains("help", { matchCase: false });
    });
});
