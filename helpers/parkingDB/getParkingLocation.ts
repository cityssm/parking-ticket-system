import type * as sqlite from "better-sqlite3";
import type * as pts from "../../types/recordTypes";


export const getParkingLocationWithDB = (db: sqlite.Database, locationKey: string) => {

  const location: pts.ParkingLocation = db.prepare("select locationKey, locationName, locationClassKey, isActive" +
    " from ParkingLocations" +
    " where locationKey = ?")
    .get(locationKey);

  return location;
};
