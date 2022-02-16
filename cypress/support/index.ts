import "cypress-axe";


Cypress.Cookies.defaults({
  preserve: ["_csrf", "parking-ticket-system-user-sid"]
});


export const logout = () => {
  cy.visit("/logout");
};


export const login = (userName: string) => {
  cy.visit("/login");

  cy.get(".message")
    .contains("Testing", { matchCase: false });

  cy.get("form [name='userName']").type(userName);
  cy.get("form [name='password']").type(userName);

  cy.get("form").submit();

  // Logged in pages have a navbar
  cy.get(".navbar").should("have.length", 1);
};
