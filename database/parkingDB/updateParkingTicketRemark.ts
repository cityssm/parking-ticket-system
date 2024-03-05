import {
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingTicketRemark } from '../../types/recordTypes.js'

export default function updateParkingTicketRemark(
  requestBody: ParkingTicketRemark,
  sessionUser: PTSUser
): { success: boolean } {
  const database = sqlite(databasePath)

  const info = database
    .prepare(
      `update ParkingTicketRemarks
        set remarkDate = ?,
        remarkTime = ?,
        remark = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where ticketId = ?
        and remarkIndex = ?
        and recordDelete_timeMillis is null`
    )
    .run(
      dateStringToInteger(requestBody.remarkDateString),
      timeStringToInteger(requestBody.remarkTimeString),
      requestBody.remark,
      sessionUser.userName,
      Date.now(),
      requestBody.ticketId,
      requestBody.remarkIndex
    )

  database.close()

  return {
    success: info.changes > 0
  }
}
