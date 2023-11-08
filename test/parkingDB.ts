import assert from 'node:assert'

import parkingDB_cleanupLicencePlateOwnersTable from '../database/parkingDB/cleanupLicencePlateOwnersTable.js'
import parkingDB_cleanupParkingTicketRemarksTable from '../database/parkingDB/cleanupParkingTicketRemarksTable.js'
import parkingDB_cleanupParkingTicketStatusLog from '../database/parkingDB/cleanupParkingTicketStatusLog.js'
import parkingDB_cleanupParkingTicketsTable from '../database/parkingDB/cleanupParkingTicketsTable.js'
import parkingDB_getConvictionBatch from '../database/parkingDB/getConvictionBatch.js'
import parkingDB_getDatabaseCleanupCounts from '../database/parkingDB/getDatabaseCleanupCounts.js'
import parkingDB_getLastTenConvictionBatches from '../database/parkingDB/getLastTenConvictionBatches.js'
import parkingDB_getLicencePlateOwner from '../database/parkingDB/getLicencePlateOwner.js'
import parkingDB_getLicencePlates from '../database/parkingDB/getLicencePlates.js'
import parkingDB_getLookupBatch from '../database/parkingDB/getLookupBatch.js'
import parkingDB_getOwnershipReconciliationRecords from '../database/parkingDB/getOwnershipReconciliationRecords.js'
import parkingDB_getParkingBylaws from '../database/parkingDB/getParkingBylaws.js'
import parkingDB_getParkingLocations from '../database/parkingDB/getParkingLocations.js'
import parkingDB_getParkingOffences from '../database/parkingDB/getParkingOffences.js'
import parkingDB_getParkingTicket from '../database/parkingDB/getParkingTicket.js'
import parkingDB_getParkingTicketId from '../database/parkingDB/getParkingTicketId.js'
import parkingDB_getParkingTicketRemarks from '../database/parkingDB/getParkingTicketRemarks.js'
import parkingDB_getParkingTicketStatuses from '../database/parkingDB/getParkingTicketStatuses.js'
import parkingDB_getParkingTickets from '../database/parkingDB/getParkingTickets.js'
import parkingDB_getUnacknowledgedLookupErrorLog from '../database/parkingDB/getUnacknowledgedLookupErrorLog.js'
import parkingDB_getUnreceivedLookupBatches from '../database/parkingDB/getUnreceivedLookupBatches.js'
import { initializeDatabase } from '../database/parkingDB/initializeDatabase.js'
import parkingDB_isConvictionBatchUpdatable from '../database/parkingDB/isConvictionBatchUpdatable.js'
import parkingDB_isParkingTicketConvicted from '../database/parkingDB/isParkingTicketConvicted.js'
import parkingDB_isParkingTicketInConvictionBatch from '../database/parkingDB/isParkingTicketInConvictionBatch.js'
import parkingDBOntario_getParkingTicketsAvailableForMTOLookup from '../database/parkingDB-ontario/getParkingTicketsAvailableForMTOLookup.js'
import * as parkingDB_ontario from '../database/parkingDB-ontario.js'

import { fakeViewOnlySession } from './_globals.js'

describe('database/parkingDB', () => {
  before(() => {
    initializeDatabase()
  })

  describe('parking ticket queries', () => {
    describe('getParkingTickets()', () => {
      it('should execute with no filters', () => {
        assert.ok(
          parkingDB_getParkingTickets(fakeViewOnlySession.user, {
            limit: 1,
            offset: 0
          })
        )
      })

      it('should execute with ticketNumber filter', () => {
        assert.ok(
          parkingDB_getParkingTickets(fakeViewOnlySession.user, {
            limit: 1,
            offset: 0,
            ticketNumber: 'TEST_TKT'
          })
        )
      })

      it('should execute with licencePlateNumber filter', () => {
        assert.ok(
          parkingDB_getParkingTickets(fakeViewOnlySession.user, {
            limit: 1,
            offset: 0,
            licencePlateNumber: 'TEST PLATE'
          })
        )
      })

      it('should execute with licencePlateNumberEqual filter', () => {
        assert.ok(
          parkingDB_getParkingTickets(fakeViewOnlySession.user, {
            limit: 1,
            offset: 0,
            licencePlateNumber: 'TEST PLATE'
          })
        )
      })

      it('should execute with licencePlateProvince filter', () => {
        assert.ok(
          parkingDB_getParkingTickets(fakeViewOnlySession.user, {
            limit: 1,
            offset: 0,
            licencePlateProvince: 'ON'
          })
        )
      })

      it('should execute with licencePlateCountry filter', () => {
        assert.ok(
          parkingDB_getParkingTickets(fakeViewOnlySession.user, {
            limit: 1,
            offset: 0,
            licencePlateCountry: 'CA'
          })
        )
      })

      it('should execute with location filter', () => {
        assert.ok(
          parkingDB_getParkingTickets(fakeViewOnlySession.user, {
            limit: 1,
            offset: 0,
            location: 'street'
          })
        )
      })

      it('should execute with isResolved=true filter', () => {
        assert.ok(
          parkingDB_getParkingTickets(fakeViewOnlySession.user, {
            limit: 1,
            offset: 0,
            isResolved: true
          })
        )
      })

      it('should execute with isResolved=false filter', () => {
        assert.ok(
          parkingDB_getParkingTickets(fakeViewOnlySession.user, {
            limit: 1,
            offset: 0,
            isResolved: false
          })
        )
      })
    })

    it('should execute getParkingTicket(-1)', () => {
      assert.strictEqual(
        parkingDB_getParkingTicket(-1, fakeViewOnlySession.user),
        undefined
      )
    })

    it('should execute getParkingTicketId()', () => {
      assert.strictEqual(
        parkingDB_getParkingTicketId('~~FAKE TICKET NUMBER~~'),
        undefined
      )
    })

    it('should execute getParkingTicketRemarks(-1)', () => {
      assert.strictEqual(
        parkingDB_getParkingTicketRemarks(-1, fakeViewOnlySession.user).length,
        0
      )
    })

    it('should execute getParkingTicketStatuses(-1)', () => {
      assert.strictEqual(
        parkingDB_getParkingTicketStatuses(-1, fakeViewOnlySession.user).length,
        0
      )
    })
  })

  describe('licence plate queries', () => {
    it('should execute getLicencePlates()', () => {
      assert.ok(
        parkingDB_getLicencePlates({
          limit: 1,
          offset: 0
        })
      )
    })

    it('should execute getLicencePlateOwner()', () => {
      assert.strictEqual(
        parkingDB_getLicencePlateOwner('CA', 'ON', '~~FAKE PLATE NUMBER~~', 0),
        undefined
      )
    })
  })

  describe('conviction batch queries', () => {
    it('should execute getLastTenConvictionBatches()', () => {
      assert.ok(parkingDB_getLastTenConvictionBatches())
    })

    it('should execute getConvictionBatch()', () => {
      const batch = parkingDB_getConvictionBatch(-1)

      assert.ok(batch?.lockDate === undefined)
    })

    it('should execute parkingDB_isConvictionBatchUpdatable()', () => {
      const isConvicted = parkingDB_isConvictionBatchUpdatable(-1)

      assert.strictEqual(isConvicted, false)
    })

    it('should execute parkingDB_isParkingTicketConvicted()', () => {
      const isConvicted = parkingDB_isParkingTicketConvicted(-1)

      assert.strictEqual(isConvicted, false)
    })

    it('should execute isParkingTicketInConvictionBatch()', () => {
      const result = parkingDB_isParkingTicketInConvictionBatch(-1)

      assert.strictEqual(result.inBatch, false)
    })
  })

  describe('lookup batch queries', () => {
    it('should execute getUnreceivedLookupBatches()', () => {
      assert.ok(parkingDB_getUnreceivedLookupBatches(true))
    })

    it('should execute getLookupBatch()', () => {
      const batch = parkingDB_getLookupBatch(-1)

      assert.ok(
        batch === undefined || (batch.lockDate ?? undefined) === undefined
      )
    })

    it('should execute getOwnershipReconciliationRecords()', () => {
      assert.ok(parkingDB_getOwnershipReconciliationRecords())
    })

    it('should execute getUnacknowledgedLookupErrorLog()', () => {
      assert.ok(parkingDB_getUnacknowledgedLookupErrorLog(-1, -1))
    })
  })

  describe('reference queries', () => {
    it('should execute getParkingLocations()', () => {
      assert.ok(parkingDB_getParkingLocations())
    })

    it('should execute getParkingBylaws()', () => {
      assert.ok(parkingDB_getParkingBylaws())
    })

    it('should execute getParkingBylawsWithOffenceStats()', () => {
      assert.ok(parkingDB_getParkingBylaws())
    })

    it('should execute getParkingOffences()', () => {
      assert.ok(parkingDB_getParkingOffences())
    })

    it('should execute getParkingOffencesByLocationKey()', () => {
      assert.ok(parkingDB_getParkingOffences())
    })
  })

  describe('cleanup queries', () => {
    const deleteTimeMillis = Date.now() + 3600 * 1000

    it('should execute getDatabaseCleanupCounts()', () => {
      assert.ok(parkingDB_getDatabaseCleanupCounts())
    })

    it('should execute cleanupParkingTicketsTable()', () => {
      assert.ok(parkingDB_cleanupParkingTicketsTable(deleteTimeMillis))
    })

    it('should execute cleanupParkingTicketRemarksTable()', () => {
      assert.ok(parkingDB_cleanupParkingTicketRemarksTable(deleteTimeMillis))
    })

    it('should execute cleanupParkingTicketStatusLog()', () => {
      assert.ok(parkingDB_cleanupParkingTicketStatusLog(deleteTimeMillis))
    })

    it('should execute cleanupLicencePlateOwnersTable()', () => {
      assert.ok(parkingDB_cleanupLicencePlateOwnersTable(deleteTimeMillis))
    })
  })

  describe('-ontario', () => {
    it('should execute getLicencePlatesAvailableForMTOLookupBatch()', () => {
      assert.ok(parkingDBOntario_getParkingTicketsAvailableForMTOLookup(-1, -1))
    })

    it('should execute getParkingTicketsAvailableForMTOConvictionBatch()', () => {
      assert.ok(
        parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch()
      )
    })
  })
})
