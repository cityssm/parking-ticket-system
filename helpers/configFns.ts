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


/*
 * SET UP FALLBACK VALUES
 */

const configFallbackValues = {

  "application.applicationName": "Parking Ticket System",
  "application.logoURL": "/images/noParking.png",
  "application.httpPort": 4000,

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

  "parkingTicketStatuses": [],

  "locationClasses": [],

  "licencePlateCountryAliases" : {
    "CA": "Canada",
    "US": "USA"
  },

  "licencePlateProvinceAliases": {},

  "licencePlateProvinces": {}
};

export function getProperty(propertyName: string): any {

  const propertyNameSplit = propertyName.split(".");

  let currentObj = config;

  for (let index = 0; index < propertyNameSplit.length; index += 1) {

    currentObj = currentObj[propertyNameSplit[index]];

    if (!currentObj) {

      return configFallbackValues[propertyName];

    }

  }

  return currentObj;

}

let parkingTicketStatusMap = {};
let parkingTicketStatusMapIsLoaded = false;

export function getParkingTicketStatus(statusKey: string) {

  if (!parkingTicketStatusMapIsLoaded) {

    const parkingTicketStatusList : pts.Config_ParkingTicketStatus[] = getProperty("parkingTicketStatuses");

    for (let index = 0; index < parkingTicketStatusList.length; index += 1) {

      const statusObj = parkingTicketStatusList[index];
      parkingTicketStatusMap[statusObj.statusKey] = statusObj;

    }

    parkingTicketStatusMapIsLoaded = true;

  }

  return parkingTicketStatusMap[statusKey];

}
