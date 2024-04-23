import type { CacheTableName } from '../types/applicationTypes.js';
import type { ParkingBylaw, ParkingLocation } from '../types/recordTypes.js';
export declare function getParkingBylaws(): ParkingBylaw[];
export declare function getParkingLocations(): ParkingLocation[];
export declare function clearCacheByTableName(tableName: CacheTableName, relayMessage?: boolean): void;
