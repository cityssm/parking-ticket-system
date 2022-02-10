Cypress.Cookies.defaults({
    preserve: ["_csrf", "parking-ticket-system-user-sid"]
});
export var logout = function () {
    cy.visit("/logout");
};
export var login = function (userName) {
    cy.visit("/login");
    cy.get("form [name='userName']").type(userName);
    cy.get("form [name='password']").type(userName);
    cy.get("form").submit();
    cy.get(".navbar").should("have.length", 1);
};
