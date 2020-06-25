import { dbPath } from "./parkingDB";
import * as sqlite from "better-sqlite3";

import type * as pts from "./ptsTypes";


// Parking Locations


export const getParkingLocations = () => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: pts.ParkingLocation[] = db.prepare("select locationKey, locationName, locationClassKey" +
    " from ParkingLocations" +
    " where isActive = 1" +
    " order by orderNumber, locationName")
    .all();

  db.close();

  return rows;
};


interface AddUpdateParkingLocationReturn {
  success: boolean;
  message?: string;
  locations?: pts.ParkingLocation[];
}


export const addParkingLocation = (reqBody: pts.ParkingLocation): AddUpdateParkingLocationReturn => {

  const db = sqlite(dbPath);

  // Check if key is already used

  const locationRecord: pts.ParkingLocation = db.prepare("select locationName, isActive" +
    " from ParkingLocations" +
    " where locationKey = ?")
    .get(reqBody.locationKey);

  if (locationRecord) {

    db.close();

    return {
      success: false,
      message:
        "The location key \"" + reqBody.locationKey + "\"" +
        " is already associated with the " +
        (locationRecord.isActive ? "" : "inactive ") +
        " record \"" + locationRecord.locationName + "\"."
    };

  }

  // Do insert

  const info = db.prepare("insert into ParkingLocations (" +
    "locationKey, locationName, locationClassKey, orderNumber, isActive)" +
    " values (?, ?, ?, 0, 1)")
    .run(reqBody.locationKey, reqBody.locationName, reqBody.locationClassKey);

  db.close();

  return {
    success: (info.changes > 0)
  };

};


export const updateParkingLocation = (reqBody: pts.ParkingLocation): AddUpdateParkingLocationReturn => {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingLocations" +
    " set locationName = ?," +
    " locationClassKey = ?" +
    " where locationKey = ?" +
    " and isActive = 1")
    .run(reqBody.locationName, reqBody.locationClassKey, reqBody.locationKey);

  db.close();

  return {
    success: (info.changes > 0)
  };

};


export const deleteParkingLocation = (locationKey: string): AddUpdateParkingLocationReturn => {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingLocations" +
    " set isActive = 0" +
    " where locationKey = ?" +
    " and isActive = 1")
    .run(locationKey);

  db.close();

  return {
    success: (info.changes > 0)
  };

};


// Parking By-Laws


export const getParkingBylaws = () => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: pts.ParkingBylaw[] = db.prepare("select bylawNumber, bylawDescription" +
    " from ParkingBylaws" +
    " where isActive = 1" +
    " order by orderNumber, bylawNumber")
    .all();

  db.close();

  return rows;

};


export const getParkingBylawsWithOffenceStats = () => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: pts.ParkingBylaw[] = db.prepare("select b.bylawNumber, b.bylawDescription," +
    " count(o.locationKey) as offenceCount," +
    " min(o.offenceAmount) as offenceAmountMin," +
    " max(o.offenceAmount) as offenceAmountMax," +
    " min(o.discountOffenceAmount) as discountOffenceAmountMin," +
    " max(o.discountOffenceAmount) as discountOffenceAmountMax," +
    " min(o.discountDays) as discountDaysMin," +
    " max(o.discountDays) as discountDaysMax" +
    " from ParkingBylaws b" +
    " left join ParkingOffences o on b.bylawNumber = o.bylawNumber and o.isActive = 1" +
    " where b.isActive = 1" +
    " group by b.bylawNumber, b.bylawDescription, b.orderNumber" +
    " order by b.orderNumber, b.bylawNumber")
    .all();

  db.close();

  return rows;

};


interface AddUpdateParkingBylawReturn {
  success: boolean;
  message?: string;
  bylaws?: pts.ParkingBylaw[];
}


export const addParkingBylaw = (reqBody: pts.ParkingBylaw): AddUpdateParkingBylawReturn => {

  const db = sqlite(dbPath);

  // Check if key is already used

  const bylawRecord: pts.ParkingBylaw = db.prepare("select bylawDescription, isActive" +
    " from ParkingBylaws" +
    " where bylawNumber = ?")
    .get(reqBody.bylawNumber);

  if (bylawRecord) {

    if (bylawRecord.isActive) {

      db.close();

      return {
        success: false,
        message:
          "By-law number \"" + reqBody.bylawNumber + "\"" +
          " is already associated with the " +
          " record \"" + bylawRecord.bylawDescription + "\"."
      };

    }

    // Do update

    const info = db.prepare("update ParkingBylaws" +
      " set isActive = 1" +
      " where bylawNumber = ?")
      .run(reqBody.bylawNumber);

    db.close();

    return {
      success: (info.changes > 0),
      message: "By-law number \"" + reqBody.bylawNumber + "\" is associated with a previously removed record." +
        " That record has been restored with the original description."
    };

  }

  // Do insert

  const info = db.prepare("insert into ParkingBylaws (" +
    "bylawNumber, bylawDescription, orderNumber, isActive)" +
    " values (?, ?, 0, 1)")
    .run(reqBody.bylawNumber, reqBody.bylawDescription);

  db.close();

  return {
    success: (info.changes > 0)
  };

};


export const updateParkingBylaw = (reqBody: pts.ParkingBylaw): AddUpdateParkingBylawReturn => {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingBylaws" +
    " set bylawDescription = ?" +
    " where bylawNumber = ?" +
    " and isActive = 1")
    .run(reqBody.bylawDescription, reqBody.bylawNumber);

  db.close();

  return {
    success: (info.changes > 0)
  };

};


export const deleteParkingBylaw = (bylawNumber: string): AddUpdateParkingBylawReturn => {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingBylaws" +
    " set isActive = 0" +
    " where bylawNumber = ?" +
    " and isActive = 1")
    .run(bylawNumber);

  db.close();

  return {
    success: (info.changes > 0)
  };

};


export const updateParkingOffencesByBylawNumber = (reqBody: any): AddUpdateParkingBylawReturn => {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingOffences" +
    " set offenceAmount = ?," +
    " discountOffenceAmount = ?," +
    " discountDays = ?" +
    " where bylawNumber = ?" +
    " and isActive = 1")
    .run(reqBody.offenceAmount,
      reqBody.discountOffenceAmount,
      reqBody.discountDays,
      reqBody.bylawNumber);

  db.close();

  return {
    success: (info.changes > 0)
  };

};


// Parking Offences


export const getParkingOffences = () => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: pts.ParkingOffence[] = db.prepare(
    "select o.bylawNumber, o.locationKey, o.parkingOffence," +
    " o.offenceAmount, o.discountOffenceAmount, o.discountDays, o.accountNumber" +
    " from ParkingOffences o" +
    " left join ParkingLocations l on o.locationKey = l.locationKey" +
    " where o.isActive = 1 and l.isActive" +
    " and o.bylawNumber in (select b.bylawNumber from ParkingBylaws b where b.isActive = 1)" +
    " order by o.bylawNumber, l.locationName")
    .all();

  db.close();

  return rows;
};


export const getParkingOffencesByLocationKey = (locationKey: string) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: pts.ParkingOffence[] = db.prepare("select o.bylawNumber, b.bylawDescription," +
    " o.parkingOffence, o.offenceAmount, o.discountOffenceAmount, o.discountDays" +
    " from ParkingOffences o" +
    " left join ParkingBylaws b on o.bylawNumber = b.bylawNumber" +
    " where o.isActive = 1 and b.isActive = 1" +
    " and o.locationKey = ?" +
    " order by b.orderNumber, b.bylawNumber")
    .all(locationKey);

  db.close();

  return rows;
};


interface AddUpdateParkingOffenceReturn {
  success: boolean;
  message?: string;
  offences?: pts.ParkingOffence[];
}


export const addParkingOffence = (reqBody: pts.ParkingOffence): AddUpdateParkingOffenceReturn => {

  const db = sqlite(dbPath);

  // Check if offence already exists

  const existingOffenceRecord: pts.ParkingOffence = db.prepare("select isActive" +
    " from ParkingOffences" +
    " where bylawNumber = ?" +
    " and locationKey = ?")
    .get(reqBody.bylawNumber, reqBody.locationKey);

  if (existingOffenceRecord) {

    if (existingOffenceRecord.isActive) {

      db.close();

      return {
        success: false,
        message: "An active offence already exists for the same location and by-law."
      };

    } else {

      const info = db.prepare("update ParkingOffences" +
        " set isActive = 1" +
        " where bylawNumber = ?" +
        " and locationKey = ?").
        run(reqBody.bylawNumber, reqBody.locationKey);

      db.close();

      return {
        success: (info.changes > 0),
        message: "A previously deleted offence for the same location and by-law has been restored."
      };

    }

  }

  // Check if another offence exists for the same by-law
  // If so, use the same offenceAmount

  let offenceAmount = 0;
  let discountOffenceAmount: number = 0;
  let discountDays = 0;

  if (reqBody.hasOwnProperty("offenceAmount")) {

    offenceAmount = reqBody.offenceAmount;

    discountOffenceAmount = reqBody.hasOwnProperty("discountOffenceAmount") ?
      reqBody.discountOffenceAmount :
      reqBody.offenceAmount;

    discountDays = reqBody.discountDays || 0;

  } else {

    const offenceAmountRecord: pts.ParkingOffence = db.prepare(
      "select offenceAmount, discountOffenceAmount, discountDays" +
      " from ParkingOffences" +
      " where bylawNumber = ?" +
      " and isActive = 1" +
      " group by offenceAmount, discountOffenceAmount, discountDays" +
      " order by count(locationKey) desc, offenceAmount desc, discountOffenceAmount desc" +
      " limit 1")
      .get(reqBody.bylawNumber);

    if (offenceAmountRecord) {
      offenceAmount = offenceAmountRecord.offenceAmount;
      discountOffenceAmount = offenceAmountRecord.discountOffenceAmount;
      discountDays = offenceAmountRecord.discountDays;
    }
  }

  // Insert record

  const info = db.prepare("insert into ParkingOffences" +
    " (bylawNumber, locationKey, parkingOffence, offenceAmount, discountOffenceAmount, discountDays, accountNumber, isActive)" +
    " values (?, ?, ?, ?, ?, ?, ?, 1)")
    .run(reqBody.bylawNumber,
      reqBody.locationKey,
      reqBody.parkingOffence || "",
      offenceAmount,
      discountOffenceAmount,
      discountDays,
      reqBody.accountNumber || "");

  db.close();

  return {
    success: (info.changes > 0)
  };
};


export const updateParkingOffence = (reqBody: pts.ParkingOffence): AddUpdateParkingOffenceReturn => {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingOffences" +
    " set parkingOffence = ?," +
    " offenceAmount = ?," +
    " discountOffenceAmount = ?," +
    " discountDays = ?," +
    " accountNumber = ?" +
    " where bylawNumber = ?" +
    " and locationKey = ?" +
    " and isActive = 1")
    .run(reqBody.parkingOffence,
      reqBody.offenceAmount,
      reqBody.discountOffenceAmount,
      reqBody.discountDays,
      reqBody.accountNumber,
      reqBody.bylawNumber,
      reqBody.locationKey);

  db.close();

  return {
    success: (info.changes > 0)
  };

};


export const deleteParkingOffence = (bylawNumber: string, locationKey: string): AddUpdateParkingOffenceReturn => {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingOffences" +
    " set isActive = 0" +
    " where bylawNumber = ?" +
    " and locationKey = ?" +
    " and isActive = 1")
    .run(bylawNumber, locationKey);

  db.close();

  return {
    success: (info.changes > 0)
  };

};
