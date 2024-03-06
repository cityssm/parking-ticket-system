// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import * as dateTimeFns from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingTicketStatusLog } from '../../types/recordTypes.js'

import { getNextParkingTicketStatusIndex } from './getNextParkingTicketStatusIndex.js'
import resolveParkingTicket from './resolveParkingTicket.js'

type CreateParkingTicketStatusReturn =
  | {
      success: true
      statusIndex: number
    }
  | {
      success: false
    }

export default function createParkingTicketStatus(
  requestBodyOrObject: Partial<ParkingTicketStatusLog>,
  sessionUser: PTSUser,
  resolveTicket: boolean,
  connectedDatabase?: sqlite.Database
): CreateParkingTicketStatusReturn {
  const database = connectedDatabase ?? sqlite(databasePath)

  // Get new status index
  const statusIndexNew = getNextParkingTicketStatusIndex(
    requestBodyOrObject.ticketId as number | string,
    database
  )

  // Create the record
  const rightNow = new Date()

  const info = database
    .prepare(
      `insert into ParkingTicketStatusLog (
        ticketId, statusIndex,
        statusDate, statusTime,
        statusKey, statusField, statusField2, statusNote,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      requestBodyOrObject.ticketId,
      statusIndexNew,
      dateTimeFns.dateToInteger(rightNow),
      dateTimeFns.dateToTimeInteger(rightNow),
      requestBodyOrObject.statusKey,
      requestBodyOrObject.statusField,
      requestBodyOrObject.statusField2,
      requestBodyOrObject.statusNote,
      sessionUser.userName,
      rightNow.getTime(),
      sessionUser.userName,
      rightNow.getTime()
    )

  if (info.changes > 0 && resolveTicket) {
    resolveParkingTicket(
      requestBodyOrObject.ticketId as number | string,
      sessionUser,
      database
    )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return {
    success: true,
    statusIndex: statusIndexNew
  }
}
