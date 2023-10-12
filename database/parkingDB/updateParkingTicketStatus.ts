import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'
import type * as expressSession from 'express-session'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingTicketStatusLog } from '../../types/recordTypes.js'

export const updateParkingTicketStatus = (
  requestBody: ParkingTicketStatusLog,
  requestSession: expressSession.Session
): { success: boolean } => {
  const database = sqlite(databasePath)

  const info = database
    .prepare(
      'update ParkingTicketStatusLog' +
        ' set statusDate = ?,' +
        ' statusTime = ?,' +
        ' statusKey = ?,' +
        ' statusField = ?,' +
        ' statusField2 = ?,' +
        ' statusNote = ?,' +
        ' recordUpdate_userName = ?,' +
        ' recordUpdate_timeMillis = ?' +
        ' where ticketID = ?' +
        ' and statusIndex = ?' +
        ' and recordDelete_timeMillis is null'
    )
    .run(
      dateTimeFns.dateStringToInteger(requestBody.statusDateString as string),
      dateTimeFns.timeStringToInteger(requestBody.statusTimeString as string),
      requestBody.statusKey,
      requestBody.statusField,
      requestBody.statusField2,
      requestBody.statusNote,
      requestSession.user.userName,
      Date.now(),
      requestBody.ticketID,
      requestBody.statusIndex
    )

  database.close()

  return {
    success: info.changes > 0
  }
}

export default updateParkingTicketStatus
