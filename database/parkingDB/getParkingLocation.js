export const getParkingLocationWithDB = (database, locationKey) => {
    return database
        .prepare(`select locationKey, locationName, locationClassKey, isActive
        from ParkingLocations
        where locationKey = ?`)
        .get(locationKey);
};
