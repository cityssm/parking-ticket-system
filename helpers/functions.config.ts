/* eslint-disable no-redeclare */

// eslint-disable-next-line node/no-unpublished-import
import config from "../data/config.js";

import type * as configTypes from "../types/configTypes";
import type * as recordTypes from "../types/recordTypes";


/*
 * SET UP FALLBACK VALUES
 */

const configFallbackValues = new Map<string, unknown>();

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
configFallbackValues.set("parkingTickets.ticketNumber.pattern", /^[\w -]{1,10}$/);
configFallbackValues.set("parkingTickets.ticketNumber.isUnique", true);
configFallbackValues.set("parkingTickets.ticketNumber.nextTicketNumberFn", () => {
  return "";
});

configFallbackValues.set("parkingTickets.licencePlateExpiryDate.includeDay", false);

configFallbackValues.set("parkingTicketStatuses", []);

configFallbackValues.set("parkingOffences.accountNumber.pattern", /^[\w -]{1,20}$/);

configFallbackValues.set("locationClasses", []);

configFallbackValues.set("licencePlateCountryAliases", Object.freeze({
  CA: "Canada",
  US: "USA"
}));

configFallbackValues.set("licencePlateProvinceAliases", {});

configFallbackValues.set("licencePlateProvinces", {});

configFallbackValues.set("mtoExportImport.authorizedUser", "");

configFallbackValues.set("databaseCleanup.windowDays", 30);


/*
 * Set up getProperty()
 */


export function getProperty(propertyName: "admin.defaultPassword"): string;

export function getProperty(propertyName: "application.applicationName"): string;
export function getProperty(propertyName: "application.logoURL"): string;
export function getProperty(propertyName: "application.httpPort"): number;

export function getProperty(propertyName: "application.https"): configTypes.ConfigHttpsConfig | null;

export function getProperty(propertyName: "databaseCleanup.windowDays"): number;

export function getProperty(propertyName: "defaults.country"): string;
export function getProperty(propertyName: "defaults.province"): string;

export function getProperty(propertyName: "locationClasses"): configTypes.ConfigLocationClass[];
export function getProperty(propertyName: "licencePlateCountryAliases"): { [countryShortName: string]: string };
export function getProperty(propertyName: "licencePlateProvinceAliases"): { [countryName: string]: { [provinceShortName: string]: string } };
export function getProperty(propertyName: "licencePlateProvinces"): { [countryName: string]: configTypes.ConfigLicencePlateCountry };

export function getProperty(propertyName: "parkingOffences.accountNumber.pattern"): RegExp;

export function getProperty(propertyName: "parkingTickets.licencePlateExpiryDate.includeDay"): boolean;

export function getProperty(propertyName: "parkingTickets.ticketNumber.fieldLabel"): string;
export function getProperty(propertyName: "parkingTickets.ticketNumber.isUnique"): boolean;
export function getProperty(propertyName: "parkingTickets.ticketNumber.nextTicketNumberFn"): (currentTicketNumber: string) => string;
export function getProperty(propertyName: "parkingTickets.ticketNumber.pattern"): RegExp;

export function getProperty(propertyName: "parkingTicketStatuses"): configTypes.ConfigParkingTicketStatus[];

export function getProperty(propertyName: "session.cookieName"): string;
export function getProperty(propertyName: "session.doKeepAlive"): boolean;
export function getProperty(propertyName: "session.maxAgeMillis"): number;
export function getProperty(propertyName: "session.secret"): string;

export function getProperty(propertyName: "user.createUpdateWindowMillis"): number;
export function getProperty(propertyName: "user.defaultProperties"): recordTypes.UserProperties;

export function getProperty(propertyName: "application.feature_mtoExportImport"): boolean;
export function getProperty(propertyName: "mtoExportImport.authorizedUser"): string;

export function getProperty(propertyName: "application.task_nhtsa.runTask"): boolean;
export function getProperty(propertyName: "application.task_nhtsa.executeHour"): number;


export function getProperty(propertyName: string): unknown {

  const propertyNameSplit = propertyName.split(".");

  let currentObject = config;

  for (const propertyNamePiece of propertyNameSplit) {

    if (Object.prototype.hasOwnProperty.call(currentObject, propertyNamePiece)) {
      currentObject = currentObject[propertyNamePiece];

    } else {
      return configFallbackValues.get(propertyName);
    }
  }

  return currentObject;
}


export const keepAliveMillis =
  getProperty("session.doKeepAlive")
    ? Math.max(
      getProperty("session.maxAgeMillis") / 2,
      getProperty("session.maxAgeMillis") - (10 * 60 * 1000)
    )
    : 0;


const parkingTicketStatusMap = new Map<string, configTypes.ConfigParkingTicketStatus>();
let parkingTicketStatusMapIsLoaded = false;

export const getParkingTicketStatus = (statusKey: string): configTypes.ConfigParkingTicketStatus => {

  if (!parkingTicketStatusMapIsLoaded) {

    const parkingTicketStatusList = getProperty("parkingTicketStatuses");

    for (const parkingTicketStatusObject of parkingTicketStatusList) {
      parkingTicketStatusMap.set(parkingTicketStatusObject.statusKey, parkingTicketStatusObject);
    }

    parkingTicketStatusMapIsLoaded = true;
  }

  return parkingTicketStatusMap.get(statusKey);
};

interface LicencePlateLocationProperties {
  licencePlateCountryAlias: string;
  licencePlateProvinceAlias: string;
  licencePlateProvince: {
    provinceShortName: string;
    color: string;
    backgroundColor: string;
  };
}

export const getLicencePlateLocationProperties =
  (originalLicencePlateCountry: string, originalLicencePlateProvince: string): LicencePlateLocationProperties => {

    const licencePlateProvinceDefault = {
      provinceShortName: originalLicencePlateProvince,
      color: "#000",
      backgroundColor: "#fff"
    };

    // Get the country alias

    const licencePlateCountryAlias: string =
      Object.prototype.hasOwnProperty.call(getProperty("licencePlateCountryAliases"), originalLicencePlateCountry.toUpperCase())
        ? getProperty("licencePlateCountryAliases")[originalLicencePlateCountry.toUpperCase()]
        : originalLicencePlateCountry;

    // Get the province alias

    let licencePlateProvinceAlias = originalLicencePlateProvince;

    if (Object.prototype.hasOwnProperty.call(getProperty("licencePlateProvinceAliases"), licencePlateCountryAlias)) {

      licencePlateProvinceAlias =
        getProperty("licencePlateProvinceAliases")[licencePlateCountryAlias][originalLicencePlateProvince.toUpperCase()] ||
        originalLicencePlateProvince;

    }

    // Get the province object

    let licencePlateProvince = licencePlateProvinceDefault;

    if (Object.prototype.hasOwnProperty.call(getProperty("licencePlateProvinces"), licencePlateCountryAlias)) {

      licencePlateProvince =
        getProperty("licencePlateProvinces")[licencePlateCountryAlias].provinces[licencePlateProvinceAlias] ||
        licencePlateProvinceDefault;

    }

    // Return

    return {
      licencePlateCountryAlias,
      licencePlateProvinceAlias,
      licencePlateProvince
    };

  };
