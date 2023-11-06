import * as dateTimeFns from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import * as configFunctions from '../../helpers/functions.config.js'
import * as vehicleFunctions from '../../helpers/functions.vehicle.js'
import type { LicencePlateOwner } from '../../types/recordTypes.js'

export function getLicencePlateOwner(
  licencePlateCountry: string,
  licencePlateProvince: string,
  licencePlateNumber: string,
  recordDateOrBefore: number,
  connectedDatabase?: sqlite.Database
): LicencePlateOwner | undefined {
  const database = connectedDatabase ?? sqlite(databasePath, { readonly: true })

  const licencePlateCountryAlias =
    configFunctions.getProperty('licencePlateCountryAliases')[
      licencePlateCountry
    ] ?? licencePlateCountry

  const licencePlateProvinceAlias =
    configFunctions.getProperty('licencePlateProvinceAliases')[
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
      configFunctions.getProperty('licencePlateCountryAliases')[
        possibleOwnerObject.licencePlateCountry
      ] ?? possibleOwnerObject.licencePlateCountry

    const ownerPlateProvinceAlias =
      configFunctions.getProperty('licencePlateProvinceAliases')[
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

      possibleOwnerObject.vehicleMake = vehicleFunctions.getMakeFromNCIC(
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
