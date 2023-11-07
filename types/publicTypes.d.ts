import type { ConfigLocationClass, ConfigParkingTicketStatus } from './configTypes.js';
export interface ptsGlobal {
    loadDefaultConfigProperties: (callbackFunction: () => void) => void;
    getDefaultConfigProperty: (propertyName: string, propertyValueCallbackFunction: (propertyValue: unknown) => void) => void;
    getLicencePlateCountryProperties: (originalLicencePlateCountry: string) => {
        provinces?: Array<{
            provinceShortName: string;
        }>;
    };
    getLicencePlateLocationProperties: (originalLicencePlateCountry: string, originalLicencePlateProvince: string) => {
        licencePlateCountryAlias: string;
        licencePlateProvinceAlias: string;
        licencePlateProvince: {
            provinceShortName: string;
            color: string;
            backgroundColor: string;
        };
    };
    getTicketStatus: (statusKey: string) => ConfigParkingTicketStatus;
    getLocationClass: (locationClassKey: string) => ConfigLocationClass;
    initializeTabs: (tabsListElement: HTMLElement, callbackFunctions?: {
        onshown?: (tabContentElement: HTMLElement) => void;
    }) => void;
    initializeToggleHiddenLinks: (containerElement: HTMLElement) => void;
}
