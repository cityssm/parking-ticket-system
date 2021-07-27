import sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as configFunctions from "../functions.config.js";
import * as vehicleFunctions from "../functions.vehicle.js";
import type * as pts from "../../types/recordTypes";

import { parkingDB as dbPath } from "../../data/databasePaths.js";


export const getLicencePlateOwnerWithDB =
  (db: sqlite.Database,
    licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string,
    recordDateOrBefore: number) => {

    const licencePlateCountryAlias =
      configFunctions.getProperty("licencePlateCountryAliases")[licencePlateCountry] || licencePlateCountry;

    const licencePlateProvinceAlias =
      (configFunctions.getProperty("licencePlateProvinceAliases")[licencePlateCountryAlias] || {})
      [licencePlateProvince] || licencePlateProvince;

    const possibleOwners: pts.LicencePlateOwner[] = db.prepare("select * from LicencePlateOwners" +
      " where recordDelete_timeMillis is null" +
      " and licencePlateNumber = ?" +
      " and recordDate >= ?" +
      " order by recordDate")
      .all(licencePlateNumber, recordDateOrBefore);

    for (const possibleOwnerObj of possibleOwners) {

      const ownerPlateCountryAlias =
        configFunctions.getProperty("licencePlateCountryAliases")[possibleOwnerObj.licencePlateCountry] ||
        possibleOwnerObj.licencePlateCountry;

      const ownerPlateProvinceAlias =
        (configFunctions.getProperty("licencePlateProvinceAliases")[ownerPlateCountryAlias] || {})
        [possibleOwnerObj.licencePlateProvince] || possibleOwnerObj.licencePlateProvince;

      if (licencePlateCountryAlias === ownerPlateCountryAlias &&
        licencePlateProvinceAlias === ownerPlateProvinceAlias) {

        possibleOwnerObj.recordDateString = dateTimeFns.dateIntegerToString(possibleOwnerObj.recordDate);

        possibleOwnerObj.licencePlateExpiryDateString =
          dateTimeFns.dateIntegerToString(possibleOwnerObj.licencePlateExpiryDate);

        possibleOwnerObj.vehicleMake = vehicleFunctions.getMakeFromNCIC(possibleOwnerObj.vehicleNCIC);

        return possibleOwnerObj;
      }
    }

    return null;
  };


export const getLicencePlateOwner =
  (licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string,
    recordDateOrBefore: number) => {

    const db = sqlite(dbPath, {
      readonly: true
    });

    const ownerRecord =
      getLicencePlateOwnerWithDB(db, licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore);

    db.close();

    return ownerRecord;

  };


export default getLicencePlateOwner;
