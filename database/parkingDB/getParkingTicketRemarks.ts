import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingTicketRemark } from '../../types/recordTypes.js'
import { canUpdateObject } from '../parkingDB.js'

export const getParkingTicketRemarksWithDB = (
  database: sqlite.Database,
  ticketID: number,
  sessionUser: PTSUser
): ParkingTicketRemark[] => {
  const remarkRows = database
    .prepare(
      `select * from ParkingTicketRemarks
        where recordDelete_timeMillis is null
        and ticketID = ?
        order by remarkDate desc, remarkTime desc, remarkIndex desc`
    )
    .all(ticketID) as ParkingTicketRemark[]

  for (const remark of remarkRows) {
    remark.recordType = 'remark'

    remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate)
    remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime)

    remark.canUpdate = canUpdateObject(remark, sessionUser)
  }

  return remarkRows
}

export const getParkingTicketRemarks = (
  ticketID: number,
  sessionUser: PTSUser
): ParkingTicketRemark[] => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  return getParkingTicketRemarksWithDB(database, ticketID, sessionUser)
}

export default getParkingTicketRemarks
