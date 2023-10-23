import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingTicketRemark } from '../../types/recordTypes.js'

import { getNextParkingTicketRemarkIndex } from './getNextParkingTicketRemarkIndex.js'

export const createParkingTicketRemark = (
  requestBody: ParkingTicketRemark,
  sessionUser: PTSUser
): { success: boolean } => {
  const database = sqlite(databasePath)

  // Get new remark index

  const remarkIndexNew = getNextParkingTicketRemarkIndex(
    database,
    requestBody.ticketID
  )

  // Create the record

  const rightNow = new Date()

  const info = database
    .prepare(
      'insert into ParkingTicketRemarks' +
        ' (ticketID, remarkIndex, remarkDate, remarkTime, remark,' +
        ' recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)' +
        ' values (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .run(
      requestBody.ticketID,
      remarkIndexNew,
      dateTimeFns.dateToInteger(rightNow),
      dateTimeFns.dateToTimeInteger(rightNow),
      requestBody.remark,
      sessionUser.userName,
      rightNow.getTime(),
      sessionUser.userName,
      rightNow.getTime()
    )

  database.close()

  return {
    success: info.changes > 0
  }
}

export default createParkingTicketRemark
