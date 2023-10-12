import sqlite from 'better-sqlite3'

import { nhtsaDB as nhtsaDatabasePath } from '../data/databasePaths.js'

import debug from 'debug'
const debugSQL = debug('parking-ticket-system:initializeDatabase')

export const initNHTSADB = (): boolean => {
  const nhtsaDB = sqlite(nhtsaDatabasePath)

  let doCreate = false

  const row = nhtsaDB
    .prepare(
      "select name from sqlite_master where type = 'table' and name = 'MakeModel'"
    )
    .get()

  if (!row) {
    debugSQL('Creating ' + nhtsaDatabasePath)
    doCreate = true

    nhtsaDB
      .prepare(
        'create table if not exists MakeModelSearchHistory (' +
          'searchString varchar(50) primary key not null,' +
          ' resultCount integer not null,' +
          ' searchExpiryMillis integer not null' +
          ') without rowid'
      )
      .run()

    nhtsaDB
      .prepare(
        'create table if not exists MakeModel (' +
          'makeID integer, makeName varchar(50), modelID integer, modelName varchar(50),' +
          ' recordCreate_timeMillis integer not null,' +
          ' recordUpdate_timeMillis integer not null,' +
          ' recordDelete_timeMillis integer,' +
          ' primary key (makeName, modelName)' +
          ') without rowid'
      )
      .run()
  }

  nhtsaDB.close()

  return doCreate
}
