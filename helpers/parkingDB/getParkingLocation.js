"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParkingLocationWithDB = void 0;
exports.getParkingLocationWithDB = (db, locationKey) => {
    const location = db.prepare("select locationKey, locationName, locationClassKey, isActive" +
        " from ParkingLocations" +
        " where locationKey = ?")
        .get(locationKey);
    return location;
};
