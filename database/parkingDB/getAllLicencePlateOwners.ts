import sqlite from 'better-sqlite3'

import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import * as vehicleFunctions from '../../helpers/functions.vehicle.js'
import type * as pts from '../../types/recordTypes'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

export const getAllLicencePlateOwners = (
  licencePlateCountry: string,
  licencePlateProvince: string,
  licencePlateNumber: string
): pts.LicencePlateOwner[] => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const owners = database
    .prepare(
      'select recordDate, vehicleNCIC, vehicleYear, vehicleColor,' +
        ' ownerName1, ownerName2, ownerAddress, ownerCity, ownerProvince, ownerPostalCode' +
        ' from LicencePlateOwners' +
        ' where recordDelete_timeMillis is null' +
        ' and licencePlateCountry = ?' +
        ' and licencePlateProvince = ?' +
        ' and licencePlateNumber = ?' +
        ' order by recordDate desc'
    )
    .all(
      licencePlateCountry,
      licencePlateProvince,
      licencePlateNumber
    ) as pts.LicencePlateOwner[]

  database.close()

  for (const owner of owners) {
    owner.recordDateString = dateTimeFns.dateIntegerToString(owner.recordDate)
    owner.vehicleMake = vehicleFunctions.getMakeFromNCIC(owner.vehicleNCIC)
  }

  return owners
}

export default getAllLicencePlateOwners
