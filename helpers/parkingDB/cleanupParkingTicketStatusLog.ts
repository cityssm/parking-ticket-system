import * as sqlite from "better-sqlite3";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const cleanupParkingTicketStatusLog = (recordDelete_timeMillis: number) => {

  const db = sqlite(dbPath);

  db.prepare("delete from ParkingTicketStatusLog" +
    " where recordDelete_timeMillis is not null" +
    " and recordDelete_timeMillis < ?")
    .run(recordDelete_timeMillis);

  db.close();

  return true;
};
