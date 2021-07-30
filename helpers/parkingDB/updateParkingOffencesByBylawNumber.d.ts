import type { AddUpdateParkingOffenceReturn } from "./getParkingOffences";
export declare const updateParkingOffencesByBylawNumber: (requestBody: {
    bylawNumber: string;
    offenceAmount: string;
    discountDays: string;
    discountOffenceAmount: string;
}) => AddUpdateParkingOffenceReturn;
export default updateParkingOffencesByBylawNumber;
