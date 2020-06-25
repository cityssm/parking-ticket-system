import type * as pts from "./ptsTypes";
export declare const getParkingLocations: () => pts.ParkingLocation[];
interface AddUpdateParkingLocationReturn {
    success: boolean;
    message?: string;
    locations?: pts.ParkingLocation[];
}
export declare const addParkingLocation: (reqBody: pts.ParkingLocation) => AddUpdateParkingLocationReturn;
export declare const updateParkingLocation: (reqBody: pts.ParkingLocation) => AddUpdateParkingLocationReturn;
export declare const deleteParkingLocation: (locationKey: string) => AddUpdateParkingLocationReturn;
export declare const getParkingBylaws: () => pts.ParkingBylaw[];
export declare const getParkingBylawsWithOffenceStats: () => pts.ParkingBylaw[];
interface AddUpdateParkingBylawReturn {
    success: boolean;
    message?: string;
    bylaws?: pts.ParkingBylaw[];
}
export declare const addParkingBylaw: (reqBody: pts.ParkingBylaw) => AddUpdateParkingBylawReturn;
export declare const updateParkingBylaw: (reqBody: pts.ParkingBylaw) => AddUpdateParkingBylawReturn;
export declare const deleteParkingBylaw: (bylawNumber: string) => AddUpdateParkingBylawReturn;
export declare const updateParkingOffencesByBylawNumber: (reqBody: any) => AddUpdateParkingBylawReturn;
export declare const getParkingOffences: () => pts.ParkingOffence[];
export declare const getParkingOffencesByLocationKey: (locationKey: string) => pts.ParkingOffence[];
interface AddUpdateParkingOffenceReturn {
    success: boolean;
    message?: string;
    offences?: pts.ParkingOffence[];
}
export declare const addParkingOffence: (reqBody: pts.ParkingOffence) => AddUpdateParkingOffenceReturn;
export declare const updateParkingOffence: (reqBody: pts.ParkingOffence) => AddUpdateParkingOffenceReturn;
export declare const deleteParkingOffence: (bylawNumber: string, locationKey: string) => AddUpdateParkingOffenceReturn;
export {};
