import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";

import * as parkingDB_cleanupParkingTicketsTable from "../../helpers/parkingDB/cleanupParkingTicketsTable";
import * as parkingDB_cleanupParkingTicketRemarksTable from "../../helpers/parkingDB/cleanupParkingTicketRemarksTable";
import * as parkingDB_cleanupParkingTicketStatusLog from "../../helpers/parkingDB/cleanupParkingTicketStatusLog";

import * as parkingDB_cleanupLicencePlateOwnersTable from "../../helpers/parkingDB/cleanupLicencePlateOwnersTable";

import * as parkingDB_cleanupParkingBylawsTable from "../../helpers/parkingDB/cleanupParkingBylawsTable";
import * as parkingDB_cleanupParkingLocationsTable from "../../helpers/parkingDB/cleanupParkingLocationsTable";
import * as parkingDB_cleanupParkingOffencesTable from "../../helpers/parkingDB/cleanupParkingOffencesTable";


export const handler: RequestHandler = (req, res) => {

  const table = req.body.table;

  const recordDelete_timeMillis =
    Math.min(
      parseInt(req.body.recordDelete_timeMillis, 10),
      Date.now() - (configFns.getProperty("databaseCleanup.windowDays") * 86400 * 1000));

  let success = false;

  switch (table) {

    case "parkingTickets":

      success = parkingDB_cleanupParkingTicketsTable.cleanupParkingTicketsTable(recordDelete_timeMillis);
      break;

    case "parkingTicketRemarks":

      success = parkingDB_cleanupParkingTicketRemarksTable.cleanupParkingTicketRemarksTable(recordDelete_timeMillis);
      break;

    case "parkingTicketStatusLog":

      success = parkingDB_cleanupParkingTicketStatusLog.cleanupParkingTicketStatusLog(recordDelete_timeMillis);
      break;

    case "licencePlateOwners":

      success = parkingDB_cleanupLicencePlateOwnersTable.cleanupLicencePlateOwnersTable(recordDelete_timeMillis);
      break;

    case "parkingOffences":

      success = parkingDB_cleanupParkingOffencesTable.cleanupParkingOffencesTable();
      break;

    case "parkingLocations":

      success = parkingDB_cleanupParkingLocationsTable.cleanupParkingLocationsTable();
      break;

    case "parkingBylaws":

      success = parkingDB_cleanupParkingBylawsTable.cleanupParkingBylawsTable();
      break;
  }

  return res.json({ success });
};
