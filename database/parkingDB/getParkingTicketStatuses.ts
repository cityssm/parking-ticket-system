import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'
import type * as expressSession from 'express-session'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingTicketStatusLog } from '../../types/recordTypes.js'
import { canUpdateObject } from '../parkingDB.js'

export const getParkingTicketStatusesWithDB = (
  database: sqlite.Database,
  ticketID: number,
  requestSession: expressSession.Session
): ParkingTicketStatusLog[] => {
  const statusRows = database
    .prepare(
      'select * from ParkingTicketStatusLog' +
        ' where recordDelete_timeMillis is null' +
        ' and ticketID = ?' +
        ' order by statusDate desc, statusTime desc, statusIndex desc'
    )
    .all(ticketID) as ParkingTicketStatusLog[]

  for (const status of statusRows) {
    status.recordType = 'status'

    status.statusDateString = dateTimeFns.dateIntegerToString(status.statusDate as number)
    status.statusTimeString = dateTimeFns.timeIntegerToString(status.statusTime as number)

    status.canUpdate = canUpdateObject(status, requestSession)
  }

  return statusRows
}

export const getParkingTicketStatuses = (
  ticketID: number,
  requestSession: expressSession.Session
): ParkingTicketStatusLog[] => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const statusRows = getParkingTicketStatusesWithDB(
    database,
    ticketID,
    requestSession
  )

  database.close()

  return statusRows
}

export default getParkingTicketStatuses
