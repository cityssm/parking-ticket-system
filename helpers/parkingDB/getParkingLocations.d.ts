import type * as pts from "../../types/recordTypes";
export interface AddUpdateParkingLocationReturn {
    success: boolean;
    message?: string;
    locations?: pts.ParkingLocation[];
}
export declare const getParkingLocations: () => pts.ParkingLocation[];
