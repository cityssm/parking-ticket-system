import config from "../data/config.js";
const configFallbackValues = new Map();
configFallbackValues.set("application.applicationName", "Parking Ticket System");
configFallbackValues.set("application.logoURL", "/images/noParking.svg");
configFallbackValues.set("application.httpPort", 4000);
configFallbackValues.set("application.feature_mtoExportImport", false);
configFallbackValues.set("application.task_nhtsa.runTask", false);
configFallbackValues.set("application.task_nhtsa.executeHour", 2);
configFallbackValues.set("session.cookieName", "parking-ticket-system-user-sid");
configFallbackValues.set("session.secret", "cityssm/parking-ticket-system");
configFallbackValues.set("session.maxAgeMillis", 60 * 60 * 1000);
configFallbackValues.set("session.doKeepAlive", false);
configFallbackValues.set("admin.defaultPassword", "");
configFallbackValues.set("user.createUpdateWindowMillis", 60 * 60 * 1000);
configFallbackValues.set("user.defaultProperties", Object.freeze({
    canCreate: false,
    canUpdate: false,
    isAdmin: false,
    isOperator: false
}));
configFallbackValues.set("defaults.country", "");
configFallbackValues.set("defaults.province", "");
configFallbackValues.set("parkingTickets.ticketNumber.fieldLabel", "Ticket Number");
configFallbackValues.set("parkingTickets.ticketNumber.pattern", /^[\d\w -]{1,10}$/);
configFallbackValues.set("parkingTickets.ticketNumber.isUnique", true);
configFallbackValues.set("parkingTickets.ticketNumber.nextTicketNumberFn", (_currentTicketNumber) => {
    return "";
});
configFallbackValues.set("parkingTickets.licencePlateExpiryDate.includeDay", false);
configFallbackValues.set("parkingTicketStatuses", []);
configFallbackValues.set("parkingOffences.accountNumber.pattern", /^[\d\w -]{1,20}$/);
configFallbackValues.set("locationClasses", []);
configFallbackValues.set("licencePlateCountryAliases", Object.freeze({
    CA: "Canada",
    US: "USA"
}));
configFallbackValues.set("licencePlateProvinceAliases", {});
configFallbackValues.set("licencePlateProvinces", {});
configFallbackValues.set("mtoExportImport.authorizedUser", "");
configFallbackValues.set("databaseCleanup.windowDays", 30);
export function getProperty(propertyName) {
    const propertyNameSplit = propertyName.split(".");
    let currentObj = config;
    for (const propertyNamePiece of propertyNameSplit) {
        if (currentObj.hasOwnProperty(propertyNamePiece)) {
            currentObj = currentObj[propertyNamePiece];
        }
        else {
            return configFallbackValues.get(propertyName);
        }
    }
    return currentObj;
}
export const keepAliveMillis = getProperty("session.doKeepAlive")
    ? Math.max(getProperty("session.maxAgeMillis") / 2, getProperty("session.maxAgeMillis") - (10 * 60 * 1000))
    : 0;
const parkingTicketStatusMap = new Map();
let parkingTicketStatusMapIsLoaded = false;
export const getParkingTicketStatus = (statusKey) => {
    if (!parkingTicketStatusMapIsLoaded) {
        const parkingTicketStatusList = getProperty("parkingTicketStatuses");
        for (const parkingTicketStatusObj of parkingTicketStatusList) {
            parkingTicketStatusMap.set(parkingTicketStatusObj.statusKey, parkingTicketStatusObj);
        }
        parkingTicketStatusMapIsLoaded = true;
    }
    return parkingTicketStatusMap.get(statusKey);
};
export const getLicencePlateLocationProperties = (originalLicencePlateCountry, originalLicencePlateProvince) => {
    const licencePlateProvinceDefault = {
        provinceShortName: originalLicencePlateProvince,
        color: "#000",
        backgroundColor: "#fff"
    };
    const licencePlateCountryAlias = getProperty("licencePlateCountryAliases").hasOwnProperty(originalLicencePlateCountry.toUpperCase())
        ? getProperty("licencePlateCountryAliases")[originalLicencePlateCountry.toUpperCase()]
        : originalLicencePlateCountry;
    let licencePlateProvinceAlias = originalLicencePlateProvince;
    if (getProperty("licencePlateProvinceAliases").hasOwnProperty(licencePlateCountryAlias)) {
        licencePlateProvinceAlias =
            getProperty("licencePlateProvinceAliases")[licencePlateCountryAlias][originalLicencePlateProvince.toUpperCase()] ||
                originalLicencePlateProvince;
    }
    let licencePlateProvince = licencePlateProvinceDefault;
    if (getProperty("licencePlateProvinces").hasOwnProperty(licencePlateCountryAlias)) {
        licencePlateProvince =
            getProperty("licencePlateProvinces")[licencePlateCountryAlias].provinces[licencePlateProvinceAlias] ||
                licencePlateProvinceDefault;
    }
    return {
        licencePlateCountryAlias,
        licencePlateProvinceAlias,
        licencePlateProvince
    };
};
