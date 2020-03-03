export declare let config: {};
export declare function getProperty(propertyName: string): any;
export declare function getParkingTicketStatus(statusKey: string): any;
export declare function getLicencePlateLocationProperties(originalLicencePlateCountry: string, originalLicencePlateProvince: string): {
    licencePlateCountryAlias: string;
    licencePlateProvinceAlias: string;
    licencePlateProvince: {
        provinceShortName: string;
        color: string;
        backgroundColor: string;
    };
};
