import assert from 'node:assert'

import * as configFunctions from '../helpers/functions.config.js'

describe('helpers/configFunctions', () => {
  describe('#getConfigProperty', () => {
    it('should include string value for property "parkingTickets.ticketNumber.fieldLabel"', () => {
      assert.strictEqual(
        typeof configFunctions.getConfigProperty(
          'parkingTickets.ticketNumber.fieldLabel'
        ),
        'string'
      )
    })

    it('should return a string from function property "parkingTickets.ticketNumber.nextTicketNumberFn"', () => {
      assert.strictEqual(
        typeof configFunctions.getConfigProperty(
          'parkingTickets.ticketNumber.nextTicketNumberFn'
        )(''),
        'string'
      )
    })
  })

  describe('#getParkingTicketStatus()', () => {
    it('should include a ticket status "paid"', () => {
      assert.ok(configFunctions.getParkingTicketStatus('paid'))
    })
  })

  describe('#getLicencePlateLocationProperties()', () => {
    it('should include the location "CA", "ON"', () => {
      assert.strictEqual(
        configFunctions.getLicencePlateLocationProperties('CA', 'ON')
          .licencePlateProvinceAlias,
        'Ontario'
      )
    })
  })
})
