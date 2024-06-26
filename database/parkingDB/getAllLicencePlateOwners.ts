import { dateIntegerToString } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import { getMakeFromNCIC } from '../../helpers/functions.vehicle.js'
import type { LicencePlateOwner } from '../../types/recordTypes.js'

export async function getAllLicencePlateOwners(
  licencePlateCountry: string,
  licencePlateProvince: string,
  licencePlateNumber: string
): Promise<LicencePlateOwner[]> {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const owners = database
    .prepare(
      `select recordDate, vehicleNCIC, vehicleYear, vehicleColor,
        ownerName1, ownerName2, ownerAddress, ownerCity, ownerProvince, ownerPostalCode
        from LicencePlateOwners
        where recordDelete_timeMillis is null
        and licencePlateCountry = ? and licencePlateProvince = ? and licencePlateNumber = ?
        order by recordDate desc`
    )
    .all(
      licencePlateCountry,
      licencePlateProvince,
      licencePlateNumber
    ) as LicencePlateOwner[]

  database.close()

  for (const owner of owners) {
    owner.recordDateString = dateIntegerToString(owner.recordDate)
    owner.vehicleMake = await getMakeFromNCIC(owner.vehicleNCIC)
  }

  return owners
}

export default getAllLicencePlateOwners
