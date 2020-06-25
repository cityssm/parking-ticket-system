import type * as pts from "../helpers/ptsTypes";
export declare const getProperty: (propertyName: string) => any;
export declare const keepAliveMillis: number;
export declare const getParkingTicketStatus: (statusKey: string) => pts.ConfigParkingTicketStatus;
export declare const getLicencePlateLocationProperties: (originalLicencePlateCountry: string, originalLicencePlateProvince: string) => {
    licencePlateCountryAlias: string;
    licencePlateProvinceAlias: string;
    licencePlateProvince: {
        provinceShortName: string;
        color: string;
        backgroundColor: string;
    };
};
