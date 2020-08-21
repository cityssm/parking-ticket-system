import type * as pts from "../ptsTypes";
export interface AddUpdateParkingLocationReturn {
    success: boolean;
    message?: string;
    locations?: pts.ParkingLocation[];
}
export declare const getParkingLocations: () => pts.ParkingLocation[];
