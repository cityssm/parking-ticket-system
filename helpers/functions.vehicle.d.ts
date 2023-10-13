import type { NHTSAMakeModel } from '../types/recordTypes.js';
export declare function getModelsByMakeFromCache(makeSearchStringOriginal: string): NHTSAMakeModel[];
export declare function getModelsByMake(makeSearchStringOriginal: string): Promise<NHTSAMakeModel[]>;
export declare const getMakeFromNCIC: (vehicleNCIC: string) => string;
export declare const isNCICExclusivelyTrailer: (vehicleNCIC: string) => boolean;
