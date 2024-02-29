/* eslint-disable eslint-comments/disable-enable-pair, unicorn/filename-case */
/* eslint-disable promise/always-return, promise/catch-or-return */

import { testAdmin } from '../../../test/_globals.js'
import { login, logout } from '../../support/index.js'

describe('Admin - Database Cleanup', () => {
  beforeEach(() => {
    logout()
    login(testAdmin)
    cy.visit('/admin/cleanup')
    cy.location('pathname').should('equal', '/admin/cleanup')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues before purging', () => {
    cy.injectAxe()
    cy.checkA11y()
  })

  it('Purges all tables', () => {
    cy.get("button[data-cy='purge']")
      .should(Cypress._.noop)
      .each(($buttonElement) => {
        cy.wrap($buttonElement).click()

        cy.get('.modal button').contains('Yes').click()

        cy.get('.modal button').contains('OK').click()
      })

    cy.get("button[data-cy='purge']").should('not.exist')
  })

  it('Has no detectable accessibility issues after purging', () => {
    cy.injectAxe()
    cy.checkA11y()
  })
})
