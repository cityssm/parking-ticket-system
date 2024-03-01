/* eslint-disable eslint-comments/disable-enable-pair, unicorn/filename-case */

import * as dateTimeFns from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../data/databasePaths.js'
import { getConfigProperty } from '../helpers/functions.config.js'
import type { ParkingTicket, Record } from '../types/recordTypes.js'

export const canUpdateObject = (
  object: Record,
  sessionUser: PTSUser
): boolean => {
  // check user permissions

  let canUpdate = false

  if ((sessionUser ?? undefined) === undefined) {
    canUpdate = false
  } else if ((object.recordDelete_timeMillis ?? undefined) !== undefined) {
    // Deleted records cannot be updated
    canUpdate = false
  } else if (sessionUser.canUpdate) {
    canUpdate = true
  }

  if (canUpdate) {
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (object.recordType) {
      case 'ticket': {
        if (
          (object as ParkingTicket).resolvedDate &&
          Date.now() - object.recordUpdate_timeMillis >=
            getConfigProperty('parkingTickets.updateWindowMillis')
        ) {
          canUpdate = false
        }
        break
      }
    }
  }

  return canUpdate
}

export const getRecentParkingTicketVehicleMakeModelValues = (): string[] => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const issueDate = dateTimeFns.dateToInteger(sixMonthsAgo)

  const rows = database
    .prepare(
      `select vehicleMakeModel
        from ParkingTickets
        where recordDelete_timeMillis is null
        and issueDate > ?
        group by vehicleMakeModel
        having count(vehicleMakeModel) > 3
        order by vehicleMakeModel`
    )
    .all(issueDate) as Array<{ vehicleMakeModel: string }>

  database.close()

  const vehicleMakeModelList: string[] = []

  for (const row of rows) {
    vehicleMakeModelList.push(row.vehicleMakeModel)
  }

  return vehicleMakeModelList
}

interface GetSplitWhereClauseFilterReturn {
  sqlWhereClause: string
  sqlParams: string[]
}

export const getSplitWhereClauseFilter = (
  columnName: string,
  searchString: string
): GetSplitWhereClauseFilterReturn => {
  let sqlWhereClause = ''
  const sqlParameters: string[] = []

  const ticketNumberPieces = searchString.toLowerCase().split(' ')

  for (const ticketNumberPiece of ticketNumberPieces) {
    sqlWhereClause += ` and instr(lower(${columnName}), ?)`
    sqlParameters.push(ticketNumberPiece)
  }

  return {
    sqlWhereClause,
    sqlParams: sqlParameters
  }
}

// Licence Plates

interface GetDistinctLicencePlateOwnerVehicleNCICsReturn {
  vehicleNCIC: string
  recordDateMax: number
}

export const getDistinctLicencePlateOwnerVehicleNCICs = (
  cutoffDate: number
): GetDistinctLicencePlateOwnerVehicleNCICsReturn[] => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const rows = database
    .prepare(
      `select vehicleNCIC, max(recordDate) as recordDateMax
        from LicencePlateOwners
        where recordDate >= ?
        group by vehicleNCIC
        order by recordDateMax desc`
    )
    .all(cutoffDate) as GetDistinctLicencePlateOwnerVehicleNCICsReturn[]

  database.close()

  return rows
}
