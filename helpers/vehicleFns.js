"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite = require("better-sqlite3");
const dbPath = "data/nhtsa.db";
const fetch = require("node-fetch");
const nhtsaApiURL = "https://vpic.nhtsa.dot.gov/api/vehicles/";
const nhtsaSearchExpiryDurationMillis = 14 * 86400 * 1000;
function getModelsByMakeFromDB(makeSearchString, db) {
    return db.prepare("select makeID, makeName, modelID, modelName" +
        " from MakeModel" +
        " where instr(lower(makeName), ?)" +
        " and recordDelete_timeMillis is null" +
        " order by makeName, modelName")
        .all(makeSearchString);
}
function getModelsByMake(makeSearchStringOriginal, callbackFn) {
    const makeSearchString = makeSearchStringOriginal.trim().toLowerCase();
    console.log("searchString = " + makeSearchString);
    const db = sqlite(dbPath);
    const queryCloseCallbackFn = function () {
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
        console.log("API call");
        fetch(nhtsaApiURL + "getmodelsformake/" + makeSearchString + "?format=json")
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
                const record = data.Results[index];
                const info = db.prepare(insertSQL)
                    .run(record.Make_ID, record.Make_Name, record.Model_ID, record.Model_Name, nowMillis, nowMillis);
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
    }
    else {
        queryCloseCallbackFn();
        return;
    }
}
exports.getModelsByMake = getModelsByMake;
