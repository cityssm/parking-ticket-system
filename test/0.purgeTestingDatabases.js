import assert from 'node:assert';
import { unlink } from 'node:fs/promises';
import { parkingDB_testing, nhtsaDB_testing } from '../data/databasePaths.js';
import { initNHTSADB } from '../database/nhtsaDB/initializeDatabase.js';
import { initializeDatabase as initializeParkingDatabase } from '../database/parkingDB/initializeDatabase.js';
describe('Reinitialize databases', () => {
    it(`Reinitialize ${parkingDB_testing}`, () => {
        try {
            void unlink(parkingDB_testing);
        }
        catch {
        }
        const success = initializeParkingDatabase();
        assert.ok(success);
    });
    it(`Reinitialize ${nhtsaDB_testing}`, () => {
        try {
            void unlink(nhtsaDB_testing);
        }
        catch {
        }
        const success = initNHTSADB();
        assert.ok(success);
    });
});
