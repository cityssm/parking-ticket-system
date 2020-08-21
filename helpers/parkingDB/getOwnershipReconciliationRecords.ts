import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import * as vehicleFns from "../vehicleFns";
import type * as pts from "../ptsTypes";

import { parkingDB as dbPath } from "../../data/databasePaths";


export interface ReconciliationRecord extends pts.LicencePlate {

  ticket_ticketID: number;
  ticket_ticketNumber: string;
  ticket_issueDate: number;
  ticket_issueDateString?: string;
  ticket_vehicleMakeModel: string;

  ticket_licencePlateExpiryDate: number;
  ticket_licencePlateExpiryDateString?: string;

  owner_recordDate: number;
  owner_recordDateString?: string;

  owner_vehicleNCIC: string;
  owner_vehicleMake: string;
  owner_vehicleYear: number;
  owner_vehicleColor: string;

  owner_licencePlateExpiryDate: number;
  owner_licencePlateExpiryDateString?: string;

  owner_ownerName1: string;
  owner_ownerName2: string;
  owner_ownerAddress: string;
  owner_ownerCity: string;
  owner_ownerProvince: string;
  owner_ownerPostalCode: string;

  dateDifference: number;

  isVehicleMakeMatch: boolean;
  isLicencePlateExpiryDateMatch: boolean;
}


export const getOwnershipReconciliationRecords = () => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const records: ReconciliationRecord[] = db.prepare(
    "select t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber," +

    " t.ticketID as ticket_ticketID," +
    " t.ticketNumber as ticket_ticketNumber," +
    " t.issueDate as ticket_issueDate," +
    " t.vehicleMakeModel as ticket_vehicleMakeModel," +
    " t.licencePlateExpiryDate as ticket_licencePlateExpiryDate," +

    " o.recordDate as owner_recordDate," +
    " o.vehicleNCIC as owner_vehicleNCIC," +
    " o.vehicleYear as owner_vehicleYear," +
    " o.vehicleColor as owner_vehicleColor," +
    " o.licencePlateExpiryDate as owner_licencePlateExpiryDate," +
    " o.ownerName1 as owner_ownerName1," +
    " o.ownerName2 as owner_ownerName2," +
    " o.ownerAddress as owner_ownerAddress," +
    " o.ownerCity as owner_ownerCity," +
    " o.ownerProvince as owner_ownerProvince," +
    " o.ownerPostalCode as owner_ownerPostalCode" +
    " from ParkingTickets t" +
    (" inner join LicencePlateOwners o" +
      " on t.licencePlateCountry = o.licencePlateCountry" +
      " and t.licencePlateProvince = o.licencePlateProvince" +
      " and t.licencePlateNumber = o.licencePlateNumber" +
      " and o.recordDelete_timeMillis is null" +
      " and o.vehicleNCIC <> ''" +
      (" and o.recordDate = (" +
        "select o2.recordDate from LicencePlateOwners o2" +
        " where t.licencePlateCountry = o2.licencePlateCountry" +
        " and t.licencePlateProvince = o2.licencePlateProvince" +
        " and t.licencePlateNumber = o2.licencePlateNumber" +
        " and o2.recordDelete_timeMillis is null" +
        " and t.issueDate <= o2.recordDate" +
        " order by o2.recordDate" +
        " limit 1)")) +
    " where t.recordDelete_timeMillis is null" +
    " and t.resolvedDate is null" +
    (" and not exists (" +
      "select 1 from ParkingTicketStatusLog s " +
      " where t.ticketID = s.ticketID " +
      " and s.statusKey in ('ownerLookupMatch', 'ownerLookupError')" +
      " and s.recordDelete_timeMillis is null)"))
    .all();

  db.close();

  for (const record of records) {

    record.ticket_issueDateString = dateTimeFns.dateIntegerToString(record.ticket_issueDate);

    record.ticket_licencePlateExpiryDateString =
      dateTimeFns.dateIntegerToString(record.ticket_licencePlateExpiryDate);

    record.owner_recordDateString = dateTimeFns.dateIntegerToString(record.owner_recordDate);
    record.owner_licencePlateExpiryDateString = dateTimeFns.dateIntegerToString(record.owner_licencePlateExpiryDate);

    record.owner_vehicleMake = vehicleFns.getMakeFromNCIC(record.owner_vehicleNCIC);

    record.dateDifference =
      dateTimeFns.dateStringDifferenceInDays(record.ticket_issueDateString, record.owner_recordDateString);

    record.isVehicleMakeMatch =
      (record.ticket_vehicleMakeModel.toLowerCase() === record.owner_vehicleMake.toLowerCase()) ||
      (record.ticket_vehicleMakeModel.toLowerCase() === record.owner_vehicleNCIC.toLowerCase());

    record.isLicencePlateExpiryDateMatch =
      (record.ticket_licencePlateExpiryDate === record.owner_licencePlateExpiryDate);
  }

  return records;
};
