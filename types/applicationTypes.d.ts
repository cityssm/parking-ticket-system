type MessageTypes = 'clearCache';
export interface WorkerMessage {
    messageType: MessageTypes;
    timeMillis: number;
    pid: number;
}
export type CacheTableName = 'ParkingBylaws' | 'ParkingLocations';
export interface ClearCacheWorkerMessage extends WorkerMessage {
    messageType: 'clearCache';
    tableName: CacheTableName;
}
export {};
