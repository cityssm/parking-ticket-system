import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingTicketRemark } from '../../types/recordTypes.js'

export const updateParkingTicketRemark = (
  requestBody: ParkingTicketRemark,
  sessionUser: PTSUser
): { success: boolean } => {
  const database = sqlite(databasePath)

  const info = database
    .prepare(
      `update ParkingTicketRemarks
        set remarkDate = ?,
        remarkTime = ?,
        remark = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where ticketID = ?
        and remarkIndex = ?
        and recordDelete_timeMillis is null`
    )
    .run(
      dateTimeFns.dateStringToInteger(requestBody.remarkDateString),
      dateTimeFns.timeStringToInteger(requestBody.remarkTimeString),
      requestBody.remark,
      sessionUser.userName,
      Date.now(),
      requestBody.ticketID,
      requestBody.remarkIndex
    )

  database.close()

  return {
    success: info.changes > 0
  }
}

export default updateParkingTicketRemark
