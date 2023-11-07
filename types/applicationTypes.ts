type MessageTypes = 'clearCache'

export interface WorkerMessage {
  messageType: MessageTypes
  timeMillis: number
  pid: number
}

export type CacheTableName =
  | 'AssetCategories'
  | 'AssetAliasTypes'
  | 'EnergyData'

export interface ClearCacheWorkerMessage extends WorkerMessage {
  messageType: 'clearCache'
  tableName: CacheTableName
}
