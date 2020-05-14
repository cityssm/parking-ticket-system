export declare type ptsGlobal = {
    loadDefaultConfigProperties?: (callbackFn: () => void) => void;
    getDefaultConfigProperty?: (propertyName: string, propertyValueCallbackFn: (propertyValue: any) => void) => void;
    getLicencePlateCountryProperties?: (originalLicencePlateCountry: string) => {
        provinces: {
            provinceShortName: string;
        }[];
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
    getTicketStatus?: (statusKey: string) => {
        statusKey: string;
        status: string;
        statusField: {
            fieldLabel: string;
        };
        isFinalStatus: boolean;
    };
    initializeTabs?: (tabsListEle: HTMLElement, callbackFns?: {
        onshown?: (tabContentEle: HTMLElement) => void;
    }) => void;
    initializeToggleHiddenLinks?: (containerEle: HTMLElement) => void;
};
