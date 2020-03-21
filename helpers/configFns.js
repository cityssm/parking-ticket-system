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
Object.freeze(exports.config);
const configFallbackValues = new Map();
configFallbackValues.set("application.applicationName", "Parking Ticket System");
configFallbackValues.set("application.logoURL", "/images/noParking.svg");
configFallbackValues.set("application.httpPort", 4000);
configFallbackValues.set("application.feature_mtoExportImport", false);
configFallbackValues.set("application.task_nhtsa.runTask", false);
configFallbackValues.set("session.cookieName", "parking-ticket-system-user-sid");
configFallbackValues.set("session.secret", "cityssm/parking-ticket-system");
configFallbackValues.set("session.maxAgeMillis", 60 * 60 * 1000);
configFallbackValues.set("admin.defaultPassword", "");
configFallbackValues.set("user.createUpdateWindowMillis", 60 * 60 * 1000);
configFallbackValues.set("user.defaultProperties", Object.freeze({
    canCreate: false,
    canUpdate: false,
    isAdmin: false
}));
configFallbackValues.set("parkingTickets.ticketNumber.fieldLabel", "Ticket Number");
configFallbackValues.set("parkingTickets.ticketNumber.pattern", /^[\d\w -]{1,10}$/);
configFallbackValues.set("parkingTickets.ticketNumber.isUnique", true);
configFallbackValues.set("parkingTickets.ticketNumber.nextTicketNumberFn", function (currentTicketNumber) {
    return "";
});
configFallbackValues.set("parkingTicketStatuses", []);
configFallbackValues.set("locationClasses", []);
configFallbackValues.set("licencePlateCountryAliases", Object.freeze({
    "CA": "Canada",
    "US": "USA"
}));
configFallbackValues.set("licencePlateProvinceAliases", {});
configFallbackValues.set("licencePlateProvinces", {});
function getProperty(propertyName) {
    const propertyNameSplit = propertyName.split(".");
    let currentObj = exports.config;
    for (let index = 0; index < propertyNameSplit.length; index += 1) {
        currentObj = currentObj[propertyNameSplit[index]];
        if (!currentObj) {
            return configFallbackValues.get(propertyName);
        }
    }
    return currentObj;
}
exports.getProperty = getProperty;
let parkingTicketStatusMap = new Map();
let parkingTicketStatusMapIsLoaded = false;
function getParkingTicketStatus(statusKey) {
    if (!parkingTicketStatusMapIsLoaded) {
        const parkingTicketStatusList = getProperty("parkingTicketStatuses");
        for (let index = 0; index < parkingTicketStatusList.length; index += 1) {
            const statusObj = parkingTicketStatusList[index];
            parkingTicketStatusMap.set(statusObj.statusKey, statusObj);
        }
        parkingTicketStatusMapIsLoaded = true;
    }
    return parkingTicketStatusMap.get(statusKey);
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
