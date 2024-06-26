import { dateToInteger, dateToTimeInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingTicketRemark } from '../../types/recordTypes.js'

import getNextParkingTicketRemarkIndex from './getNextParkingTicketRemarkIndex.js'

export default function createParkingTicketRemark(
  requestBody: ParkingTicketRemark,
  sessionUser: PTSUser
): number {
  const database = sqlite(databasePath)

  // Get new remark index
  const remarkIndexNew = getNextParkingTicketRemarkIndex(
    requestBody.ticketId,
    database
  )

  // Create the record
  const rightNow = new Date()

  database
    .prepare(
      `insert into ParkingTicketRemarks (
        ticketId, remarkIndex,
        remarkDate, remarkTime,
        remark,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      requestBody.ticketId,
      remarkIndexNew,
      dateToInteger(rightNow),
      dateToTimeInteger(rightNow),
      requestBody.remark,
      sessionUser.userName,
      rightNow.getTime(),
      sessionUser.userName,
      rightNow.getTime()
    )

  database.close()

  return remarkIndexNew
}
