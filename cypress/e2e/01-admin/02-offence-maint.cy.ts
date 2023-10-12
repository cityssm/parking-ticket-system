/* eslint-disable eslint-comments/disable-enable-pair, unicorn/filename-case */
/* eslint-disable promise/always-return, promise/catch-or-return */

import { testAdmin } from '../../../test/_globals.js'
import { logout, login } from '../../support/index.js'

function setBylawFilter(): void {
  cy.get("button[data-cy='select-bylaw']").click()

  cy.get('.modal').should('be.visible').find('a.panel-block').first().click()

  cy.get('.modal').should('not.exist')

  cy.get("input[name='bylaw']").should('not.have.value', '')
}

function clearBylawFilter(): void {
  cy.get("button[data-cy='clear-bylaw']").click()

  cy.get("input[name='bylaw']").should('have.value', '')
}

function setLocationFilter(): void {
  cy.get("button[data-cy='select-location']").click()

  cy.get('.modal').should('be.visible').find('a.panel-block').first().click()

  cy.get('.modal').should('not.exist')

  cy.get("input[name='location']").should('not.have.value', '')
}

function clearLocationFilter(): void {
  cy.get("button[data-cy='clear-location']").click()

  cy.get("input[name='location']").should('have.value', '')
}

describe('Admin - Parking Offences', () => {
  beforeEach(() => {
    logout()
    login(testAdmin)
    cy.visit('/admin/offences')
    cy.location('pathname').should('equal', '/admin/offences')
  })

  afterEach(logout)

  it('Show something in the results', () => {
    cy.get("[data-cy='results']").should('not.be.empty')
  })

  it('Can filter results by location', () => {
    clearBylawFilter()
    setLocationFilter()
  })

  it('Can clear the location filter', () => {
    clearLocationFilter()
  })

  it('Can filter results by by-law', () => {
    clearLocationFilter()
    setBylawFilter()
  })

  it('Can clear the by-law filter', () => {
    clearBylawFilter()
  })

  it('Cannot add an offence when no location or by-law set', () => {
    clearLocationFilter()
    clearBylawFilter()

    cy.get("button[data-cy='add-offence']").click()

    cy.get('.modal')
      .should('be.visible')
      .find('.message')
      .should('have.class', 'is-warning')
      .find('button')
      .click()

    cy.get('.modal').should('not.exist')
  })

  it('Can add an offence when location and by-law filters are set', () => {
    setLocationFilter()
    setBylawFilter()

    cy.get("button[data-cy='add-offence']").click()

    cy.get('.modal')
      .should('be.visible')
      .find('.message')
      .should('have.class', 'is-info')
      .find('button')
      .contains('Create Offence')
      .click()

    cy.wait(500)

    cy.get('body').then(($body) => {
      if ($body.find('.modal').length > 0) {
        cy.get('.modal .message button').click()
      }
    })

    cy.get("[data-cy='results']").find('table').should('exist')
  })

  it('Can update an offence', () => {
    cy.get("[data-cy='results']")
      .find('button')
      .contains('Edit')
      .first()
      .click()

    cy.get('.modal').should('be.visible')

    cy.fixture('offence.json').then((offenceData) => {
      cy.get(".modal input[name='accountNumber']")
        .clear()
        .type(offenceData.accountNumber)

      cy.get(".modal input[name='offenceAmount']")
        .clear()
        .type(offenceData.offenceAmount)

      cy.get(".modal input[name='discountDays']")
        .clear()
        .type(offenceData.discountDays)

      cy.get(".modal input[name='discountOffenceAmount']")
        .clear()
        .type(offenceData.discountOffenceAmount)

      cy.get(".modal textarea[name='parkingOffence']")
        .clear()
        .type(offenceData.parkingOffence)

      cy.get('.modal form').submit()

      cy.get('.modal').should('not.exist')

      cy.wait(500)

      cy.get("[data-cy='results']").contains(offenceData.parkingOffence)
    })
  })

  it('Can add offences when only the by-law filter is set', () => {
    clearLocationFilter()
    setBylawFilter()

    cy.get("button[data-cy='add-offence']").click()

    cy.get('.modal')
      .should('be.visible')
      .find('a.panel-block')
      .each(($buttonElement, index) => {
        if (index < 5) {
          cy.wrap($buttonElement).click()
        }
      })

    cy.get('.modal .is-close-modal-button').first().click()

    cy.wait(500)

    cy.get("[data-cy='results']").find('table').should('exist')
  })

  it('Can add offences when only the location filter is set', () => {
    clearBylawFilter()
    setLocationFilter()

    cy.get("button[data-cy='add-offence']").click()

    cy.get('.modal')
      .should('be.visible')
      .find('a.panel-block')
      .each(($buttonElement, index) => {
        if (index < 5) {
          cy.wrap($buttonElement).click()
        }
      })

    cy.get('.modal .is-close-modal-button').first().click()

    cy.wait(500)

    cy.get("[data-cy='results']").find('table').should('exist')
  })

  it('Can remove an offence', () => {
    clearLocationFilter()
    clearBylawFilter()

    cy.get("[data-cy='results']").find('button').contains('Edit').last().click()

    cy.get('.modal')
      .should('be.visible')
      .find('button')
      .contains('Remove')
      .click()

    cy.get(".modal [role='alertdialog'] button").contains('Yes').click()

    cy.wait(500)

    cy.get('.modal').should('not.exist')
  })
})
