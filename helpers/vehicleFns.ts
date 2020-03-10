/*
 * API
 */

import fetch = require("node-fetch");
const nhtsaApiURL = "https://vpic.nhtsa.dot.gov/api/vehicles/";

const nhtsaSearchExpiryDurationMillis = 14 * 86400 * 1000;

/*
 * API Cache
 */

import sqlite = require("better-sqlite3");
const dbPath = "data/nhtsa.db";

/*
 * More Data
 */

import * as ncic from "../data/ncicCodes";


function getModelsByMakeFromDB(makeSearchString: string, db: sqlite.Database) {

  return db.prepare("select makeID, makeName, modelID, modelName" +
    " from MakeModel" +
    " where instr(lower(makeName), ?)" +
    " and recordDelete_timeMillis is null" +
    " order by makeName, modelName")
    .all(makeSearchString);
}


export function getModelsByMake(makeSearchStringOriginal: string, callbackFn: Function) {

  const makeSearchString = makeSearchStringOriginal.trim().toLowerCase();

  const db = sqlite(dbPath)

  const queryCloseCallbackFn = function() {

    const makeModelResults = getModelsByMakeFromDB(makeSearchString, db);
    db.close();
    callbackFn(makeModelResults);

  };

  let useAPI = false;

  // check if the search string has been searched for recently

  const nowMillis = Date.now();

  const searchRecord = db.prepare("select searchExpiryMillis from MakeModelSearchHistory" +
    " where searchString = ?")
    .get(makeSearchString);

  if (searchRecord) {

    if (searchRecord.searchExpiryMillis < nowMillis) {

      // expired
      // update searchExpiryMillis to avoid multiple queries

      useAPI = true;

      db.prepare("update MakeModelSearchHistory" +
        " set searchExpiryMillis = ?" +
        " where searchString = ?")
        .run(nowMillis + nhtsaSearchExpiryDurationMillis, makeSearchString);

    }

  } else {

    useAPI = true;

    db.prepare("insert into MakeModelSearchHistory" +
      " (searchString, resultCount, searchExpiryMillis)" +
      " values (?, ?, ?)")
      .run(makeSearchString, 0, nowMillis + nhtsaSearchExpiryDurationMillis);
  }

  if (useAPI) {

    fetch(nhtsaApiURL + "getmodelsformake/" + encodeURIComponent(makeSearchString) + "?format=json")
      .then(response => response.json())
      .then(data => {

        db.prepare("update MakeModelSearchHistory" +
          " set resultCount = ?" +
          "where searchString = ?")
          .run(data.Count, makeSearchString);

        const insertSQL = "insert or ignore into MakeModel (makeID, makeName, modelID, modelName," +
          " recordCreate_timeMillis, recordUpdate_timeMillis)" +
          " values (?, ?, ?, ?, ?, ?)";

        const updateSQL = "update MakeModel" +
          " set recordUpdate_timeMillis = ?" +
          " where makeName = ?" +
          " and modelName = ?";

        for (let index = 0; index < data.Results.length; index += 1) {

          const record: {
            Make_ID: number,
            Make_Name: string,
            Model_ID: number,
            Model_Name: string
          } = data.Results[index];

          const info = db.prepare(insertSQL)
            .run(record.Make_ID, record.Make_Name,
              record.Model_ID, record.Model_Name,
              nowMillis, nowMillis);

          if (info.changes === 0) {

            db.prepare(updateSQL).run(nowMillis, record.Make_Name, record.Model_Name);
          }
        }

        queryCloseCallbackFn();
        return;

      })
      .catch(err => {

        queryCloseCallbackFn();
        return;

      });

  } else {

    queryCloseCallbackFn();
    return;

  }

}


export function getMakeFromNCIC(vehicleNCIC: string): string {
  return ncic.allNCIC[vehicleNCIC] || vehicleNCIC;
}


export function isNCICExclusivelyTrailer(vehicleNCIC: string) {

  if (ncic.trailerNCIC.hasOwnProperty(vehicleNCIC) && !ncic.vehicleNCIC.hasOwnProperty(vehicleNCIC)) {
    return true;
  }

  return false;

}
