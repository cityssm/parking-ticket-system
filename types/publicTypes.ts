import type * as configTypes from "./configTypes";

export interface ptsGlobal {

  loadDefaultConfigProperties?: (callbackFunction: () => void) => void;

  getDefaultConfigProperty?: (propertyName: string, propertyValueCallbackFunction: (propertyValue: unknown) => void) => void;

  getLicencePlateCountryProperties?: (originalLicencePlateCountry: string) => {
    provinces?: Array<{ provinceShortName: string }>;
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

  initializeTabs?: (tabsListElement: HTMLElement, callbackFunctions?: {
    onshown?: (tabContentElement: HTMLElement) => void;
  }) => void;

  initializeToggleHiddenLinks?: (containerElement: HTMLElement) => void;
}
