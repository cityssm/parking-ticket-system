import sqlite from "better-sqlite3";
import fetch from "node-fetch";
import * as ncic from "../data/ncicCodes.js";
import { trailerNCIC } from "../data/ncicCodes/trailer.js";
const nhtsaApiURL = "https://vpic.nhtsa.dot.gov/api/vehicles/";
const nhtsaSearchExpiryDurationMillis = 14 * 86400 * 1000;
const dbPath = "data/nhtsa.db";
const getModelsByMakeFromDB = (makeSearchString, db) => {
    return db.prepare("select makeID, makeName, modelID, modelName" +
        " from MakeModel" +
        " where instr(lower(makeName), ?)" +
        " and recordDelete_timeMillis is null" +
        " order by makeName, modelName")
        .all(makeSearchString);
};
export const getModelsByMakeFromCache = (makeSearchStringOriginal) => {
    const makeSearchString = makeSearchStringOriginal.trim().toLowerCase();
    const db = sqlite(dbPath);
    const makeModelResults = getModelsByMakeFromDB(makeSearchString, db);
    db.close();
    return makeModelResults;
};
export const getModelsByMake = (makeSearchStringOriginal, callbackFn) => {
    const makeSearchString = makeSearchStringOriginal.trim().toLowerCase();
    const db = sqlite(dbPath);
    const queryCloseCallbackFn = () => {
        const makeModelResults = getModelsByMakeFromDB(makeSearchString, db);
        db.close();
        callbackFn(makeModelResults);
    };
    let useAPI = false;
    const nowMillis = Date.now();
    const searchRecord = db.prepare("select searchExpiryMillis from MakeModelSearchHistory" +
        " where searchString = ?")
        .get(makeSearchString);
    if (searchRecord) {
        if (searchRecord.searchExpiryMillis < nowMillis) {
            useAPI = true;
            db.prepare("update MakeModelSearchHistory" +
                " set searchExpiryMillis = ?" +
                " where searchString = ?")
                .run(nowMillis + nhtsaSearchExpiryDurationMillis, makeSearchString);
        }
    }
    else {
        useAPI = true;
        db.prepare("insert into MakeModelSearchHistory" +
            " (searchString, resultCount, searchExpiryMillis)" +
            " values (?, ?, ?)")
            .run(makeSearchString, 0, nowMillis + nhtsaSearchExpiryDurationMillis);
    }
    if (useAPI) {
        fetch(nhtsaApiURL + "getmodelsformake/" + encodeURIComponent(makeSearchString) + "?format=json")
            .then(async (response) => await response.json())
            .then((data) => {
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
                    .run(record.Make_ID, record.Make_Name, record.Model_ID, record.Model_Name, nowMillis, nowMillis);
                if (info.changes === 0) {
                    db.prepare(updateSQL).run(nowMillis, record.Make_Name, record.Model_Name);
                }
            }
        })
            .catch((_e) => {
        })
            .finally(() => {
            queryCloseCallbackFn();
        });
    }
    else {
        queryCloseCallbackFn();
    }
};
export const getMakeFromNCIC = (vehicleNCIC) => {
    return ncic.allNCIC[vehicleNCIC] || vehicleNCIC;
};
export const isNCICExclusivelyTrailer = (vehicleNCIC) => {
    if (trailerNCIC.hasOwnProperty(vehicleNCIC) && !ncic.vehicleNCIC.hasOwnProperty(vehicleNCIC)) {
        return true;
    }
    return false;
};
