import type * as pts from "../../types/recordTypes";
export interface GetLicencePlatesQueryOptions {
    licencePlateNumber?: string;
    hasOwnerRecord?: boolean;
    hasUnresolvedTickets?: boolean;
    limit: number;
    offset: number;
}
export declare const getLicencePlates: (queryOptions: GetLicencePlatesQueryOptions) => {
    count: number;
    limit: number;
    offset: number;
    licencePlates: pts.LicencePlate[];
};
export default getLicencePlates;
