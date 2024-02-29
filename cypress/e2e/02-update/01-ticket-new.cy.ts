/* eslint-disable eslint-comments/disable-enable-pair, unicorn/filename-case */
/* eslint-disable promise/always-return, promise/catch-or-return */

import * as configFunctions from '../../../helpers/functions.config.js'
import { testUpdate } from '../../../test/_globals.js'
import { login, logout } from '../../support/index.js'

describe('Create a New Ticket', () => {
  beforeEach(() => {
    logout()
    login(testUpdate)
    cy.visit('/tickets/new')
    cy.location('pathname').should('equal', '/tickets/new')
  })

  afterEach(logout)

  it('Creates a new parking ticket', () => {
    cy.injectAxe()
    cy.checkA11y()

    cy.fixture('ticket.json').then((ticketJSON) => {
      const ticketNumber =
        ticketJSON.ticketNumberPrefix +
        ('0000' + Cypress._.random(1, 99_999).toString()).slice(-5)

      const issueDate = new Date(
        Date.now() - ticketJSON.issueDateOffsetDays * 86_400 * 1000
      )

      cy.get("input[name='ticketNumber']").clear().type(ticketNumber)

      // eslint-disable-next-line promise/no-nesting
      cy.get("input[name='issueDateString']")
        .clear()
        .then(($element) => {
          ;($element.get(0) as HTMLInputElement).valueAsDate = issueDate
        })

      cy.get("input[name='issueTimeString']")
        .clear()
        .type(ticketJSON.issueTimeString)

      cy.get("input[name='issuingOfficer']")
        .clear()
        .type(ticketJSON.issuingOfficer)
      cy.get("textarea[name='locationDescription']")
        .clear()
        .type(ticketJSON.locationDescription)
    })

    // Location field

    cy.get("button[data-cy='select-location']").click()

    cy.get('.modal').should('be.visible').find('a.panel-block').first().click()

    cy.get('.modal').should('not.exist')

    cy.get("input[name='locationName']").should('not.have.value', '')

    // Bylaw field

    cy.get("button[data-cy='select-bylaw']").click()

    cy.get('.modal').should('be.visible').find('a.panel-block').first().click()

    cy.get('.modal').should('not.exist')

    cy.get("input[name='bylawNumber']").should('not.have.value', '')

    cy.get("input[name='offenceAmount']").should('not.have.value', '')
    cy.get("input[name='discountOffenceAmount']").should('not.have.value', '')
    cy.get("input[name='discountDays']").should('not.have.value', '')

    const expectedLicencePlateCountry =
      configFunctions.getConfigProperty('defaults.country')

    cy.get("input[name='licencePlateCountry']").should(
      'contain.value',
      expectedLicencePlateCountry
    )

    const expectedLicencePlateProvince =
      configFunctions.getConfigProperty('defaults.province')

    cy.get("input[name='licencePlateProvince']").should(
      'contain.value',
      expectedLicencePlateProvince
    )

    cy.fixture('ticket.json').then((ticketJSON) => {
      cy.get("input[name='licencePlateNumber']")
        .clear()
        .type(ticketJSON.licencePlateNumber)
      cy.get("input[name='licencePlateExpiryYear']")
        .clear()
        .type((new Date().getFullYear() + 1).toString())
      cy.get("select[name='licencePlateExpiryMonth']").select(
        ticketJSON.licencePlateExpiryMonth
      )
      cy.get("input[name='vehicleMakeModel']")
        .clear()
        .type(ticketJSON.vehicleMakeModel)
      cy.get("input[name='vehicleVIN']").clear().type(ticketJSON.vehicleVIN)
    })

    cy.log('Disable required fields when the licence plate is unavailable')

    cy.get("input[name='licencePlateIsMissing']").check({ force: true })

    cy.get("input[name='licencePlateCountry']").should(
      'not.have.attr',
      'required'
    )

    cy.get("input[name='licencePlateProvince']").should(
      'not.have.attr',
      'required'
    )

    cy.get("input[name='licencePlateNumber']").should(
      'not.have.attr',
      'required'
    )

    cy.log('Enforce required fields when the licence plate is available')

    cy.get("input[name='licencePlateIsMissing']").uncheck({ force: true })

    cy.get("input[name='licencePlateCountry']").should('have.attr', 'required')

    cy.get("input[name='licencePlateProvince']").should('have.attr', 'required')

    cy.get("input[name='licencePlateNumber']").should('have.attr', 'required')

    cy.log('Submits the form, creates a record')

    cy.get("button[type='submit']")
      .should('contain.text', 'Create New Ticket')
      .click()

    cy.get('.modal').should('be.visible').should('contain', 'success')
  })
})
