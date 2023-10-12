// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'
import type * as expressSession from 'express-session'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingTicketStatusLog } from '../../types/recordTypes.js'

import { getNextParkingTicketStatusIndex } from './getNextParkingTicketStatusIndex.js'
import { resolveParkingTicketWithDB } from './resolveParkingTicket.js'

type CreateParkingTicketStatusReturn =
  | {
      success: true
      statusIndex: number
    }
  | {
      success: false
    }

export const createParkingTicketStatusWithDB = (
  database: sqlite.Database,
  requestBodyOrObject: ParkingTicketStatusLog,
  requestSession: expressSession.Session,
  resolveTicket: boolean
): CreateParkingTicketStatusReturn => {
  // Get new status index

  const statusIndexNew = getNextParkingTicketStatusIndex(
    database,
    requestBodyOrObject.ticketID
  )

  // Create the record

  const rightNow = new Date()

  const info = database
    .prepare(
      'insert into ParkingTicketStatusLog' +
        ' (ticketID, statusIndex, statusDate, statusTime, statusKey,' +
        ' statusField, statusField2, statusNote,' +
        ' recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)' +
        ' values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .run(
      requestBodyOrObject.ticketID,
      statusIndexNew,
      dateTimeFns.dateToInteger(rightNow),
      dateTimeFns.dateToTimeInteger(rightNow),
      requestBodyOrObject.statusKey,
      requestBodyOrObject.statusField,
      requestBodyOrObject.statusField2,
      requestBodyOrObject.statusNote,
      requestSession.user.userName,
      rightNow.getTime(),
      requestSession.user.userName,
      rightNow.getTime()
    )

  if (info.changes > 0 && resolveTicket) {
    resolveParkingTicketWithDB(
      database,
      requestBodyOrObject.ticketID,
      requestSession
    )
  }

  return {
    success: true,
    statusIndex: statusIndexNew
  }
}

export const createParkingTicketStatus = (
  requestBodyOrObject: ParkingTicketStatusLog,
  requestSession: expressSession.Session,
  resolveTicket: boolean
): CreateParkingTicketStatusReturn => {
  const database = sqlite(databasePath)

  const result = createParkingTicketStatusWithDB(
    database,
    requestBodyOrObject,
    requestSession,
    resolveTicket
  )

  database.close()

  return result
}

export default createParkingTicketStatus
