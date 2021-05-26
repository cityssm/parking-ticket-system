import type * as pts from "../../types/recordTypes";
export interface AddUpdateParkingOffenceReturn {
    success: boolean;
    message?: string;
    offences?: pts.ParkingOffence[];
}
export declare const getParkingOffences: () => pts.ParkingOffence[];
export declare const getParkingOffencesByLocationKey: (locationKey: string) => pts.ParkingOffence[];
export default getParkingOffences;
