import type { NHTSAMakeModel } from '../types/recordTypes';
export declare const getModelsByMakeFromCache: (makeSearchStringOriginal: string) => NHTSAMakeModel[];
export declare const getModelsByMake: (makeSearchStringOriginal: string) => Promise<NHTSAMakeModel[]>;
export declare const getMakeFromNCIC: (vehicleNCIC: string) => string;
export declare const isNCICExclusivelyTrailer: (vehicleNCIC: string) => boolean;
