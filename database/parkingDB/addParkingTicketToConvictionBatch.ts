// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

import { canParkingTicketBeAddedToConvictionBatch } from './canParkingTicketBeAddedToConvictionBatch.js'
import { createParkingTicketStatus } from './createParkingTicketStatus.js'
import { isConvictionBatchUpdatable } from './isConvictionBatchUpdatable.js'
import { isParkingTicketConvicted } from './isParkingTicketConvicted.js'
import { isParkingTicketInConvictionBatchWithDB } from './isParkingTicketInConvictionBatch.js'

function createStatus(
  batchId: number,
  ticketId: number,
  statusKey: 'convicted' | 'convictionBatch',
  sessionUser: PTSUser,
  connectedDatabase?: sqlite.Database
): void {
  createParkingTicketStatus(
    {
      recordType: 'status',
      ticketId,
      statusKey,
      statusField: batchId.toString(),
      statusField2: '',
      statusNote: ''
    },
    sessionUser,
    false,
    connectedDatabase
  )
}

function createConvictedStatus(
  batchId: number,
  ticketId: number,
  sessionUser: PTSUser,
  connectedDatabase?: sqlite.Database
): void {
  createStatus(batchId, ticketId, 'convicted', sessionUser, connectedDatabase)
}

function createConvictionBatchStatus(
  batchId: number,
  ticketId: number,
  sessionUser: PTSUser,
  connectedDatabase?: sqlite.Database
): void {
  createStatus(
    batchId,
    ticketId,
    'convictionBatch',
    sessionUser,
    connectedDatabase
  )
}

function convictIfNotConvicted(
  batchId: number,
  ticketId: number,
  sessionUser: PTSUser,
  connectedDatabase?: sqlite.Database
): void {
  const parkingTicketIsConvicted = isParkingTicketConvicted(
    ticketId,
    connectedDatabase
  )

  if (!parkingTicketIsConvicted) {
    createConvictedStatus(batchId, ticketId, sessionUser, connectedDatabase)
  }
}

function addParkingTicketToConvictionBatchAfterBatchCheck(
  batchId: number,
  ticketId: number,
  sessionUser: PTSUser,
  connectedDatabase?: sqlite.Database
): {
  success: boolean
  message?: string
} {
  const database = connectedDatabase ?? sqlite(databasePath)

  try {
    // Ensure ticket has not been resolved
    const ticketIsAvailable = canParkingTicketBeAddedToConvictionBatch(
      ticketId,
      database
    )

    if (!ticketIsAvailable) {
      return {
        success: false,
        message: 'The ticket cannot be added to the batch.'
      }
    }

    // Convict ticket

    convictIfNotConvicted(batchId, ticketId, sessionUser, database)

    // Check if the ticket is part of another conviction batch

    const parkingTicketInBatch = isParkingTicketInConvictionBatchWithDB(
      database,
      ticketId
    )

    if (parkingTicketInBatch.inBatch) {
      return {
        success: false,
        message: `Parking ticket already included in conviction batch #${
          parkingTicketInBatch.batchIdString ?? ''
        }.`
      }
    } else {
      // No record, add to batch now

      createConvictionBatchStatus(batchId, ticketId, sessionUser, database)
    }

    return {
      success: true
    }
  } finally {
    if (connectedDatabase === undefined) {
      database.close()
    }
  }
}

export function addParkingTicketToConvictionBatch(
  batchId: number,
  ticketId: number,
  sessionUser: PTSUser
): { success: boolean; message?: string } {
  const database = sqlite(databasePath)

  try {
    // Ensure batch is not locked

    const batchIsAvailable = isConvictionBatchUpdatable(batchId, database)

    if (!batchIsAvailable) {
      return {
        success: false,
        message: 'The batch cannot be updated.'
      }
    }

    return addParkingTicketToConvictionBatchAfterBatchCheck(
      batchId,
      ticketId,
      sessionUser,
      database
    )
  } finally {
    database.close()
  }
}

export const addAllParkingTicketsToConvictionBatch = (
  batchId: number,
  ticketIds: number[],
  sessionUser: PTSUser
): { success: boolean; successCount: number; message?: string } => {
  const database = sqlite(databasePath)

  try {
    // Ensure batch is not locked

    const batchIsAvailable = isConvictionBatchUpdatable(batchId, database)

    if (!batchIsAvailable) {
      return {
        success: false,
        successCount: 0,
        message: 'The batch cannot be updated.'
      }
    }

    // Loop through ticketIds

    let successCount = 0

    for (const ticketId of ticketIds) {
      const result = addParkingTicketToConvictionBatchAfterBatchCheck(
        batchId,
        ticketId,
        sessionUser,
        database
      )

      if (result.success) {
        successCount += 1
      }
    }

    return {
      success: true,
      successCount
    }
  } finally {
    database.close()
  }
}

export default addParkingTicketToConvictionBatch
