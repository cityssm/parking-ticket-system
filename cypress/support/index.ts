import 'cypress-axe'

export function logout(): void {
  cy.visit('/logout')
}

export function login(userName: string): void {
  cy.visit('/login')

  cy.get('.message').contains('Testing', { matchCase: false })

  cy.get("form [name='userName']").type(userName)
  cy.get("form [name='password']").type(userName)

  cy.get('form').submit()

  cy.location('pathname').should('not.contain', '/login')

  // Logged in pages have a navbar
  cy.get('.navbar').should('have.length', 1)
}
