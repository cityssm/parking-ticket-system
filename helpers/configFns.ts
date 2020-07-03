import type * as pts from "../helpers/ptsTypes";

/*
 * LOAD CONFIGURATION
 */

import * as config from "../data/config";


/*
 * SET UP FALLBACK VALUES
 */

// tslint:disable-next-line:no-any
const configFallbackValues = new Map<string, any>();

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

configFallbackValues.set("parkingTickets.ticketNumber.fieldLabel", "Ticket Number");
configFallbackValues.set("parkingTickets.ticketNumber.pattern", /^[\d\w -]{1,10}$/);
configFallbackValues.set("parkingTickets.ticketNumber.isUnique", true);
configFallbackValues.set("parkingTickets.ticketNumber.nextTicketNumberFn", (_currentTicketNumber: string) => {
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


/*
 * Set up getProperty()
 */


type PropertyName =
  "admin.defaultPassword" |

  "application.applicationName" |
  "application.logoURL" |
  "application.httpPort" |
  "application.https" |

  "databaseCleanup.windowDays" |

  "defaults.country" |
  "defaults.province" |

  "licencePlateCountryAliases" |
  "licencePlateProvinceAliases" |
  "licencePlateProvinces" |
  "locationClasses" |

  "parkingOffences.accountNumber.pattern" |

  "parkingTickets.licencePlateExpiryDate.includeDay" |

  "parkingTickets.ticketNumber.fieldLabel" |
  "parkingTickets.ticketNumber.isUnique" |
  "parkingTickets.ticketNumber.nextTicketNumberFn" |
  "parkingTickets.ticketNumber.pattern" |

  "parkingTicketStatuses" |

  "session.cookieName" |
  "session.doKeepAlive" |
  "session.maxAgeMillis" |
  "session.secret" |

  "user.createUpdateWindowMillis" |
  "user.defaultProperties" |

  "application.feature_mtoExportImport" |
  "mtoExportImport.authorizedUser" |

  "application.task_nhtsa.runTask" |
  "application.task_nhtsa.executeHour";


export function getProperty(propertyName: "admin.defaultPassword"): string;

export function getProperty(propertyName: "application.applicationName"): string;
export function getProperty(propertyName: "application.logoURL"): string;
export function getProperty(propertyName: "application.httpPort"): number;

export function getProperty(propertyName: "application.https"): pts.ConfigHttpsConfig;

export function getProperty(propertyName: "databaseCleanup.windowDays"): number;

export function getProperty(propertyName: "defaults.country"): string;
export function getProperty(propertyName: "defaults.province"): string;

export function getProperty(propertyName: "locationClasses"): pts.ConfigLocationClass[];
export function getProperty(propertyName: "licencePlateCountryAliases"): { [countryShortName: string]: string };
export function getProperty(propertyName: "licencePlateProvinceAliases"): { [countryName: string]: { [provinceShortName: string]: string } };
export function getProperty(propertyName: "licencePlateProvinces"): { [countryName: string]: pts.ConfigLicencePlateCountry };

export function getProperty(propertyName: "parkingOffences.accountNumber.pattern"): RegExp;

export function getProperty(propertyName: "parkingTickets.licencePlateExpiryDate.includeDay"): boolean;

export function getProperty(propertyName: "parkingTickets.ticketNumber.fieldLabel"): string;
export function getProperty(propertyName: "parkingTickets.ticketNumber.isUnique"): boolean;
export function getProperty(propertyName: "parkingTickets.ticketNumber.nextTicketNumberFn"): (currentTicketNumber: string) => string;
export function getProperty(propertyName: "parkingTickets.ticketNumber.pattern"): RegExp;

export function getProperty(propertyName: "parkingTicketStatuses"): pts.ConfigParkingTicketStatus[];

export function getProperty(propertyName: "session.cookieName"): string;
export function getProperty(propertyName: "session.doKeepAlive"): boolean;
export function getProperty(propertyName: "session.maxAgeMillis"): number;
export function getProperty(propertyName: "session.secret"): string;

export function getProperty(propertyName: "user.createUpdateWindowMillis"): number;
export function getProperty(propertyName: "user.defaultProperties"): pts.UserProperties;

export function getProperty(propertyName: "application.feature_mtoExportImport"): boolean;
export function getProperty(propertyName: "mtoExportImport.authorizedUser"): string;

export function getProperty(propertyName: "application.task_nhtsa.runTask"): boolean;
export function getProperty(propertyName: "application.task_nhtsa.executeHour"): number;


export function getProperty(propertyName: PropertyName) {

  const propertyNameSplit = propertyName.split(".");

  let currentObj = config;

  for (const propertyNamePiece of propertyNameSplit) {

    if (currentObj.hasOwnProperty(propertyNamePiece)) {
      currentObj = currentObj[propertyNamePiece];

    } else {
      return configFallbackValues.get(propertyName);
    }
  }

  return currentObj;
}


export const keepAliveMillis =
  getProperty("session.doKeepAlive")
    ? Math.max(
      getProperty("session.maxAgeMillis") / 2,
      getProperty("session.maxAgeMillis") - (10 * 60 * 1000)
    )
    : 0;


const parkingTicketStatusMap = new Map<string, pts.ConfigParkingTicketStatus>();
let parkingTicketStatusMapIsLoaded = false;

export const getParkingTicketStatus = (statusKey: string) => {

  if (!parkingTicketStatusMapIsLoaded) {

    const parkingTicketStatusList = getProperty("parkingTicketStatuses");

    for (const parkingTicketStatusObj of parkingTicketStatusList) {
      parkingTicketStatusMap.set(parkingTicketStatusObj.statusKey, parkingTicketStatusObj);
    }

    parkingTicketStatusMapIsLoaded = true;
  }

  return parkingTicketStatusMap.get(statusKey);
};


export const getLicencePlateLocationProperties =
  (originalLicencePlateCountry: string, originalLicencePlateProvince: string) => {

    const licencePlateProvinceDefault = {
      provinceShortName: originalLicencePlateProvince,
      color: "#000",
      backgroundColor: "#fff"
    };

    // Get the country alias

    const licencePlateCountryAlias: string =

      getProperty("licencePlateCountryAliases").hasOwnProperty(originalLicencePlateCountry.toUpperCase())
        ? getProperty("licencePlateCountryAliases")[originalLicencePlateCountry.toUpperCase()]
        : originalLicencePlateCountry;

    // Get the province alias

    let licencePlateProvinceAlias = originalLicencePlateProvince;

    if (getProperty("licencePlateProvinceAliases").hasOwnProperty(licencePlateCountryAlias)) {

      licencePlateProvinceAlias =
        getProperty("licencePlateProvinceAliases")
        [licencePlateCountryAlias][originalLicencePlateProvince.toUpperCase()] ||
        originalLicencePlateProvince;

    }

    // Get the province object

    let licencePlateProvince = licencePlateProvinceDefault;

    if (getProperty("licencePlateProvinces").hasOwnProperty(licencePlateCountryAlias)) {

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
