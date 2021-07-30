import type * as sqlite from "better-sqlite3";
import type * as pts from "../../types/recordTypes";


export const getParkingLocationWithDB = (database: sqlite.Database, locationKey: string): pts.ParkingLocation => {

  const location: pts.ParkingLocation = database.prepare("select locationKey, locationName, locationClassKey, isActive" +
    " from ParkingLocations" +
    " where locationKey = ?")
    .get(locationKey);

  return location;
};
