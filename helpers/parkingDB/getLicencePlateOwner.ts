import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import * as configFns from "../configFns";
import * as vehicleFns from "../vehicleFns";
import type * as pts from "../ptsTypes";

import { dbPath } from "../parkingDB";


export const getLicencePlateOwnerWithDB =
  (db: sqlite.Database,
    licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string,
    recordDateOrBefore: number) => {

    const licencePlateCountryAlias =
      configFns.getProperty("licencePlateCountryAliases")[licencePlateCountry] || licencePlateCountry;

    const licencePlateProvinceAlias =
      (configFns.getProperty("licencePlateProvinceAliases")[licencePlateCountryAlias] || {})
      [licencePlateProvince] || licencePlateProvince;

    const possibleOwners: pts.LicencePlateOwner[] = db.prepare("select * from LicencePlateOwners" +
      " where recordDelete_timeMillis is null" +
      " and licencePlateNumber = ?" +
      " and recordDate >= ?" +
      " order by recordDate")
      .all(licencePlateNumber, recordDateOrBefore);

    for (const possibleOwnerObj of possibleOwners) {

      const ownerPlateCountryAlias =
        configFns.getProperty("licencePlateCountryAliases")[possibleOwnerObj.licencePlateCountry] ||
        possibleOwnerObj.licencePlateCountry;

      const ownerPlateProvinceAlias =
        (configFns.getProperty("licencePlateProvinceAliases")[ownerPlateCountryAlias] || {})
        [possibleOwnerObj.licencePlateProvince] || possibleOwnerObj.licencePlateProvince;

      if (licencePlateCountryAlias === ownerPlateCountryAlias &&
        licencePlateProvinceAlias === ownerPlateProvinceAlias) {

        possibleOwnerObj.recordDateString = dateTimeFns.dateIntegerToString(possibleOwnerObj.recordDate);

        possibleOwnerObj.licencePlateExpiryDateString =
          dateTimeFns.dateIntegerToString(possibleOwnerObj.licencePlateExpiryDate);

        possibleOwnerObj.vehicleMake = vehicleFns.getMakeFromNCIC(possibleOwnerObj.vehicleNCIC);

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
