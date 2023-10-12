import * as assert from 'node:assert'

import * as parkingDB_cleanupLicencePlateOwnersTable from '../database/parkingDB/cleanupLicencePlateOwnersTable.js'
import * as parkingDB_cleanupParkingTicketRemarksTable from '../database/parkingDB/cleanupParkingTicketRemarksTable.js'
import * as parkingDB_cleanupParkingTicketStatusLog from '../database/parkingDB/cleanupParkingTicketStatusLog.js'
import * as parkingDB_cleanupParkingTicketsTable from '../database/parkingDB/cleanupParkingTicketsTable.js'
import * as parkingDB_getConvictionBatch from '../database/parkingDB/getConvictionBatch.js'
import * as parkingDB_getDatabaseCleanupCounts from '../database/parkingDB/getDatabaseCleanupCounts.js'
import * as parkingDB_getLastTenConvictionBatches from '../database/parkingDB/getLastTenConvictionBatches.js'
import * as parkingDB_getLicencePlateOwner from '../database/parkingDB/getLicencePlateOwner.js'
import * as parkingDB_getLicencePlates from '../database/parkingDB/getLicencePlates.js'
import * as parkingDB_getLookupBatch from '../database/parkingDB/getLookupBatch.js'
import * as parkingDB_getOwnershipReconciliationRecords from '../database/parkingDB/getOwnershipReconciliationRecords.js'
import * as parkingDB_getParkingBylaws from '../database/parkingDB/getParkingBylaws.js'
import * as parkingDB_getParkingLocations from '../database/parkingDB/getParkingLocations.js'
import * as parkingDB_getParkingOffences from '../database/parkingDB/getParkingOffences.js'
import * as parkingDB_getParkingTicket from '../database/parkingDB/getParkingTicket.js'
import * as parkingDB_getParkingTicketID from '../database/parkingDB/getParkingTicketID.js'
import * as parkingDB_getParkingTicketRemarks from '../database/parkingDB/getParkingTicketRemarks.js'
import * as parkingDB_getParkingTicketStatuses from '../database/parkingDB/getParkingTicketStatuses.js'
import * as parkingDB_getParkingTickets from '../database/parkingDB/getParkingTickets.js'
import * as parkingDB_getUnacknowledgedLookupErrorLog from '../database/parkingDB/getUnacknowledgedLookupErrorLog.js'
import * as parkingDB_getUnreceivedLookupBatches from '../database/parkingDB/getUnreceivedLookupBatches.js'
import { initializeDatabase } from '../database/parkingDB/initializeDatabase.js'
import * as parkingDB_isConvictionBatchUpdatable from '../database/parkingDB/isConvictionBatchUpdatable.js'
import * as parkingDB_isParkingTicketConvicted from '../database/parkingDB/isParkingTicketConvicted.js'
import * as parkingDB_isParkingTicketInConvictionBatch from '../database/parkingDB/isParkingTicketInConvictionBatch.js'
import * as parkingDBOntario_getParkingTicketsAvailableForMTOLookup from '../database/parkingDB-ontario/getParkingTicketsAvailableForMTOLookup.js'
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
          parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, {
            limit: 1,
            offset: 0
          })
        )
      })

      it('should execute with ticketNumber filter', () => {
        assert.ok(
          parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, {
            limit: 1,
            offset: 0,
            ticketNumber: 'TEST_TKT'
          })
        )
      })

      it('should execute with licencePlateNumber filter', () => {
        assert.ok(
          parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, {
            limit: 1,
            offset: 0,
            licencePlateNumber: 'TEST PLATE'
          })
        )
      })

      it('should execute with licencePlateNumberEqual filter', () => {
        assert.ok(
          parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, {
            limit: 1,
            offset: 0,
            licencePlateNumber: 'TEST PLATE'
          })
        )
      })

      it('should execute with licencePlateProvince filter', () => {
        assert.ok(
          parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, {
            limit: 1,
            offset: 0,
            licencePlateProvince: 'ON'
          })
        )
      })

      it('should execute with licencePlateCountry filter', () => {
        assert.ok(
          parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, {
            limit: 1,
            offset: 0,
            licencePlateCountry: 'CA'
          })
        )
      })

      it('should execute with location filter', () => {
        assert.ok(
          parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, {
            limit: 1,
            offset: 0,
            location: 'street'
          })
        )
      })

      it('should execute with isResolved=true filter', () => {
        assert.ok(
          parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, {
            limit: 1,
            offset: 0,
            isResolved: true
          })
        )
      })

      it('should execute with isResolved=false filter', () => {
        assert.ok(
          parkingDB_getParkingTickets.getParkingTickets(fakeViewOnlySession, {
            limit: 1,
            offset: 0,
            isResolved: false
          })
        )
      })
    })

    it('should execute getParkingTicket(-1)', () => {
      assert.strictEqual(
        parkingDB_getParkingTicket.getParkingTicket(-1, fakeViewOnlySession),
        undefined
      )
    })

    it('should execute getParkingTicketID()', () => {
      assert.strictEqual(
        parkingDB_getParkingTicketID.getParkingTicketID(
          '~~FAKE TICKET NUMBER~~'
        ),
        undefined
      )
    })

    it('should execute getParkingTicketRemarks(-1)', () => {
      assert.strictEqual(
        parkingDB_getParkingTicketRemarks.getParkingTicketRemarks(
          -1,
          fakeViewOnlySession
        ).length,
        0
      )
    })

    it('should execute getParkingTicketStatuses(-1)', () => {
      assert.strictEqual(
        parkingDB_getParkingTicketStatuses.getParkingTicketStatuses(
          -1,
          fakeViewOnlySession
        ).length,
        0
      )
    })
  })

  describe('licence plate queries', () => {
    it('should execute getLicencePlates()', () => {
      assert.ok(
        parkingDB_getLicencePlates.getLicencePlates({
          limit: 1,
          offset: 0
        })
      )
    })

    it('should execute getLicencePlateOwner()', () => {
      assert.strictEqual(
        parkingDB_getLicencePlateOwner.getLicencePlateOwner(
          'CA',
          'ON',
          '~~FAKE PLATE NUMBER~~',
          0
        ),
        undefined
      )
    })
  })

  describe('conviction batch queries', () => {
    it('should execute getLastTenConvictionBatches()', () => {
      assert.ok(
        parkingDB_getLastTenConvictionBatches.getLastTenConvictionBatches()
      )
    })

    it('should execute getConvictionBatch()', () => {
      const batch = parkingDB_getConvictionBatch.getConvictionBatch(-1)

      assert.ok(batch === undefined || batch.lockDate === undefined)
    })

    it('should execute parkingDB_isConvictionBatchUpdatable()', () => {
      const isConvicted =
        parkingDB_isConvictionBatchUpdatable.isConvictionBatchUpdatable(-1)

      assert.strictEqual(isConvicted, false)
    })

    it('should execute parkingDB_isParkingTicketConvicted()', () => {
      const isConvicted =
        parkingDB_isParkingTicketConvicted.isParkingTicketConvicted(-1)

      assert.strictEqual(isConvicted, false)
    })

    it('should execute isParkingTicketInConvictionBatch()', () => {
      const result =
        parkingDB_isParkingTicketInConvictionBatch.isParkingTicketInConvictionBatch(
          -1
        )

      assert.strictEqual(result.inBatch, false)
    })
  })

  describe('lookup batch queries', () => {
    it('should execute getUnreceivedLookupBatches()', () => {
      assert.ok(
        parkingDB_getUnreceivedLookupBatches.getUnreceivedLookupBatches(true)
      )
    })

    it('should execute getLookupBatch()', () => {
      const batch = parkingDB_getLookupBatch.getLookupBatch(-1)

      assert.ok(!batch || !batch.lockDate)
    })

    it('should execute getOwnershipReconciliationRecords()', () => {
      assert.ok(
        parkingDB_getOwnershipReconciliationRecords.getOwnershipReconciliationRecords()
      )
    })

    it('should execute getUnacknowledgedLookupErrorLog()', () => {
      assert.ok(
        parkingDB_getUnacknowledgedLookupErrorLog.getUnacknowledgedLookupErrorLog(
          -1,
          -1
        )
      )
    })
  })

  describe('reference queries', () => {
    it('should execute getParkingLocations()', () => {
      assert.ok(parkingDB_getParkingLocations.getParkingLocations())
    })

    it('should execute getParkingBylaws()', () => {
      assert.ok(parkingDB_getParkingBylaws.getParkingBylaws())
    })

    it('should execute getParkingBylawsWithOffenceStats()', () => {
      assert.ok(parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats())
    })

    it('should execute getParkingOffences()', () => {
      assert.ok(parkingDB_getParkingOffences.getParkingOffences())
    })

    it('should execute getParkingOffencesByLocationKey()', () => {
      assert.ok(
        parkingDB_getParkingOffences.getParkingOffencesByLocationKey('')
      )
    })
  })

  describe('cleanup queries', () => {
    const deleteTimeMillis = Date.now() + 3600 * 1000

    it('should execute getDatabaseCleanupCounts()', () => {
      assert.ok(parkingDB_getDatabaseCleanupCounts.getDatabaseCleanupCounts())
    })

    it('should execute cleanupParkingTicketsTable()', () => {
      assert.ok(
        parkingDB_cleanupParkingTicketsTable.cleanupParkingTicketsTable(
          deleteTimeMillis
        )
      )
    })

    it('should execute cleanupParkingTicketRemarksTable()', () => {
      assert.ok(
        parkingDB_cleanupParkingTicketRemarksTable.cleanupParkingTicketRemarksTable(
          deleteTimeMillis
        )
      )
    })

    it('should execute cleanupParkingTicketStatusLog()', () => {
      assert.ok(
        parkingDB_cleanupParkingTicketStatusLog.cleanupParkingTicketStatusLog(
          deleteTimeMillis
        )
      )
    })

    it('should execute cleanupLicencePlateOwnersTable()', () => {
      assert.ok(
        parkingDB_cleanupLicencePlateOwnersTable.cleanupLicencePlateOwnersTable(
          deleteTimeMillis
        )
      )
    })
  })

  describe('-ontario', () => {
    it('should execute getLicencePlatesAvailableForMTOLookupBatch()', () => {
      assert.ok(
        parkingDBOntario_getParkingTicketsAvailableForMTOLookup.getParkingTicketsAvailableForMTOLookup(
          -1,
          -1
        )
      )
    })

    it('should execute getParkingTicketsAvailableForMTOConvictionBatch()', () => {
      assert.ok(
        parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch()
      )
    })
  })
})
