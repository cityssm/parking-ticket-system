import sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as configFunctions from "../functions.config.js";
import * as vehicleFunctions from "../functions.vehicle.js";
import type * as pts from "../../types/recordTypes";

import { parkingDB as databasePath } from "../../data/databasePaths.js";


export const getLicencePlateOwnerWithDB =
  (database: sqlite.Database,
    licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string,
    recordDateOrBefore: number): pts.LicencePlateOwner => {

    const licencePlateCountryAlias =
      configFunctions.getProperty("licencePlateCountryAliases")[licencePlateCountry] || licencePlateCountry;

    const licencePlateProvinceAlias =
      (configFunctions.getProperty("licencePlateProvinceAliases")[licencePlateCountryAlias] || {})[licencePlateProvince] || licencePlateProvince;

    const possibleOwners: pts.LicencePlateOwner[] = database.prepare("select * from LicencePlateOwners" +
      " where recordDelete_timeMillis is null" +
      " and licencePlateNumber = ?" +
      " and recordDate >= ?" +
      " order by recordDate")
      .all(licencePlateNumber, recordDateOrBefore);

    for (const possibleOwnerObject of possibleOwners) {

      const ownerPlateCountryAlias =
        configFunctions.getProperty("licencePlateCountryAliases")[possibleOwnerObject.licencePlateCountry] ||
        possibleOwnerObject.licencePlateCountry;

      const ownerPlateProvinceAlias =
        (configFunctions.getProperty("licencePlateProvinceAliases")[ownerPlateCountryAlias] || {})[possibleOwnerObject.licencePlateProvince] || possibleOwnerObject.licencePlateProvince;

      if (licencePlateCountryAlias === ownerPlateCountryAlias &&
        licencePlateProvinceAlias === ownerPlateProvinceAlias) {

        possibleOwnerObject.recordDateString = dateTimeFns.dateIntegerToString(possibleOwnerObject.recordDate);

        possibleOwnerObject.licencePlateExpiryDateString =
          dateTimeFns.dateIntegerToString(possibleOwnerObject.licencePlateExpiryDate);

        possibleOwnerObject.vehicleMake = vehicleFunctions.getMakeFromNCIC(possibleOwnerObject.vehicleNCIC);

        return possibleOwnerObject;
      }
    }

    return undefined;
  };


export const getLicencePlateOwner =
  (licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string,
    recordDateOrBefore: number): pts.LicencePlateOwner => {

    const database = sqlite(databasePath, {
      readonly: true
    });

    const ownerRecord =
      getLicencePlateOwnerWithDB(database, licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore);

    database.close();

    return ownerRecord;

  };


export default getLicencePlateOwner;
