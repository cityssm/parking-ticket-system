import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import * as configFunctions from '../../helpers/functions.config.js';
import * as vehicleFunctions from '../../helpers/functions.vehicle.js';
export function getLicencePlateOwnerWithDB(database, licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore) {
    const licencePlateCountryAlias = configFunctions.getProperty('licencePlateCountryAliases')[licencePlateCountry] || licencePlateCountry;
    const licencePlateProvinceAlias = (configFunctions.getProperty('licencePlateProvinceAliases')[licencePlateCountryAlias] || {})[licencePlateProvince] || licencePlateProvince;
    const possibleOwners = database
        .prepare('select * from LicencePlateOwners' +
        ' where recordDelete_timeMillis is null' +
        ' and licencePlateNumber = ?' +
        ' and recordDate >= ?' +
        ' order by recordDate')
        .all(licencePlateNumber, recordDateOrBefore);
    for (const possibleOwnerObject of possibleOwners) {
        const ownerPlateCountryAlias = configFunctions.getProperty('licencePlateCountryAliases')[possibleOwnerObject.licencePlateCountry] || possibleOwnerObject.licencePlateCountry;
        const ownerPlateProvinceAlias = (configFunctions.getProperty('licencePlateProvinceAliases')[ownerPlateCountryAlias] || {})[possibleOwnerObject.licencePlateProvince] ||
            possibleOwnerObject.licencePlateProvince;
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
}
export function getLicencePlateOwner(licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const ownerRecord = getLicencePlateOwnerWithDB(database, licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore);
    database.close();
    return ownerRecord;
}
export default getLicencePlateOwner;
