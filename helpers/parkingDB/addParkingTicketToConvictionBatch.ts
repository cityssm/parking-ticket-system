import * as sqlite from "better-sqlite3";

import { createParkingTicketStatusWithDB } from "./createParkingTicketStatus";

import { isParkingTicketConvicted } from "./isParkingTicketConvicted";
import { isParkingTicketInConvictionBatch } from "./isParkingTicketInConvictionBatch";
import { isConvictionBatchUpdatable } from "./isConvictionBatchUpdatable";
import { canParkingTicketBeAddedToConvictionBatch } from "./canParkingTicketBeAddedToConvictionBatch";

import { parkingDB as dbPath } from "../../data/databasePaths";


const createConvictedStatus = (db: sqlite.Database, batchID: number, ticketID: number, reqSession: Express.Session) => {

  createParkingTicketStatusWithDB(db, {
    recordType: "status",
    ticketID,
    statusKey: "convicted",
    statusField: batchID.toString(),
    statusField2: "",
    statusNote: ""
  }, reqSession, false);
};


const createConvictionBatchStatus = (db: sqlite.Database, batchID: number, ticketID: number, reqSession: Express.Session) => {

  createParkingTicketStatusWithDB(db, {
    recordType: "status",
    ticketID,
    statusKey: "convictionBatch",
    statusField: batchID.toString(),
    statusField2: "",
    statusNote: ""
  }, reqSession, false);
};


const addParkingTicketToConvictionBatchAfterBatchCheck =
  (db: sqlite.Database, batchID: number, ticketID: number, reqSession: Express.Session) => {

    // Ensure ticket has not been resolved

    const ticketIsAvailable = canParkingTicketBeAddedToConvictionBatch(db, ticketID);

    if (!ticketIsAvailable) {
      return {
        success: false,
        message: "The ticket cannot be added to the batch."
      };
    }

    // Check if the ticket has been convicted or not

    const parkingTicketIsConvicted = isParkingTicketConvicted(db, ticketID);

    if (!parkingTicketIsConvicted) {
      // If not convicted, convict it now

      createConvictedStatus(db,
        batchID,
        ticketID,
        reqSession);
    }

    // Check if the ticket is part of another conviction batch

    const parkingTicketInBatch = isParkingTicketInConvictionBatch(db, ticketID);

    if (!parkingTicketInBatch.inBatch) {
      // No record, add to batch now

      createConvictionBatchStatus(db,
        batchID,
        ticketID,
        reqSession);

    } else {

      return {
        success: false,
        message:
          "Parking ticket already included in conviction batch #" +
          parkingTicketInBatch.batchIDString +
          "."
      };
    }

    return {
      success: true
    };
  };


export const addParkingTicketToConvictionBatch = (
  batchID: number,
  ticketID: number,
  reqSession: Express.Session
) => {

  const db = sqlite(dbPath);

  // Ensure batch is not locked

  const batchIsAvailable = isConvictionBatchUpdatable(db, batchID);

  if (!batchIsAvailable) {
    db.close();

    return {
      success: false,
      message: "The batch cannot be updated."
    };
  }

  const result = addParkingTicketToConvictionBatchAfterBatchCheck(db, batchID, ticketID, reqSession);

  return result;
};


export const addAllParkingTicketsToConvictionBatch = (
  batchID: number,
  ticketIDs: number[],
  reqSession: Express.Session
) => {
  const db = sqlite(dbPath);

  // Ensure batch is not locked

  const batchIsAvailable = isConvictionBatchUpdatable(db, batchID);

  if (!batchIsAvailable) {
    db.close();

    return {
      success: false,
      successCount: 0,
      message: "The batch cannot be updated."
    };
  }

  // Loop through ticketIDs

  let successCount = 0;

  for (const ticketID of ticketIDs) {

    const result = addParkingTicketToConvictionBatchAfterBatchCheck(db, batchID, ticketID, reqSession);

    if (result.success) {
      successCount += 1;
    }
  }

  db.close();

  return {
    successCount
  };
};
