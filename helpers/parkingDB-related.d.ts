import type * as pts from "./ptsTypes";
export declare function getParkingLocations(): pts.ParkingLocation[];
interface AddUpdateParkingLocationReturn {
    success: boolean;
    message?: string;
    locations?: pts.ParkingLocation[];
}
export declare function addParkingLocation(reqBody: pts.ParkingLocation): AddUpdateParkingLocationReturn;
export declare function updateParkingLocation(reqBody: pts.ParkingLocation): AddUpdateParkingLocationReturn;
export declare function deleteParkingLocation(locationKey: string): AddUpdateParkingLocationReturn;
export declare function getParkingBylaws(): pts.ParkingBylaw[];
export declare function getParkingBylawsWithOffenceStats(): pts.ParkingBylaw[];
interface AddUpdateParkingBylawReturn {
    success: boolean;
    message?: string;
    bylaws?: pts.ParkingBylaw[];
}
export declare function addParkingBylaw(reqBody: pts.ParkingBylaw): AddUpdateParkingBylawReturn;
export declare function updateParkingBylaw(reqBody: pts.ParkingBylaw): AddUpdateParkingBylawReturn;
export declare function deleteParkingBylaw(bylawNumber: string): AddUpdateParkingBylawReturn;
export declare function updateParkingOffencesByBylawNumber(reqBody: any): AddUpdateParkingBylawReturn;
export declare function getParkingOffences(): pts.ParkingOffence[];
export declare function getParkingOffencesByLocationKey(locationKey: string): pts.ParkingOffence[];
interface AddUpdateParkingOffenceReturn {
    success: boolean;
    message?: string;
    offences?: pts.ParkingOffence[];
}
export declare function addParkingOffence(reqBody: pts.ParkingOffence): AddUpdateParkingOffenceReturn;
export declare function updateParkingOffence(reqBody: pts.ParkingOffence): AddUpdateParkingOffenceReturn;
export declare function deleteParkingOffence(bylawNumber: string, locationKey: string): AddUpdateParkingOffenceReturn;
export {};
