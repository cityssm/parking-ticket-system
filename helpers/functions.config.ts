// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import config from '../data/config.js'
import type {
  ConfigActiveDirectory,
  ConfigLicencePlateCountry,
  ConfigLocationClass,
  ConfigParkingTicketStatus
} from '../types/configTypes.js'

/*
 * SET UP FALLBACK VALUES
 */

const configFallbackValues = new Map<string, unknown>()

configFallbackValues.set('application.applicationName', 'Parking Ticket System')
configFallbackValues.set('application.logoURL', '/images/noParking.svg')
configFallbackValues.set('application.httpPort', 4000)
configFallbackValues.set('application.userDomain', '')
configFallbackValues.set('application.useTestDatabases', false)
configFallbackValues.set('application.maximumProcesses', 4)

configFallbackValues.set('application.feature_mtoExportImport', false)

configFallbackValues.set('application.task_nhtsa.runTask', false)
configFallbackValues.set('application.task_nhtsa.executeHour', 2)

configFallbackValues.set('session.cookieName', 'parking-ticket-system-user-sid')
configFallbackValues.set('session.secret', 'cityssm/parking-ticket-system')
configFallbackValues.set('session.maxAgeMillis', 60 * 60 * 1000)
configFallbackValues.set('session.doKeepAlive', false)

configFallbackValues.set('users.testing', [])
configFallbackValues.set('users.canLogin', [])
configFallbackValues.set('users.canUpdate', [])
configFallbackValues.set('users.isAdmin', [])
configFallbackValues.set('users.isOperator', [])

configFallbackValues.set('defaults.country', '')
configFallbackValues.set('defaults.province', '')

configFallbackValues.set(
  'parkingTickets.ticketNumber.fieldLabel',
  'Ticket Number'
)
configFallbackValues.set(
  'parkingTickets.ticketNumber.pattern',
  /^[\w -]{1,10}$/
)
configFallbackValues.set('parkingTickets.ticketNumber.isUnique', true)
configFallbackValues.set(
  'parkingTickets.ticketNumber.nextTicketNumberFn',
  () => {
    return ''
  }
)
configFallbackValues.set('parkingTickets.updateWindowMillis', 3 * 86_400 * 1000)

configFallbackValues.set(
  'parkingTickets.licencePlateExpiryDate.includeDay',
  false
)

configFallbackValues.set('parkingTicketStatuses', [])

configFallbackValues.set(
  'parkingOffences.accountNumber.pattern',
  /^[\w -]{1,20}$/
)

configFallbackValues.set('locationClasses', [])

configFallbackValues.set(
  'licencePlateCountryAliases',
  Object.freeze({
    CA: 'Canada',
    US: 'USA'
  })
)

configFallbackValues.set('licencePlateProvinceAliases', {})

configFallbackValues.set('licencePlateProvinces', {})

configFallbackValues.set('mtoExportImport.authorizedUser', '')

configFallbackValues.set('databaseCleanup.windowDays', 30)

/*
 * Set up getProperty()
 */

export function getProperty(
  propertyName: 'activeDirectory'
): ConfigActiveDirectory

export function getProperty(
  propertyName:
    | 'application.applicationName'
    | 'application.logoURL'
    | 'application.userDomain'
    | 'session.cookieName'
    | 'session.secret'
    | 'defaults.country'
    | 'defaults.province'
    | 'parkingTickets.ticketNumber.fieldLabel'
    | 'mtoExportImport.authorizedUser'
): string

export function getProperty(
  propertyName:
    | 'application.httpPort'
    | 'application.maximumProcesses'
    | 'application.task_nhtsa.executeHour'
    | 'session.maxAgeMillis'
    | 'databaseCleanup.windowDays'
    | 'parkingTickets.updateWindowMillis'
): number

export function getProperty(
  propertyName:
    | 'application.useTestDatabases'
    | 'application.feature_mtoExportImport'
    | 'application.task_nhtsa.runTask'
    | 'session.doKeepAlive'
    | 'parkingTickets.licencePlateExpiryDate.includeDay'
    | 'parkingTickets.ticketNumber.isUnique'
): boolean

export function getProperty(
  propertyName:
    | 'parkingOffences.accountNumber.pattern'
    | 'parkingTickets.ticketNumber.pattern'
): RegExp

export function getProperty(
  propertyName: 'locationClasses'
): ConfigLocationClass[]

export function getProperty(
  propertyName: 'licencePlateCountryAliases'
): Record<string, string>

export function getProperty(
  propertyName: 'licencePlateProvinceAliases'
): Record<string, Record<string, string>>

export function getProperty(
  propertyName: 'licencePlateProvinces'
): Record<string, ConfigLicencePlateCountry>

export function getProperty(
  propertyName: 'parkingTickets.ticketNumber.nextTicketNumberFn'
): (currentTicketNumber: string) => string

export function getProperty(
  propertyName: 'parkingTicketStatuses'
): ConfigParkingTicketStatus[]

export function getProperty(
  propertyName:
    | 'users.testing'
    | 'users.canLogin'
    | 'users.canUpdate'
    | 'users.isAdmin'
    | 'users.isOperator'
): string[]

export function getProperty(propertyName: string): unknown {
  const propertyNameSplit = propertyName.split('.')

  let currentObject = config

  for (const propertyNamePiece of propertyNameSplit) {
    if (Object.hasOwn(currentObject, propertyNamePiece)) {
      currentObject = currentObject[propertyNamePiece]
    } else {
      return configFallbackValues.get(propertyName)
    }
  }

  return currentObject
}

export const keepAliveMillis = getProperty('session.doKeepAlive')
  ? Math.max(
      getProperty('session.maxAgeMillis') / 2,
      getProperty('session.maxAgeMillis') - 10 * 60 * 1000
    )
  : 0

const parkingTicketStatusMap = new Map<string, ConfigParkingTicketStatus>()
let parkingTicketStatusMapIsLoaded = false

export const getParkingTicketStatus = (
  statusKey: string
): ConfigParkingTicketStatus | undefined => {
  if (!parkingTicketStatusMapIsLoaded) {
    const parkingTicketStatusList = getProperty('parkingTicketStatuses')

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

export const getLicencePlateLocationProperties = (
  originalLicencePlateCountry: string,
  originalLicencePlateProvince: string
): LicencePlateLocationProperties => {
  const licencePlateProvinceDefault = {
    provinceShortName: originalLicencePlateProvince,
    color: '#000',
    backgroundColor: '#fff'
  }

  // Get the country alias

  const licencePlateCountryAlias: string = Object.hasOwn(
    getProperty('licencePlateCountryAliases'),
    originalLicencePlateCountry.toUpperCase()
  )
    ? getProperty('licencePlateCountryAliases')[
        originalLicencePlateCountry.toUpperCase()
      ]
    : originalLicencePlateCountry

  // Get the province alias

  let licencePlateProvinceAlias = originalLicencePlateProvince

  if (
    Object.hasOwn(
      getProperty('licencePlateProvinceAliases'),
      licencePlateCountryAlias
    )
  ) {
    licencePlateProvinceAlias =
      getProperty('licencePlateProvinceAliases')[licencePlateCountryAlias][
        originalLicencePlateProvince.toUpperCase()
      ] || originalLicencePlateProvince
  }

  // Get the province object

  let licencePlateProvince = licencePlateProvinceDefault

  if (
    Object.hasOwn(
      getProperty('licencePlateProvinces'),
      licencePlateCountryAlias
    )
  ) {
    licencePlateProvince =
      getProperty('licencePlateProvinces')[licencePlateCountryAlias].provinces[
        licencePlateProvinceAlias
      ] || licencePlateProvinceDefault
  }

  // Return

  return {
    licencePlateCountryAlias,
    licencePlateProvinceAlias,
    licencePlateProvince
  }
}
