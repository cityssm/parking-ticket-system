import * as pts from "../ptsTypes";
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
