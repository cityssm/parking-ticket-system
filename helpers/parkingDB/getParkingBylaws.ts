import * as sqlite from "better-sqlite3";

import type * as pts from "../ptsTypes";

import { dbPath } from "../parkingDB";


export interface AddUpdateParkingBylawReturn {
  success: boolean;
  message?: string;
  bylaws?: pts.ParkingBylaw[];
}


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
