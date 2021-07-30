import type { ParkingBylaw } from "../../types/recordTypes";
export declare const updateParkingOffencesByBylawNumber: (requestBody: {
    bylawNumber: string;
    offenceAmount: string;
    discountDays: string;
    discountOffenceAmount: string;
}) => {
    success: boolean;
    bylaws?: ParkingBylaw[];
};
export default updateParkingOffencesByBylawNumber;
