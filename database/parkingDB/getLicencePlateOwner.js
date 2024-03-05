import { dateIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { getConfigProperty } from '../../helpers/functions.config.js';
import { getMakeFromNCIC } from '../../helpers/functions.vehicle.js';
export async function getLicencePlateOwner(licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(databasePath, { readonly: true });
    const licencePlateCountryAlias = getConfigProperty('licencePlateCountryAliases')[licencePlateCountry] ??
        licencePlateCountry;
    const licencePlateProvinceAlias = getConfigProperty('licencePlateProvinceAliases')[licencePlateCountryAlias]?.[licencePlateProvince] ?? licencePlateProvince;
    const possibleOwners = database
        .prepare(`select * from LicencePlateOwners
        where recordDelete_timeMillis is null
        and licencePlateNumber = ?
        and recordDate >= ?
        order by recordDate`)
        .all(licencePlateNumber, recordDateOrBefore);
    for (const possibleOwnerObject of possibleOwners) {
        const ownerPlateCountryAlias = getConfigProperty('licencePlateCountryAliases')[possibleOwnerObject.licencePlateCountry] ?? possibleOwnerObject.licencePlateCountry;
        const ownerPlateProvinceAlias = getConfigProperty('licencePlateProvinceAliases')[ownerPlateCountryAlias]?.[possibleOwnerObject.licencePlateProvince] ??
            possibleOwnerObject.licencePlateProvince;
        if (licencePlateCountryAlias === ownerPlateCountryAlias &&
            licencePlateProvinceAlias === ownerPlateProvinceAlias) {
            possibleOwnerObject.recordDateString = dateIntegerToString(possibleOwnerObject.recordDate);
            possibleOwnerObject.licencePlateExpiryDateString = dateIntegerToString(possibleOwnerObject.licencePlateExpiryDate);
            possibleOwnerObject.vehicleMake = await getMakeFromNCIC(possibleOwnerObject.vehicleNCIC);
            return possibleOwnerObject;
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return undefined;
}
export default getLicencePlateOwner;
