export interface GetLicencePlatesQueryOptions {
    licencePlateNumber?: string;
    hasOwnerRecord?: boolean;
    hasUnresolvedTickets?: boolean;
    limit: number;
    offset: number;
}
export declare const getLicencePlates: (queryOptions: GetLicencePlatesQueryOptions) => {
    count: number;
    licencePlates: any[];
};
