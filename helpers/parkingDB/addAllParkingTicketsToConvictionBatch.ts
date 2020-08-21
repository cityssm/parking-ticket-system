import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import { dbPath } from "../parkingDB";


export const addAllParkingTicketsToConvictionBatch = (
  batchID: number,
  ticketIDs: number[],
  reqSession: Express.Session
) => {
  const db = sqlite(dbPath);

  // Ensure batch is not locked

  const lockedBatchCheck = db
    .prepare(
      "select lockDate from ParkingTicketConvictionBatches" +
      " where recordDelete_timeMillis is null" +
      " and batchID = ?"
    )
    .get(batchID);

  if (!lockedBatchCheck) {
    db.close();

    return {
      successCount: 0,
      message: "The batch is unavailable."
    };
  } else if (lockedBatchCheck.lockDate) {
    db.close();

    return {
      successCount: 0,
      message: "The batch is locked and cannot be updated."
    };
  }

  // Prepare for inserts

  const rightNow = new Date();

  const statusDate = dateTimeFns.dateToInteger(rightNow);
  const statusTime = dateTimeFns.dateToTimeInteger(rightNow);
  const timeMillis = rightNow.getTime();

  // Loop through ticketIDs

  let successCount = 0;

  for (const ticketID of ticketIDs) {
    // Get the next status index

    let newStatusIndex = db
      .prepare(
        "select ifnull(max(statusIndex), -1) + 1 as newStatusIndex" +
        " from ParkingTicketStatusLog" +
        " where ticketID = ?"
      )
      .get(ticketID).newStatusIndex as number;

    // Check if the ticket has been convicted or not

    const convictedStatusCheck = db
      .prepare(
        "select statusIndex from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " and statusKey = 'convicted'"
      )
      .get(ticketID);

    if (!convictedStatusCheck) {
      // If not convicted, convict it now

      db.prepare(
        "insert into ParkingTicketStatusLog" +
        " (ticketID, statusIndex, statusDate, statusTime, statusKey, statusField, statusNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(
        ticketID,
        newStatusIndex,
        statusDate,
        statusTime,
        "convicted",
        batchID.toString(),
        "",
        reqSession.user.userName,
        timeMillis,
        reqSession.user.userName,
        timeMillis
      );

      newStatusIndex += 1;
    }

    // Check if the ticket is part of another conviction batch

    const batchStatusCheck = db
      .prepare(
        "select statusField from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " and statusKey = 'convictionBatch'"
      )
      .get(ticketID);

    if (!batchStatusCheck) {
      // No record, add to batch now

      db.prepare(
        "insert into ParkingTicketStatusLog" +
        " (ticketID, statusIndex, statusDate, statusTime, statusKey, statusField, statusNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(
        ticketID,
        newStatusIndex,
        statusDate,
        statusTime,
        "convictionBatch",
        batchID.toString(),
        "",
        reqSession.user.userName,
        timeMillis,
        reqSession.user.userName,
        timeMillis
      );

      successCount += 1;
    } else if (batchStatusCheck.statusField === batchID.toString()) {
      successCount += 1;
    }
  }

  db.close();

  return {
    successCount
  };
};
