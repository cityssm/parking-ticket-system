import * as dateTimeFns from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import { getConfigProperty } from '../../helpers/functions.config.js'
import * as vehicleFunctions from '../../helpers/functions.vehicle.js'
import type { LicencePlateOwner } from '../../types/recordTypes.js'

export async function getLicencePlateOwner(
  licencePlateCountry: string,
  licencePlateProvince: string,
  licencePlateNumber: string,
  recordDateOrBefore: number,
  connectedDatabase?: sqlite.Database
): Promise<LicencePlateOwner | undefined> {
  const database = connectedDatabase ?? sqlite(databasePath, { readonly: true })

  const licencePlateCountryAlias =
    getConfigProperty('licencePlateCountryAliases')[licencePlateCountry] ??
    licencePlateCountry

  const licencePlateProvinceAlias =
    getConfigProperty('licencePlateProvinceAliases')[
      licencePlateCountryAlias
    ]?.[licencePlateProvince] ?? licencePlateProvince

  const possibleOwners = database
    .prepare(
      `select * from LicencePlateOwners
        where recordDelete_timeMillis is null
        and licencePlateNumber = ?
        and recordDate >= ?
        order by recordDate`
    )
    .all(licencePlateNumber, recordDateOrBefore) as LicencePlateOwner[]

  for (const possibleOwnerObject of possibleOwners) {
    const ownerPlateCountryAlias =
      getConfigProperty('licencePlateCountryAliases')[
        possibleOwnerObject.licencePlateCountry
      ] ?? possibleOwnerObject.licencePlateCountry

    const ownerPlateProvinceAlias =
      getConfigProperty('licencePlateProvinceAliases')[
        ownerPlateCountryAlias
      ]?.[possibleOwnerObject.licencePlateProvince] ??
      possibleOwnerObject.licencePlateProvince

    if (
      licencePlateCountryAlias === ownerPlateCountryAlias &&
      licencePlateProvinceAlias === ownerPlateProvinceAlias
    ) {
      possibleOwnerObject.recordDateString = dateTimeFns.dateIntegerToString(
        possibleOwnerObject.recordDate
      )

      possibleOwnerObject.licencePlateExpiryDateString =
        dateTimeFns.dateIntegerToString(
          possibleOwnerObject.licencePlateExpiryDate
        )

      possibleOwnerObject.vehicleMake = await vehicleFunctions.getMakeFromNCIC(
        possibleOwnerObject.vehicleNCIC
      )

      return possibleOwnerObject
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return undefined
}

export default getLicencePlateOwner
