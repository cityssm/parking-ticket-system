"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite = require("better-sqlite3");
const dbPath = "data/users.db";
const nhtsaApiURL = "https://vpic.nhtsa.dot.gov/api/vehicles/";
const nhtsaSearchExpiryDurationMillis = 7 * 86400 * 1000;
function getModelsByMakeFromDB(makeSearchString, db) {
    return db.prepare("select makeID, makeName, modelID, modelName" +
        " from MakeModel" +
        " where instr(lower(makeName), ?)" +
        " order by makeName, modelName")
        .all(makeSearchString);
}
function getModelsByMake(makeSearchStringOriginal) {
    const makeSearchString = makeSearchStringOriginal.trim().toLowerCase();
    let useAPI = false;
    const db = sqlite(dbPath);
    const nowMillis = Date.now();
    const searchRecord = db.prepare("select searchExpiryMillis from MakeModelSearchHistory" +
        " where searchString = ?")
        .get();
    if (searchRecord && searchRecord.searchExpiryMillis < nowMillis) {
        useAPI = true;
        db.prepare("update MakeModelSearchHistory" +
            " set searchExpiryMillis = ?" +
            " where searchString = ?")
            .run(nowMillis + nhtsaSearchExpiryDurationMillis, makeSearchString);
    }
    if (useAPI) {
    }
    else {
        const makeModelResults = getModelsByMakeFromDB(makeSearchString, db);
        db.close();
        return makeModelResults;
    }
}
exports.getModelsByMake = getModelsByMake;
