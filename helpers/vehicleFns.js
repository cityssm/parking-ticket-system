"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNCICExclusivelyTrailer = exports.getMakeFromNCIC = exports.getModelsByMake = exports.getModelsByMakeFromCache = void 0;
const sqlite = require("better-sqlite3");
const node_fetch_1 = require("node-fetch");
const ncic = require("../data/ncicCodes");
const trailer_1 = require("../data/ncicCodes/trailer");
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
exports.getModelsByMakeFromCache = (makeSearchStringOriginal) => {
    const makeSearchString = makeSearchStringOriginal.trim().toLowerCase();
    const db = sqlite(dbPath);
    const makeModelResults = getModelsByMakeFromDB(makeSearchString, db);
    db.close();
    return makeModelResults;
};
exports.getModelsByMake = (makeSearchStringOriginal, callbackFn) => {
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
        node_fetch_1.default(nhtsaApiURL + "getmodelsformake/" + encodeURIComponent(makeSearchString) + "?format=json")
            .then((response) => __awaiter(void 0, void 0, void 0, function* () { return yield response.json(); }))
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
exports.getMakeFromNCIC = (vehicleNCIC) => {
    return ncic.allNCIC[vehicleNCIC] || vehicleNCIC;
};
exports.isNCICExclusivelyTrailer = (vehicleNCIC) => {
    if (trailer_1.trailerNCIC.hasOwnProperty(vehicleNCIC) && !ncic.vehicleNCIC.hasOwnProperty(vehicleNCIC)) {
        return true;
    }
    return false;
};
