// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import type {
  ConfigActiveDirectory,
  ConfigLicencePlateCountry,
  ConfigLocationClass,
  ConfigParkingTicketStatus
} from '../types/configTypes.js'

export const configDefaultValues = {
  activeDirectory: undefined as unknown as ConfigActiveDirectory,

  'application.applicationName': 'Parking Ticket System',
  'application.logoURL': '/images/noParking.svg',
  'application.httpPort': 4000,
  'application.userDomain': '',
  'application.useTestDatabases': false,
  'application.maximumProcesses': 4,

  'application.feature_mtoExportImport': false,

  'application.task_nhtsa.runTask': false,
  'application.task_nhtsa.executeHour': 2,

  'reverseProxy.disableCompression': false,
  'reverseProxy.disableEtag': false,
  'reverseProxy.urlPrefix': '',

  'session.cookieName': 'parking-ticket-system-user-sid',
  'session.secret': 'cityssm/parking-ticket-system',
  'session.maxAgeMillis': 60 * 60 * 1000,
  'session.doKeepAlive': false,

  'users.testing': [] as string[],
  'users.canLogin': [] as string[],
  'users.canUpdate': [] as string[],
  'users.isAdmin': [] as string[],
  'users.isOperator': [] as string[],

  'defaults.country': '',
  'defaults.province': '',

  'parkingTickets.ticketNumber.fieldLabel': 'Ticket Number',

  'parkingTickets.ticketNumber.pattern': /^[\w -]{1,10}$/,

  'parkingTickets.ticketNumber.isUnique': true,

  'parkingTickets.ticketNumber.nextTicketNumberFn': (() => {
    return ''
  }) as (currentTicketNumber: string) => string,

  'parkingTickets.updateWindowMillis': 3 * 86_400 * 1000,

  'parkingTickets.licencePlateExpiryDate.includeDay': false,

  parkingTicketStatuses: [] as ConfigParkingTicketStatus[],

  'parkingOffences.accountNumber.pattern': /^[\w -]{1,20}$/,

  locationClasses: [] as ConfigLocationClass[],

  licencePlateCountryAliases: Object.freeze({
    CA: 'Canada',
    US: 'USA'
  }) as Record<string, string>,

  licencePlateProvinceAliases: {} satisfies Record<
    string,
    Record<string, string>
  >,

  licencePlateProvinces: {} satisfies Record<string, ConfigLicencePlateCountry>,

  'mtoExportImport.authorizedUser': '',

  'databaseCleanup.windowDays': 30
}
