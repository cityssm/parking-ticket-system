export const configDefaultValues = {
    activeDirectory: undefined,
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
    'users.testing': [],
    'users.canLogin': [],
    'users.canUpdate': [],
    'users.isAdmin': [],
    'users.isOperator': [],
    'defaults.country': '',
    'defaults.province': '',
    'parkingTickets.ticketNumber.fieldLabel': 'Ticket Number',
    'parkingTickets.ticketNumber.pattern': /^[\w -]{1,10}$/,
    'parkingTickets.ticketNumber.isUnique': true,
    'parkingTickets.ticketNumber.nextTicketNumberFn': (() => {
        return '';
    }),
    'parkingTickets.updateWindowMillis': 3 * 86400 * 1000,
    'parkingTickets.licencePlateExpiryDate.includeDay': false,
    parkingTicketStatuses: [],
    'parkingOffences.accountNumber.pattern': /^[\w -]{1,20}$/,
    locationClasses: [],
    licencePlateCountryAliases: Object.freeze({
        CA: 'Canada',
        US: 'USA'
    }),
    licencePlateProvinceAliases: {},
    licencePlateProvinces: {},
    'mtoExportImport.authorizedUser': '',
    'databaseCleanup.windowDays': 30
};