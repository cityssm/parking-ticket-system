import type * as pts from "../../types/recordTypes";
export interface AddUpdateParkingBylawReturn {
    success: boolean;
    message?: string;
    bylaws?: pts.ParkingBylaw[];
}
export declare const getParkingBylaws: () => pts.ParkingBylaw[];
export declare const getParkingBylawsWithOffenceStats: () => pts.ParkingBylaw[];
