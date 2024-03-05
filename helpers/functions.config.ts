// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import { Configurator } from '@cityssm/configurator'

import config from '../data/config.js'
import { configDefaultValues } from '../data/configDefaultValues.js'
import type { ConfigParkingTicketStatus } from '../types/configTypes.js'

const configurator = new Configurator(
  configDefaultValues,
  config as unknown as Record<string, unknown>
)

/*
 * Set up getConfigProperty()
 */

export function getConfigProperty<K extends keyof typeof configDefaultValues>(
  propertyName: K,
  fallbackValue?: (typeof configDefaultValues)[K]
): (typeof configDefaultValues)[K] {
  return configurator.getConfigProperty(
    propertyName,
    fallbackValue
  ) as (typeof configDefaultValues)[K]
}

export const keepAliveMillis = getConfigProperty('session.doKeepAlive')
  ? Math.max(
      getConfigProperty('session.maxAgeMillis') / 2,
      getConfigProperty('session.maxAgeMillis') - 10 * 60 * 1000
    )
  : 0

const parkingTicketStatusMap = new Map<string, ConfigParkingTicketStatus>()
let parkingTicketStatusMapIsLoaded = false

export function getParkingTicketStatus(
  statusKey: string
): ConfigParkingTicketStatus | undefined {
  if (!parkingTicketStatusMapIsLoaded) {
    const parkingTicketStatusList = getConfigProperty('parkingTicketStatuses')

    for (const parkingTicketStatusObject of parkingTicketStatusList) {
      parkingTicketStatusMap.set(
        parkingTicketStatusObject.statusKey,
        parkingTicketStatusObject
      )
    }

    parkingTicketStatusMapIsLoaded = true
  }

  return parkingTicketStatusMap.get(statusKey)
}

interface LicencePlateLocationProperties {
  licencePlateCountryAlias: string
  licencePlateProvinceAlias: string
  licencePlateProvince: {
    provinceShortName: string
    color: string
    backgroundColor: string
  }
}

export function getLicencePlateLocationProperties(
  originalLicencePlateCountry: string,
  originalLicencePlateProvince: string
): LicencePlateLocationProperties {
  const licencePlateProvinceDefault = {
    provinceShortName: originalLicencePlateProvince,
    color: '#000',
    backgroundColor: '#fff'
  }

  // Get the country alias
  const licencePlateCountryAlias: string = Object.hasOwn(
    getConfigProperty('licencePlateCountryAliases'),
    originalLicencePlateCountry.toUpperCase()
  )
    ? getConfigProperty('licencePlateCountryAliases')[
        originalLicencePlateCountry.toUpperCase()
      ]
    : originalLicencePlateCountry

  // Get the province alias
  let licencePlateProvinceAlias = originalLicencePlateProvince

  if (
    Object.hasOwn(
      getConfigProperty('licencePlateProvinceAliases'),
      licencePlateCountryAlias
    )
  ) {
    licencePlateProvinceAlias =
      getConfigProperty('licencePlateProvinceAliases')[
        licencePlateCountryAlias
      ][originalLicencePlateProvince.toUpperCase()] ||
      originalLicencePlateProvince
  }

  // Get the province object
  let licencePlateProvince = licencePlateProvinceDefault

  if (
    Object.hasOwn(
      getConfigProperty('licencePlateProvinces'),
      licencePlateCountryAlias
    )
  ) {
    licencePlateProvince =
      getConfigProperty('licencePlateProvinces')[licencePlateCountryAlias]
        .provinces[licencePlateProvinceAlias] || licencePlateProvinceDefault
  }

  // Return
  return {
    licencePlateCountryAlias,
    licencePlateProvinceAlias,
    licencePlateProvince
  }
}

export default {
  getConfigProperty,
  keepAliveMillis,
  getParkingTicketStatus,
  getLicencePlateLocationProperties
}
