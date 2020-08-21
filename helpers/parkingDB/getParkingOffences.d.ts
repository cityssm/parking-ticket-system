import type * as pts from "../ptsTypes";
export interface AddUpdateParkingOffenceReturn {
    success: boolean;
    message?: string;
    offences?: pts.ParkingOffence[];
}
export declare const getParkingOffences: () => pts.ParkingOffence[];
export declare const getParkingOffencesByLocationKey: (locationKey: string) => pts.ParkingOffence[];
