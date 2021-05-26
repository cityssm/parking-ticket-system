import sqlite from "better-sqlite3";

import { parkingDB as dbPath } from "../../data/databasePaths.js";


export const cleanupParkingLocationsTable = () => {

  const db = sqlite(dbPath);

  const recordsToDelete = db.prepare("select locationKey from ParkingLocations l" +
    " where isActive = 0" +
    " and not exists (select 1 from ParkingTickets t where l.locationKey = t.locationKey)" +
    " and not exists (select 1 from ParkingOffences o where l.locationKey = o.locationKey)")
    .all();

  for (const record of recordsToDelete) {

    db.prepare("delete from ParkingLocations" +
      " where locationKey = ?" +
      " and isActive = 0")
      .run(record.locationKey);
  }

  db.close();

  return true;
};


export default cleanupParkingLocationsTable;
