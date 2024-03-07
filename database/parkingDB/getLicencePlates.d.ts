import type { LicencePlate } from '../../types/recordTypes.js';
export interface GetLicencePlatesQueryOptions {
    licencePlateNumber?: string;
    hasOwnerRecord?: boolean;
    hasUnresolvedTickets?: boolean;
    limit: number;
    offset: number;
}
export interface GetLicencePlatesReturn {
    count: number;
    limit: number;
    offset: number;
    licencePlates: LicencePlate[];
}
export default function getLicencePlates(queryOptions: GetLicencePlatesQueryOptions): GetLicencePlatesReturn;
