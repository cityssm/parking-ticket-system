import sqlite from "better-sqlite3";

import type * as pts from "../../types/recordTypes";

import { parkingDB as databasePath } from "../../data/databasePaths.js";


export interface AddUpdateParkingBylawReturn {
  success: boolean;
  message?: string;
  bylaws?: pts.ParkingBylaw[];
}


export const getParkingBylaws = (): pts.ParkingBylaw[] => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const rows: pts.ParkingBylaw[] = database.prepare("select bylawNumber, bylawDescription" +
    " from ParkingBylaws" +
    " where isActive = 1" +
    " order by orderNumber, bylawNumber")
    .all();

  database.close();

  return rows;
};


export const getParkingBylawsWithOffenceStats = (): pts.ParkingBylaw[] => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const rows: pts.ParkingBylaw[] = database.prepare("select b.bylawNumber, b.bylawDescription," +
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

  database.close();

  return rows;
};


export default getParkingBylaws;
