import type { NHTSAMakeModel } from "./ptsTypes";
export declare const getModelsByMakeFromCache: (makeSearchStringOriginal: string) => NHTSAMakeModel[];
export declare const getModelsByMake: (makeSearchStringOriginal: string, callbackFn: (makeModelResults: NHTSAMakeModel[]) => void) => void;
export declare const getMakeFromNCIC: (vehicleNCIC: string) => string;
export declare const isNCICExclusivelyTrailer: (vehicleNCIC: string) => boolean;
