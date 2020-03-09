"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = {};
try {
    exports.config = require("../data/config");
}
catch (e) {
    exports.config = {};
    console.log("No \"config.js\" found." +
        " To customize, create your own \"config.js\" in the \"data\" folder." +
        " See \"config-default.js\" to get started.");
}
const configFallbackValues = {
    "application.applicationName": "Parking Ticket System",
    "application.logoURL": "/images/noParking.png",
    "application.httpPort": 4000,
    "application.feature_mtoExportImport": false,
    "session.cookieName": "parking-ticket-system-user-sid",
    "session.secret": "cityssm/parking-ticket-system",
    "session.maxAgeMillis": 60 * 60 * 1000,
    "admin.defaultPassword": "",
    "user.createUpdateWindowMillis": 60 * 60 * 1000,
    "user.defaultProperties": {
        canCreate: false,
        canUpdate: false,
        isAdmin: false
    },
    "parkingTickets.ticketNumber.fieldLabel": "Ticket Number",
    "parkingTickets.ticketNumber.pattern": /^[\d\w -]{1,10}$/,
    "parkingTickets.ticketNumber.isUnique": true,
    "parkingTickets.ticketNumber.nextTicketNumberFn": function (currentTicketNumber) {
        return "";
    },
    "parkingTicketStatuses": [],
    "locationClasses": [],
    "licencePlateCountryAliases": {
        "CA": "Canada",
        "US": "USA"
    },
    "licencePlateProvinceAliases": {},
    "licencePlateProvinces": {}
};
function getProperty(propertyName) {
    const propertyNameSplit = propertyName.split(".");
    let currentObj = exports.config;
    for (let index = 0; index < propertyNameSplit.length; index += 1) {
        currentObj = currentObj[propertyNameSplit[index]];
        if (!currentObj) {
            return configFallbackValues[propertyName];
        }
    }
    return currentObj;
}
exports.getProperty = getProperty;
let parkingTicketStatusMap = {};
let parkingTicketStatusMapIsLoaded = false;
function getParkingTicketStatus(statusKey) {
    if (!parkingTicketStatusMapIsLoaded) {
        const parkingTicketStatusList = getProperty("parkingTicketStatuses");
        for (let index = 0; index < parkingTicketStatusList.length; index += 1) {
            const statusObj = parkingTicketStatusList[index];
            parkingTicketStatusMap[statusObj.statusKey] = statusObj;
        }
        parkingTicketStatusMapIsLoaded = true;
    }
    return parkingTicketStatusMap[statusKey];
}
exports.getParkingTicketStatus = getParkingTicketStatus;
function getLicencePlateLocationProperties(originalLicencePlateCountry, originalLicencePlateProvince) {
    const licencePlateProvinceDefault = {
        provinceShortName: originalLicencePlateProvince,
        color: "#000",
        backgroundColor: "#fff"
    };
    const licencePlateCountryAlias = getProperty("licencePlateCountryAliases")[originalLicencePlateCountry.toUpperCase()] ||
        originalLicencePlateCountry;
    let licencePlateProvinceAlias = originalLicencePlateProvince;
    if (getProperty("licencePlateProvinceAliases").hasOwnProperty(licencePlateCountryAlias)) {
        licencePlateProvinceAlias =
            getProperty("licencePlateProvinceAliases")[licencePlateCountryAlias][originalLicencePlateProvince.toUpperCase()] ||
                originalLicencePlateProvince;
    }
    let licencePlateProvince = licencePlateProvinceDefault;
    if (getProperty("licencePlateProvinces").hasOwnProperty(licencePlateCountryAlias)) {
        licencePlateProvince =
            getProperty("licencePlateProvinces")[licencePlateCountryAlias].provinces[licencePlateProvinceAlias] || licencePlateProvinceDefault;
    }
    return {
        licencePlateCountryAlias: licencePlateCountryAlias,
        licencePlateProvinceAlias: licencePlateProvinceAlias,
        licencePlateProvince: licencePlateProvince
    };
}
exports.getLicencePlateLocationProperties = getLicencePlateLocationProperties;
;
