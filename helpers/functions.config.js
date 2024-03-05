import { Configurator } from '@cityssm/configurator';
import config from '../data/config.js';
import { configDefaultValues } from '../data/configDefaultValues.js';
const configurator = new Configurator(configDefaultValues, config);
export function getConfigProperty(propertyName, fallbackValue) {
    return configurator.getConfigProperty(propertyName, fallbackValue);
}
export const keepAliveMillis = getConfigProperty('session.doKeepAlive')
    ? Math.max(getConfigProperty('session.maxAgeMillis') / 2, getConfigProperty('session.maxAgeMillis') - 10 * 60 * 1000)
    : 0;
const parkingTicketStatusMap = new Map();
let parkingTicketStatusMapIsLoaded = false;
export function getParkingTicketStatus(statusKey) {
    if (!parkingTicketStatusMapIsLoaded) {
        const parkingTicketStatusList = getConfigProperty('parkingTicketStatuses');
        for (const parkingTicketStatusObject of parkingTicketStatusList) {
            parkingTicketStatusMap.set(parkingTicketStatusObject.statusKey, parkingTicketStatusObject);
        }
        parkingTicketStatusMapIsLoaded = true;
    }
    return parkingTicketStatusMap.get(statusKey);
}
export function getLicencePlateLocationProperties(originalLicencePlateCountry, originalLicencePlateProvince) {
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
            getConfigProperty('licencePlateProvinceAliases')[licencePlateCountryAlias][originalLicencePlateProvince.toUpperCase()] ||
                originalLicencePlateProvince;
    }
    let licencePlateProvince = licencePlateProvinceDefault;
    if (Object.hasOwn(getConfigProperty('licencePlateProvinces'), licencePlateCountryAlias)) {
        licencePlateProvince =
            getConfigProperty('licencePlateProvinces')[licencePlateCountryAlias]
                .provinces[licencePlateProvinceAlias] || licencePlateProvinceDefault;
    }
    return {
        licencePlateCountryAlias,
        licencePlateProvinceAlias,
        licencePlateProvince
    };
}
export default {
    getConfigProperty,
    keepAliveMillis,
    getParkingTicketStatus,
    getLicencePlateLocationProperties
};
