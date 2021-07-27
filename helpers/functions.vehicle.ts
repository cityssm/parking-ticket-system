import sqlite from "better-sqlite3";
import fetch from "node-fetch";

import * as ncic from "../data/ncicCodes.js";
import { trailerNCIC } from "../data/ncicCodes/trailer.js";

import type { NHTSAMakeModel } from "../types/recordTypes";


/*
 * API
 */

const nhtsaApiURL = "https://vpic.nhtsa.dot.gov/api/vehicles/";

const nhtsaSearchExpiryDurationMillis = 14 * 86_400 * 1000;

/*
 * API Cache
 */

const databasePath = "data/nhtsa.db";

/*
 * More Data
 */

const getModelsByMakeFromDB = (makeSearchString: string, database: sqlite.Database): NHTSAMakeModel[] => {

  return database.prepare("select makeID, makeName, modelID, modelName" +
    " from MakeModel" +
    " where instr(lower(makeName), ?)" +
    " and recordDelete_timeMillis is null" +
    " order by makeName, modelName")
    .all(makeSearchString);
};


export const getModelsByMakeFromCache = (makeSearchStringOriginal: string): NHTSAMakeModel[] => {

  const makeSearchString = makeSearchStringOriginal.trim().toLowerCase();

  const database = sqlite(databasePath);

  const makeModelResults = getModelsByMakeFromDB(makeSearchString, database);

  database.close();

  return makeModelResults;
};


export const getModelsByMake =
  async (makeSearchStringOriginal: string): Promise<NHTSAMakeModel[]> => {

    const makeSearchString = makeSearchStringOriginal.trim().toLowerCase();

    const database = sqlite(databasePath);

    const queryCloseCallbackFunction = () => {

      const makeModelResults = getModelsByMakeFromDB(makeSearchString, database);
      database.close();
      return makeModelResults;
    };

    let useAPI = false;

    // check if the search string has been searched for recently

    const nowMillis = Date.now();

    const searchRecord = database.prepare("select searchExpiryMillis from MakeModelSearchHistory" +
      " where searchString = ?")
      .get(makeSearchString);

    if (searchRecord) {

      if (searchRecord.searchExpiryMillis < nowMillis) {

        // expired
        // update searchExpiryMillis to avoid multiple queries

        useAPI = true;

        database.prepare("update MakeModelSearchHistory" +
          " set searchExpiryMillis = ?" +
          " where searchString = ?")
          .run(nowMillis + nhtsaSearchExpiryDurationMillis, makeSearchString);

      }

    } else {

      useAPI = true;

      database.prepare("insert into MakeModelSearchHistory" +
        " (searchString, resultCount, searchExpiryMillis)" +
        " values (?, ?, ?)")
        .run(makeSearchString, 0, nowMillis + nhtsaSearchExpiryDurationMillis);
    }

    if (useAPI) {

      const data: {
        Count: number;
        Results: Array<{
          Make_ID: number;
          Make_Name: string;
          Model_ID: number;
          Model_Name: string;
        }>;
      } = await fetch(nhtsaApiURL + "getmodelsformake/" + encodeURIComponent(makeSearchString) + "?format=json")
        .then(async (response) => await response.json());


      database.prepare("update MakeModelSearchHistory" +
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

        const info = database.prepare(insertSQL)
          .run(record.Make_ID, record.Make_Name,
            record.Model_ID, record.Model_Name,
            nowMillis, nowMillis);

        if (info.changes === 0) {
          database.prepare(updateSQL).run(nowMillis, record.Make_Name, record.Model_Name);
        }
      }
    }

    return queryCloseCallbackFunction();
  };


export const getMakeFromNCIC = (vehicleNCIC: string): string => {
  return ncic.allNCIC[vehicleNCIC] || vehicleNCIC;
};


export const isNCICExclusivelyTrailer = (vehicleNCIC: string): boolean => {

  if (Object.prototype.hasOwnProperty.call(trailerNCIC, vehicleNCIC) && !Object.prototype.hasOwnProperty.call(ncic.vehicleNCIC, vehicleNCIC)) {
    return true;
  }

  return false;
};
