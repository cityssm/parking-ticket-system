import sqlite from "better-sqlite3";

import { createParkingTicketStatusWithDB } from "./createParkingTicketStatus.js";

import { isParkingTicketConvictedWithDB } from "./isParkingTicketConvicted.js";
import { isParkingTicketInConvictionBatchWithDB } from "./isParkingTicketInConvictionBatch.js";
import { isConvictionBatchUpdatableWithDB } from "./isConvictionBatchUpdatable.js";
import canParkingTicketBeAddedToConvictionBatch from "./canParkingTicketBeAddedToConvictionBatch.js";

import { parkingDB as dbPath } from "../../data/databasePaths.js";

import type * as expressSession from "express-session";


const createStatus =
  (db: sqlite.Database,
    batchID: number, ticketID: number,
    statusKey: "convicted" | "convictionBatch",
    reqSession: expressSession.Session) => {

    createParkingTicketStatusWithDB(db, {
      recordType: "status",
      ticketID,
      statusKey,
      statusField: batchID.toString(),
      statusField2: "",
      statusNote: ""
    }, reqSession, false);
  };

const createConvictedStatus =
  (db: sqlite.Database, batchID: number, ticketID: number, reqSession: expressSession.Session) => {

    createStatus(db, batchID, ticketID, "convicted", reqSession);
  };


const createConvictionBatchStatus =
  (db: sqlite.Database, batchID: number, ticketID: number, reqSession: expressSession.Session) => {

    createStatus(db, batchID, ticketID, "convictionBatch", reqSession);
  };


const convictIfNotConvicted =
  (db: sqlite.Database, batchID: number, ticketID: number, reqSession: expressSession.Session) => {

    const parkingTicketIsConvicted = isParkingTicketConvictedWithDB(db, ticketID);

    if (!parkingTicketIsConvicted) {

      createConvictedStatus(db,
        batchID,
        ticketID,
        reqSession);
    }
  };


const addParkingTicketToConvictionBatchAfterBatchCheck =
  (db: sqlite.Database, batchID: number, ticketID: number, reqSession: expressSession.Session) => {

    // Ensure ticket has not been resolved

    const ticketIsAvailable = canParkingTicketBeAddedToConvictionBatch(db, ticketID);

    if (!ticketIsAvailable) {
      return {
        success: false,
        message: "The ticket cannot be added to the batch."
      };
    }

    // Convict ticket

    convictIfNotConvicted(db, batchID, ticketID, reqSession);

    // Check if the ticket is part of another conviction batch

    const parkingTicketInBatch = isParkingTicketInConvictionBatchWithDB(db, ticketID);

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
  reqSession: expressSession.Session
) => {

  const db = sqlite(dbPath);

  // Ensure batch is not locked

  const batchIsAvailable = isConvictionBatchUpdatableWithDB(db, batchID);

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
  reqSession: expressSession.Session
) => {

  const db = sqlite(dbPath);

  // Ensure batch is not locked

  const batchIsAvailable = isConvictionBatchUpdatableWithDB(db, batchID);

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
    success: true,
    successCount
  };
};


export default addParkingTicketToConvictionBatch;
