export declare const getModelsByMakeFromCache: (makeSearchStringOriginal: string) => any[];
export declare const getModelsByMake: (makeSearchStringOriginal: string, callbackFn: (makeModelResults: any[]) => void) => void;
export declare const getMakeFromNCIC: (vehicleNCIC: string) => string;
export declare const isNCICExclusivelyTrailer: (vehicleNCIC: string) => boolean;
