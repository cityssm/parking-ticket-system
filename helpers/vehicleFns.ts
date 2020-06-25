/*
 * API
 */

import fetch from "node-fetch";
const nhtsaApiURL = "https://vpic.nhtsa.dot.gov/api/vehicles/";

const nhtsaSearchExpiryDurationMillis = 14 * 86400 * 1000;

/*
 * API Cache
 */

const dbPath = "data/nhtsa.db";
import * as sqlite from "better-sqlite3";

/*
 * More Data
 */

import * as ncic from "../data/ncicCodes";


const getModelsByMakeFromDB = (makeSearchString: string, db: sqlite.Database) => {

  return db.prepare("select makeID, makeName, modelID, modelName" +
    " from MakeModel" +
    " where instr(lower(makeName), ?)" +
    " and recordDelete_timeMillis is null" +
    " order by makeName, modelName")
    .all(makeSearchString);
};


export const getModelsByMakeFromCache = (makeSearchStringOriginal: string) => {

  const makeSearchString = makeSearchStringOriginal.trim().toLowerCase();

  const db = sqlite(dbPath);

  const makeModelResults = getModelsByMakeFromDB(makeSearchString, db);

  db.close();

  return makeModelResults;
};


export const getModelsByMake = (makeSearchStringOriginal: string, callbackFn: (makeModelResults: any[]) => void) => {

  const makeSearchString = makeSearchStringOriginal.trim().toLowerCase();

  const db = sqlite(dbPath);

  const queryCloseCallbackFn = () => {

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
      .then((response) => response.json())
      .then((data: {
        Count: number,
        Results: {
          Make_ID: number,
          Make_Name: string,
          Model_ID: number,
          Model_Name: string
        }[]
      }) => {

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

        for (const record of data.Results) {

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
      .catch((_err) => {

        queryCloseCallbackFn();
        return;
      });

  } else {

    queryCloseCallbackFn();
    return;
  }
};


export const getMakeFromNCIC = (vehicleNCIC: string): string => {
  return ncic.allNCIC[vehicleNCIC] || vehicleNCIC;
};


export const isNCICExclusivelyTrailer = (vehicleNCIC: string) => {

  if (ncic.trailerNCIC.hasOwnProperty(vehicleNCIC) && !ncic.vehicleNCIC.hasOwnProperty(vehicleNCIC)) {
    return true;
  }

  return false;

};
