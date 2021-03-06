import * as configTypes from "./configTypes";
export interface ptsGlobal {
    loadDefaultConfigProperties?: (callbackFn: () => void) => void;
    getDefaultConfigProperty?: (propertyName: string, propertyValueCallbackFn: (propertyValue: any) => void) => void;
    getLicencePlateCountryProperties?: (originalLicencePlateCountry: string) => {
        provinces?: Array<{
            provinceShortName: string;
        }>;
    };
    getLicencePlateLocationProperties?: (originalLicencePlateCountry: string, originalLicencePlateProvince: string) => {
        licencePlateCountryAlias: string;
        licencePlateProvinceAlias: string;
        licencePlateProvince: {
            provinceShortName: string;
            color: string;
            backgroundColor: string;
        };
    };
    getTicketStatus?: (statusKey: string) => configTypes.ConfigParkingTicketStatus;
    getLocationClass?: (locationClassKey: string) => configTypes.ConfigLocationClass;
    initializeTabs?: (tabsListEle: HTMLElement, callbackFns?: {
        onshown?: (tabContentEle: HTMLElement) => void;
    }) => void;
    initializeToggleHiddenLinks?: (containerEle: HTMLElement) => void;
}
