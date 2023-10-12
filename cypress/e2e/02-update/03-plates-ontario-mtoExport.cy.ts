/* eslint-disable eslint-comments/disable-enable-pair, unicorn/filename-case */
/* eslint-disable promise/always-return, promise/catch-or-return */

import { testUpdate } from '../../../test/_globals.js'
import { logout, login } from '../../support/index.js'

function clearCurrentBatch (): void {
  cy.get("button[data-cy='clear-batch']")
    .should(Cypress._.noop)
    .then(($buttons) => {
      if ($buttons.length > 0) {
        cy.get("button[data-cy='clear-batch']").click()

        cy.get('.modal')
          .should('be.visible')
          .find('button')
          .contains('Yes')
          .click()
      }
    })
}

function addAllTicketsToBatch(): void {
  cy.intercept('POST', '/plates/doAddAllParkingTicketsToLookupBatch').as('add')

  cy.get("button[data-cy='add-tickets']").click()

  cy.wait('@add')

  cy.get("button[data-cy='add-tickets']").should('not.exist')
}

describe('MTO Licence Plate Export', () => {
  before(() => {
    logout()
    login(testUpdate)
  })

  // after(logout);

  it('Loads page', () => {
    cy.visit('/plates-ontario/mtoExport')

    cy.location('pathname').should('equal', '/plates-ontario/mtoExport')

    clearCurrentBatch()
  })

  it('Creates a new batch', () => {
    cy.get("button[data-cy='select-batch']").click()

    cy.get('.modal')
      .should('be.visible')
      .find('button')
      .contains('Create')
      .click()

    cy.get('.modal')
      .should('be.visible')
      .find('button')
      .contains('Regular')
      .click()

    cy.get('.modal').should('not.exist')
  })

  it('Adds all tickets to the batch', () => {
    addAllTicketsToBatch()
  })

  it('Clears the batch', () => {
    clearCurrentBatch()
  })

  it('Adds tickets individually', () => {
    cy.get("button[data-cy='add-ticket']").each(($button) => {
      cy.wrap($button).click()
    })
  })

  it('Removes tickets individually', () => {
    cy.get("button[data-cy='remove-ticket']").each(($button) => {
      cy.wrap($button).click()
    })
  })

  it('Adds all tickets to the batch again', () => {
    addAllTicketsToBatch()
  })

  it('Locks the batch', () => {
    cy.get("button[data-cy='lock-batch']").click()

    cy.get('.modal').should('be.visible').find('button').contains('Yes').click()

    cy.get("button[data-cy='lock-batch']").should('be.disabled')

    cy.get('button').contains('Download File').should('exist')
  })
})
