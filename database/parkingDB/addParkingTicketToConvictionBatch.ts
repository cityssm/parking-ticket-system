// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import sqlite from 'better-sqlite3'
import type * as expressSession from 'express-session'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

import { canParkingTicketBeAddedToConvictionBatch } from './canParkingTicketBeAddedToConvictionBatch.js'
import { createParkingTicketStatusWithDB } from './createParkingTicketStatus.js'
import { isConvictionBatchUpdatableWithDB } from './isConvictionBatchUpdatable.js'
import { isParkingTicketConvictedWithDB } from './isParkingTicketConvicted.js'
import { isParkingTicketInConvictionBatchWithDB } from './isParkingTicketInConvictionBatch.js'

function createStatus(
  database: sqlite.Database,
  batchID: number,
  ticketID: number,
  statusKey: 'convicted' | 'convictionBatch',
  requestSession: expressSession.Session
): void {
  createParkingTicketStatusWithDB(
    database,
    {
      recordType: 'status',
      ticketID,
      statusKey,
      statusField: batchID.toString(),
      statusField2: '',
      statusNote: ''
    },
    requestSession,
    false
  )
}

function createConvictedStatus(
  database: sqlite.Database,
  batchID: number,
  ticketID: number,
  requestSession: expressSession.Session
): void {
  createStatus(database, batchID, ticketID, 'convicted', requestSession)
}

function createConvictionBatchStatus(
  database: sqlite.Database,
  batchID: number,
  ticketID: number,
  requestSession: expressSession.Session
): void {
  createStatus(database, batchID, ticketID, 'convictionBatch', requestSession)
}

function convictIfNotConvicted(
  database: sqlite.Database,
  batchID: number,
  ticketID: number,
  requestSession: expressSession.Session
): void {
  const parkingTicketIsConvicted = isParkingTicketConvictedWithDB(
    database,
    ticketID
  )

  if (!parkingTicketIsConvicted) {
    createConvictedStatus(database, batchID, ticketID, requestSession)
  }
}

function addParkingTicketToConvictionBatchAfterBatchCheck(
  database: sqlite.Database,
  batchID: number,
  ticketID: number,
  requestSession: expressSession.Session
): {
  success: boolean
  message?: string
} {
  // Ensure ticket has not been resolved

  const ticketIsAvailable = canParkingTicketBeAddedToConvictionBatch(
    database,
    ticketID
  )

  if (!ticketIsAvailable) {
    return {
      success: false,
      message: 'The ticket cannot be added to the batch.'
    }
  }

  // Convict ticket

  convictIfNotConvicted(database, batchID, ticketID, requestSession)

  // Check if the ticket is part of another conviction batch

  const parkingTicketInBatch = isParkingTicketInConvictionBatchWithDB(
    database,
    ticketID
  )

  if (parkingTicketInBatch.inBatch) {
    return {
      success: false,
      message: `Parking ticket already included in conviction batch #${
        parkingTicketInBatch.batchIDString ?? ''
      }.`
    }
  } else {
    // No record, add to batch now

    createConvictionBatchStatus(database, batchID, ticketID, requestSession)
  }

  return {
    success: true
  }
}

export function addParkingTicketToConvictionBatch(
  batchID: number,
  ticketID: number,
  requestSession: expressSession.Session
): { success: boolean; message?: string } {
  const database = sqlite(databasePath)

  // Ensure batch is not locked

  const batchIsAvailable = isConvictionBatchUpdatableWithDB(database, batchID)

  if (!batchIsAvailable) {
    database.close()

    return {
      success: false,
      message: 'The batch cannot be updated.'
    }
  }

  return addParkingTicketToConvictionBatchAfterBatchCheck(
    database,
    batchID,
    ticketID,
    requestSession
  )
}

export const addAllParkingTicketsToConvictionBatch = (
  batchID: number,
  ticketIDs: number[],
  requestSession: expressSession.Session
): { success: boolean; successCount: number; message?: string } => {
  const database = sqlite(databasePath)

  // Ensure batch is not locked

  const batchIsAvailable = isConvictionBatchUpdatableWithDB(database, batchID)

  if (!batchIsAvailable) {
    database.close()

    return {
      success: false,
      successCount: 0,
      message: 'The batch cannot be updated.'
    }
  }

  // Loop through ticketIDs

  let successCount = 0

  for (const ticketID of ticketIDs) {
    const result = addParkingTicketToConvictionBatchAfterBatchCheck(
      database,
      batchID,
      ticketID,
      requestSession
    )

    if (result.success) {
      successCount += 1
    }
  }

  database.close()

  return {
    success: true,
    successCount
  }
}

export default addParkingTicketToConvictionBatch
