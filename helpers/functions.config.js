import config from '../data/config.js';
const configFallbackValues = new Map();
configFallbackValues.set('application.applicationName', 'Parking Ticket System');
configFallbackValues.set('application.logoURL', '/images/noParking.svg');
configFallbackValues.set('application.httpPort', 4000);
configFallbackValues.set('application.userDomain', '');
configFallbackValues.set('application.useTestDatabases', false);
configFallbackValues.set('application.maximumProcesses', 4);
configFallbackValues.set('application.feature_mtoExportImport', false);
configFallbackValues.set('application.task_nhtsa.runTask', false);
configFallbackValues.set('application.task_nhtsa.executeHour', 2);
configFallbackValues.set('session.cookieName', 'parking-ticket-system-user-sid');
configFallbackValues.set('session.secret', 'cityssm/parking-ticket-system');
configFallbackValues.set('session.maxAgeMillis', 60 * 60 * 1000);
configFallbackValues.set('session.doKeepAlive', false);
configFallbackValues.set('users.testing', []);
configFallbackValues.set('users.canLogin', []);
configFallbackValues.set('users.canUpdate', []);
configFallbackValues.set('users.isAdmin', []);
configFallbackValues.set('users.isOperator', []);
configFallbackValues.set('defaults.country', '');
configFallbackValues.set('defaults.province', '');
configFallbackValues.set('parkingTickets.ticketNumber.fieldLabel', 'Ticket Number');
configFallbackValues.set('parkingTickets.ticketNumber.pattern', /^[\w -]{1,10}$/);
configFallbackValues.set('parkingTickets.ticketNumber.isUnique', true);
configFallbackValues.set('parkingTickets.ticketNumber.nextTicketNumberFn', () => {
    return '';
});
configFallbackValues.set('parkingTickets.updateWindowMillis', 3 * 86400 * 1000);
configFallbackValues.set('parkingTickets.licencePlateExpiryDate.includeDay', false);
configFallbackValues.set('parkingTicketStatuses', []);
configFallbackValues.set('parkingOffences.accountNumber.pattern', /^[\w -]{1,20}$/);
configFallbackValues.set('locationClasses', []);
configFallbackValues.set('licencePlateCountryAliases', Object.freeze({
    CA: 'Canada',
    US: 'USA'
}));
configFallbackValues.set('licencePlateProvinceAliases', {});
configFallbackValues.set('licencePlateProvinces', {});
configFallbackValues.set('mtoExportImport.authorizedUser', '');
configFallbackValues.set('databaseCleanup.windowDays', 30);
export function getConfigProperty(propertyName) {
    const propertyNameSplit = propertyName.split('.');
    let currentObject = config;
    for (const propertyNamePiece of propertyNameSplit) {
        if (Object.hasOwn(currentObject, propertyNamePiece)) {
            currentObject = currentObject[propertyNamePiece];
        }
        else {
            return configFallbackValues.get(propertyName);
        }
    }
    return currentObject;
}
export const keepAliveMillis = getConfigProperty('session.doKeepAlive')
    ? Math.max(getConfigProperty('session.maxAgeMillis') / 2, getConfigProperty('session.maxAgeMillis') - 10 * 60 * 1000)
    : 0;
const parkingTicketStatusMap = new Map();
let parkingTicketStatusMapIsLoaded = false;
export const getParkingTicketStatus = (statusKey) => {
    if (!parkingTicketStatusMapIsLoaded) {
        const parkingTicketStatusList = getConfigProperty('parkingTicketStatuses');
        for (const parkingTicketStatusObject of parkingTicketStatusList) {
            parkingTicketStatusMap.set(parkingTicketStatusObject.statusKey, parkingTicketStatusObject);
        }
        parkingTicketStatusMapIsLoaded = true;
    }
    return parkingTicketStatusMap.get(statusKey);
};
export const getLicencePlateLocationProperties = (originalLicencePlateCountry, originalLicencePlateProvince) => {
    const licencePlateProvinceDefault = {
        provinceShortName: originalLicencePlateProvince,
        color: '#000',
        backgroundColor: '#fff'
    };
    const licencePlateCountryAlias = Object.hasOwn(getConfigProperty('licencePlateCountryAliases'), originalLicencePlateCountry.toUpperCase())
        ? getConfigProperty('licencePlateCountryAliases')[originalLicencePlateCountry.toUpperCase()]
        : originalLicencePlateCountry;
    let licencePlateProvinceAlias = originalLicencePlateProvince;
    if (Object.hasOwn(getConfigProperty('licencePlateProvinceAliases'), licencePlateCountryAlias)) {
        licencePlateProvinceAlias =
            getConfigProperty('licencePlateProvinceAliases')[licencePlateCountryAlias][originalLicencePlateProvince.toUpperCase()] || originalLicencePlateProvince;
    }
    let licencePlateProvince = licencePlateProvinceDefault;
    if (Object.hasOwn(getConfigProperty('licencePlateProvinces'), licencePlateCountryAlias)) {
        licencePlateProvince =
            getConfigProperty('licencePlateProvinces')[licencePlateCountryAlias].provinces[licencePlateProvinceAlias] || licencePlateProvinceDefault;
    }
    return {
        licencePlateCountryAlias,
        licencePlateProvinceAlias,
        licencePlateProvince
    };
};
