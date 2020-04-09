import * as pts from "../helpers/ptsTypes";

/*
 * LOAD CONFIGURATION
 */

export let config = {};

try {

  config = require("../data/config");

} catch (e) {

  config = {};

  console.log("No \"config.js\" found." +
    " To customize, create your own \"config.js\" in the \"data\" folder." +
    " See \"config-default.js\" to get started.");

}

Object.freeze(config);


/*
 * SET UP FALLBACK VALUES
 */

const configFallbackValues = new Map<string, any>();

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
  isAdmin: false,
  isOperator: false
}));

configFallbackValues.set("parkingTickets.ticketNumber.fieldLabel", "Ticket Number");
configFallbackValues.set("parkingTickets.ticketNumber.pattern", /^[\d\w -]{1,10}$/);
configFallbackValues.set("parkingTickets.ticketNumber.isUnique", true);
configFallbackValues.set("parkingTickets.ticketNumber.nextTicketNumberFn", function(currentTicketNumber: string) {
  return "";
});

configFallbackValues.set("parkingTicketStatuses", []);

configFallbackValues.set("parkingOffences.accountNumber.pattern", /^[\d\w -]{1,20}$/);

configFallbackValues.set("locationClasses", []);

configFallbackValues.set("licencePlateCountryAliases", Object.freeze({
  "CA": "Canada",
  "US": "USA"
}));

configFallbackValues.set("licencePlateProvinceAliases", {});

configFallbackValues.set("licencePlateProvinces", {});

configFallbackValues.set("config.mtoExportImport.authorizedUser", "");


export function getProperty(propertyName: string): any {

  const propertyNameSplit = propertyName.split(".");

  let currentObj = config;

  for (let index = 0; index < propertyNameSplit.length; index += 1) {

    currentObj = currentObj[propertyNameSplit[index]];

    if (!currentObj) {
      return configFallbackValues.get(propertyName);
    }

  }

  return currentObj;

}

let parkingTicketStatusMap = new Map<string, pts.Config_ParkingTicketStatus>();
let parkingTicketStatusMapIsLoaded = false;

export function getParkingTicketStatus(statusKey: string) {

  if (!parkingTicketStatusMapIsLoaded) {

    const parkingTicketStatusList: pts.Config_ParkingTicketStatus[] = getProperty("parkingTicketStatuses");

    for (let index = 0; index < parkingTicketStatusList.length; index += 1) {

      const statusObj = parkingTicketStatusList[index];
      parkingTicketStatusMap.set(statusObj.statusKey, statusObj);

    }

    parkingTicketStatusMapIsLoaded = true;

  }

  return parkingTicketStatusMap.get(statusKey);

}


export function getLicencePlateLocationProperties(originalLicencePlateCountry: string, originalLicencePlateProvince: string) {

  const licencePlateProvinceDefault = {
    provinceShortName: originalLicencePlateProvince,
    color: "#000",
    backgroundColor: "#fff"
  };

  // Get the country alias

  const licencePlateCountryAlias: string =
    getProperty("licencePlateCountryAliases")[originalLicencePlateCountry.toUpperCase()] ||
    originalLicencePlateCountry;

  // Get the province alias

  let licencePlateProvinceAlias = originalLicencePlateProvince;

  if (getProperty("licencePlateProvinceAliases").hasOwnProperty(licencePlateCountryAlias)) {

    licencePlateProvinceAlias =
      getProperty("licencePlateProvinceAliases")[licencePlateCountryAlias][originalLicencePlateProvince.toUpperCase()] ||
      originalLicencePlateProvince;

  }

  // Get the province object

  let licencePlateProvince = licencePlateProvinceDefault;

  if (getProperty("licencePlateProvinces").hasOwnProperty(licencePlateCountryAlias)) {

    licencePlateProvince =
      getProperty("licencePlateProvinces")[licencePlateCountryAlias].provinces[licencePlateProvinceAlias] || licencePlateProvinceDefault;

  }

  // Return

  return {
    licencePlateCountryAlias: licencePlateCountryAlias,
    licencePlateProvinceAlias: licencePlateProvinceAlias,
    licencePlateProvince: licencePlateProvince
  };

};
