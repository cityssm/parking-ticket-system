import sqlite = require("better-sqlite3");
const dbPath = "data/users.db";

const nhtsaApiURL = "https://vpic.nhtsa.dot.gov/api/vehicles/";

const nhtsaSearchExpiryDurationMillis = 7 * 86400 * 1000;


function getModelsByMakeFromDB(makeSearchString: string, db: sqlite.Database) {

  return db.prepare("select makeID, makeName, modelID, modelName" +
    " from MakeModel" +
    " where instr(lower(makeName), ?)" +
    " order by makeName, modelName")
    .all(makeSearchString);
}


export function getModelsByMake(makeSearchStringOriginal: string) {

  const makeSearchString = makeSearchStringOriginal.trim().toLowerCase();

  let useAPI = false;

  // check if the search string has been searched for recently

  const db = sqlite(dbPath)

  const nowMillis = Date.now();

  const searchRecord = db.prepare("select searchExpiryMillis from MakeModelSearchHistory" +
    " where searchString = ?")
    .get();

  if (searchRecord && searchRecord.searchExpiryMillis < nowMillis) {

    // expired
    // update searchExpiryMillis to avoid multiple queries

    useAPI = true;

    db.prepare("update MakeModelSearchHistory" +
      " set searchExpiryMillis = ?" +
      " where searchString = ?")
      .run(nowMillis + nhtsaSearchExpiryDurationMillis, makeSearchString);

  }

  if (useAPI) {

  } else {

    const makeModelResults = getModelsByMakeFromDB(makeSearchString, db);

    db.close();

    return makeModelResults;
  }

}
