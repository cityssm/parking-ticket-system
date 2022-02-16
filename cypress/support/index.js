"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.logout = void 0;
require("cypress-axe");
Cypress.Cookies.defaults({
    preserve: ["_csrf", "parking-ticket-system-user-sid"]
});
const logout = () => {
    cy.visit("/logout");
};
exports.logout = logout;
const login = (userName) => {
    cy.visit("/login");
    cy.get(".message")
        .contains("Testing", { matchCase: false });
    cy.get("form [name='userName']").type(userName);
    cy.get("form [name='password']").type(userName);
    cy.get("form").submit();
    cy.get(".navbar").should("have.length", 1);
};
exports.login = login;
