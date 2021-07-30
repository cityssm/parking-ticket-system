import sqlite from "better-sqlite3";

import { parkingDB as databasePath } from "../../data/databasePaths.js";


export const cleanupParkingOffencesTable = (): boolean => {

  const database = sqlite(databasePath);

  const recordsToDelete = database.prepare("select o.bylawNumber, o.locationKey" +
    " from ParkingOffences o" +
    " where isActive = 0" +
    (" and not exists (" +
      "select 1 from ParkingTickets t where o.bylawNumber = t.bylawNumber and o.locationKey = t.locationKey)"))
    .all();

  for (const record of recordsToDelete) {

    database.prepare("delete from ParkingOffences" +
      " where bylawNumber = ?" +
      " and locationKey = ?" +
      " and isActive = 0")
      .run(record.bylawNumber,
        record.locationKey);
  }

  database.close();

  return true;
};


export default cleanupParkingOffencesTable;
