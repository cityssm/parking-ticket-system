export const getParkingLocationWithDB = (database, locationKey) => {
    const location = database
        .prepare('select locationKey, locationName, locationClassKey, isActive' +
        ' from ParkingLocations' +
        ' where locationKey = ?')
        .get(locationKey);
    return location;
};
