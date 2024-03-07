import { dateStringDifferenceInDays } from '@cityssm/expressjs-server-js/dateTimeFns.js';
import { dateIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { getMakeFromNCIC } from '../../helpers/functions.vehicle.js';
export default async function getOwnershipReconciliationRecords() {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const records = database
        .prepare(`select t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber,
          t.ticketId as ticket_ticketId, t.ticketNumber as ticket_ticketNumber,
          t.issueDate as ticket_issueDate,
          t.vehicleMakeModel as ticket_vehicleMakeModel,
          t.licencePlateExpiryDate as ticket_licencePlateExpiryDate,
          o.recordDate as owner_recordDate,
          o.vehicleNCIC as owner_vehicleNCIC, o.vehicleYear as owner_vehicleYear, o.vehicleColor as owner_vehicleColor,
          o.licencePlateExpiryDate as owner_licencePlateExpiryDate,
          o.ownerName1 as owner_ownerName1, o.ownerName2 as owner_ownerName2,
          o.ownerAddress as owner_ownerAddress,
          o.ownerCity as owner_ownerCity, o.ownerProvince as owner_ownerProvince,
          o.ownerPostalCode as owner_ownerPostalCode
        from ParkingTickets t
        inner join LicencePlateOwners o
          on t.licencePlateCountry = o.licencePlateCountry
          and t.licencePlateProvince = o.licencePlateProvince
          and t.licencePlateNumber = o.licencePlateNumber
          and o.recordDelete_timeMillis is null
          and o.vehicleNCIC <> ''
          and o.recordDate = (
            select o2.recordDate from LicencePlateOwners o2
            where t.licencePlateCountry = o2.licencePlateCountry
            and t.licencePlateProvince = o2.licencePlateProvince
            and t.licencePlateNumber = o2.licencePlateNumber
            and o2.recordDelete_timeMillis is null
            and t.issueDate <= o2.recordDate order by o2.recordDate limit 1)
        where t.recordDelete_timeMillis is null
          and t.resolvedDate is null
          and not exists (
            select 1 from ParkingTicketStatusLog s
            where t.ticketId = s.ticketId
            and s.statusKey in ('ownerLookupMatch', 'ownerLookupError')
            and s.recordDelete_timeMillis is null)`)
        .all();
    database.close();
    for (const record of records) {
        record.ticket_issueDateString = dateIntegerToString(record.ticket_issueDate);
        record.ticket_licencePlateExpiryDateString = dateIntegerToString(record.ticket_licencePlateExpiryDate);
        record.owner_recordDateString = dateIntegerToString(record.owner_recordDate);
        record.owner_licencePlateExpiryDateString = dateIntegerToString(record.owner_licencePlateExpiryDate);
        record.owner_vehicleMake = await getMakeFromNCIC(record.owner_vehicleNCIC);
        record.dateDifference = dateStringDifferenceInDays(record.ticket_issueDateString, record.owner_recordDateString);
        record.isVehicleMakeMatch =
            record.ticket_vehicleMakeModel.toLowerCase() ===
                record.owner_vehicleMake.toLowerCase() ||
                record.ticket_vehicleMakeModel.toLowerCase() ===
                    record.owner_vehicleNCIC.toLowerCase();
        record.isLicencePlateExpiryDateMatch =
            record.ticket_licencePlateExpiryDate ===
                record.owner_licencePlateExpiryDate;
    }
    return records;
}
