export const getParkingLocationWithDB = (db, locationKey) => {
    const location = db.prepare("select locationKey, locationName, locationClassKey, isActive" +
        " from ParkingLocations" +
        " where locationKey = ?")
        .get(locationKey);
    return location;
};
