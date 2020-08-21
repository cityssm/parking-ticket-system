import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import { parkingDB as dbPath } from "../../data/databasePaths";


export const addParkingTicketToConvictionBatch = (
  batchID: number,
  ticketID: number,
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
      success: false,
      message: "The batch is unavailable."
    };
  } else if (lockedBatchCheck.lockDate) {
    db.close();

    return {
      success: false,
      message: "The batch is locked and cannot be updated."
    };
  }

  // Ensure ticket has not been resolved

  const resolvedDateRecord = db
    .prepare(
      "select resolvedDate from ParkingTickets" +
      " where ticketID = ?" +
      " and recordDelete_timeMillis is null"
    )
    .get(ticketID);

  if (!resolvedDateRecord) {
    db.close();

    return {
      success: false,
      message: "The ticket is unavailable."
    };
  } else if (resolvedDateRecord.resolvedDate) {
    db.close();

    return {
      success: false,
      message:
        "The ticket has been resolved and cannot be added to a conviction batch."
    };
  }

  // Get the next status index

  let newStatusIndex = db
    .prepare(
      "select ifnull(max(statusIndex), -1) + 1 as newStatusIndex" +
      " from ParkingTicketStatusLog" +
      " where ticketID = ?"
    )
    .get(ticketID).newStatusIndex as number;

  // Prepare for inserts

  const rightNow = new Date();

  const statusDate = dateTimeFns.dateToInteger(rightNow);
  const statusTime = dateTimeFns.dateToTimeInteger(rightNow);
  const timeMillis = rightNow.getTime();

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

  const batchStatusCheck: {
    statusField: string;
  } = db
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

    db.close();

    return {
      success: true
    };
  }

  db.close();

  if (batchStatusCheck.statusField === batchID.toString()) {
    // Already part of the batch
    return {
      success: true
    };
  } else {
    // Part of a different batch
    return {
      success: false,
      message:
        "Parking ticket already included in conviction batch #" +
        batchStatusCheck.statusField +
        "."
    };
  }
};


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
