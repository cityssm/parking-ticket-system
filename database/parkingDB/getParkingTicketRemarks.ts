import * as dateTimeFns from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingTicketRemark } from '../../types/recordTypes.js'
import { canUpdateObject } from '../parkingDB.js'

export function getParkingTicketRemarks(
  ticketID: number,
  sessionUser: PTSUser,
  connectedDatabase?: sqlite.Database
): ParkingTicketRemark[] {
  const database = connectedDatabase ?? sqlite(databasePath, { readonly: true })

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

  if (connectedDatabase === undefined) {
    database.close()
  }

  return remarkRows
}

export default getParkingTicketRemarks
