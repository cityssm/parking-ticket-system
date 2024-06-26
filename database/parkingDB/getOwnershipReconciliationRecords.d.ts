import type { LicencePlate } from '../../types/recordTypes.js';
export interface ReconciliationRecord extends LicencePlate {
    ticket_ticketId: number;
    ticket_ticketNumber: string;
    ticket_issueDate: number;
    ticket_issueDateString?: string;
    ticket_vehicleMakeModel: string;
    ticket_licencePlateExpiryDate: number;
    ticket_licencePlateExpiryDateString?: string;
    owner_recordDate: number;
    owner_recordDateString?: string;
    owner_vehicleNCIC: string;
    owner_vehicleMake: string;
    owner_vehicleYear: number;
    owner_vehicleColor: string;
    owner_licencePlateExpiryDate: number;
    owner_licencePlateExpiryDateString?: string;
    owner_ownerName1: string;
    owner_ownerName2: string;
    owner_ownerAddress: string;
    owner_ownerCity: string;
    owner_ownerProvince: string;
    owner_ownerPostalCode: string;
    dateDifference: number;
    isVehicleMakeMatch: boolean;
    isLicencePlateExpiryDateMatch: boolean;
}
export default function getOwnershipReconciliationRecords(): Promise<ReconciliationRecord[]>;
