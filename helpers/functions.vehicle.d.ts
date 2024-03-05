import type { NHTSAMakeModel } from '../types/recordTypes.js';
export declare function getModelsByMakeFromCache(makeSearchStringOriginal: string): NHTSAMakeModel[];
export declare function getModelsByMake(makeSearchStringOriginal: string): Promise<NHTSAMakeModel[]>;
export declare function getMakeFromNCIC(vehicleNCIC: string): Promise<string>;
export declare function isNCICExclusivelyTrailer(vehicleNCIC: string): Promise<boolean>;
