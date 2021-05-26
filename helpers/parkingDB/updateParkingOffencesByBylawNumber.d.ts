import type { AddUpdateParkingBylawReturn } from "./getParkingBylaws";
export declare const updateParkingOffencesByBylawNumber: (reqBody: {
    bylawNumber: string;
    offenceAmount: string;
    discountDays: string;
    discountOffenceAmount: string;
}) => AddUpdateParkingBylawReturn;
export default updateParkingOffencesByBylawNumber;
