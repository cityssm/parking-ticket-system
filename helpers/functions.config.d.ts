import { configDefaultValues } from '../data/configDefaultValues.js';
import type { ConfigParkingTicketStatus } from '../types/configTypes.js';
export declare function getConfigProperty<K extends keyof typeof configDefaultValues>(propertyName: K, fallbackValue?: (typeof configDefaultValues)[K]): (typeof configDefaultValues)[K];
export declare const keepAliveMillis: number;
export declare function getParkingTicketStatus(statusKey: string): ConfigParkingTicketStatus | undefined;
interface LicencePlateLocationProperties {
    licencePlateCountryAlias: string;
    licencePlateProvinceAlias: string;
    licencePlateProvince: {
        provinceShortName: string;
        color: string;
        backgroundColor: string;
    };
}
export declare function getLicencePlateLocationProperties(originalLicencePlateCountry: string, originalLicencePlateProvince: string): LicencePlateLocationProperties;
declare const _default: {
    getConfigProperty: typeof getConfigProperty;
    keepAliveMillis: number;
    getParkingTicketStatus: typeof getParkingTicketStatus;
    getLicencePlateLocationProperties: typeof getLicencePlateLocationProperties;
};
export default _default;
