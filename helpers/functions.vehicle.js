import { getNhtsaCompatibleMake } from '@cityssm/ncic-lookup/helpers/vma.js';
import { GetModelsForMake } from '@shaggytools/nhtsa-api-wrapper';
import sqlite from 'better-sqlite3';
import { nhtsaDB as databasePath } from '../data/databasePaths.js';
const nhtsaSearchExpiryDurationMillis = 14 * 86_400 * 1000;
function getModelsByMakeFromDB(makeSearchString, database) {
    return database
        .prepare(`select makeId, makeName, modelId, modelName
        from MakeModel
        where instr(lower(makeName), ?)
        and recordDelete_timeMillis is null
        order by makeName, modelName`)
        .all(makeSearchString);
}
export function getModelsByMakeFromCache(makeSearchStringOriginal) {
    const makeSearchString = makeSearchStringOriginal.trim().toLowerCase();
    const database = sqlite(databasePath);
    const makeModelResults = getModelsByMakeFromDB(makeSearchString, database);
    database.close();
    return makeModelResults;
}
export async function getModelsByMake(makeSearchStringOriginal) {
    const makeSearchString = makeSearchStringOriginal.trim().toLowerCase();
    const database = sqlite(databasePath);
    const queryCloseCallbackFunction = () => {
        const makeModelResults = getModelsByMakeFromDB(makeSearchString, database);
        database.close();
        return makeModelResults;
    };
    let useAPI = false;
    const nowMillis = Date.now();
    const searchRecord = database
        .prepare(`select searchExpiryMillis
        from MakeModelSearchHistory
        where searchString = ?`)
        .get(makeSearchString);
    if (searchRecord === undefined) {
        useAPI = true;
        database
            .prepare(`insert into MakeModelSearchHistory (
          searchString, resultCount, searchExpiryMillis)
          values (?, ?, ?)`)
            .run(makeSearchString, 0, nowMillis + nhtsaSearchExpiryDurationMillis);
    }
    else {
        if (searchRecord.searchExpiryMillis < nowMillis) {
            useAPI = true;
            database
                .prepare(`update MakeModelSearchHistory
            set searchExpiryMillis = ?
            where searchString = ?`)
                .run(nowMillis + nhtsaSearchExpiryDurationMillis, makeSearchString);
        }
    }
    if (useAPI) {
        const data = await GetModelsForMake(makeSearchString);
        database
            .prepare(`update MakeModelSearchHistory
          set resultCount = ?
          where searchString = ?`)
            .run(data.Count, makeSearchString);
        const insertSQL = `insert or ignore into MakeModel (
      makeId, makeName, modelId, modelName,
      recordCreate_timeMillis, recordUpdate_timeMillis)
      values (?, ?, ?, ?, ?, ?)`;
        const updateSQL = `update MakeModel
      set recordUpdate_timeMillis = ?
      where makeName = ?
      and modelName = ?`;
        for (const record of data.Results) {
            const info = database
                .prepare(insertSQL)
                .run(record.Make_ID, record.Make_Name, record.Model_ID, record.Model_Name, nowMillis, nowMillis);
            if (info.changes === 0) {
                database
                    .prepare(updateSQL)
                    .run(nowMillis, record.Make_Name, record.Model_Name);
            }
        }
    }
    return queryCloseCallbackFunction();
}
export async function getMakeFromNCIC(vehicleNCIC) {
    return (await getNhtsaCompatibleMake(vehicleNCIC)) ?? vehicleNCIC;
}
