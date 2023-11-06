import * as dateTimeFns from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingTicketStatusLog } from '../../types/recordTypes.js'
import { canUpdateObject } from '../parkingDB.js'

export const getParkingTicketStatuses = (
  ticketID: number,
  sessionUser: PTSUser,
  connectedDatabase?: sqlite.Database
): ParkingTicketStatusLog[] => {
  const database = connectedDatabase ?? sqlite(databasePath, { readonly: true })

  const statusRows = database
    .prepare(
      `select * from ParkingTicketStatusLog
        where recordDelete_timeMillis is null
        and ticketID = ?
        order by statusDate desc, statusTime desc, statusIndex desc`
    )
    .all(ticketID) as ParkingTicketStatusLog[]

  for (const status of statusRows) {
    status.recordType = 'status'

    status.statusDateString = dateTimeFns.dateIntegerToString(
      status.statusDate as number
    )
    status.statusTimeString = dateTimeFns.timeIntegerToString(
      status.statusTime as number
    )

    status.canUpdate = canUpdateObject(status, sessionUser)
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return statusRows
}

export default getParkingTicketStatuses
