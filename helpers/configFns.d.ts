import type * as pts from "../helpers/ptsTypes";
export declare let config: {};
export declare function getProperty(propertyName: string): any;
export declare const keepAliveMillis: number;
export declare function getParkingTicketStatus(statusKey: string): pts.Config_ParkingTicketStatus;
export declare function getLicencePlateLocationProperties(originalLicencePlateCountry: string, originalLicencePlateProvince: string): {
    licencePlateCountryAlias: string;
    licencePlateProvinceAlias: string;
    licencePlateProvince: {
        provinceShortName: string;
        color: string;
        backgroundColor: string;
    };
};
