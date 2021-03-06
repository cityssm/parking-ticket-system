import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { ptsGlobal } from "../../types/publicTypes";
import type * as configTypes from "../../types/configTypes";


declare const cityssm: cityssmGlobal;
const pts: ptsGlobal = {};


// CONFIG DEFAULTS

(() => {
  let defaultConfigProperties: {
    locationClasses?: configTypes.ConfigLocationClass[];
    ticketNumber_fieldLabel?: string;
    parkingTicketStatuses?: configTypes.ConfigParkingTicketStatus[];
    licencePlateCountryAliases?: { [countryShortName: string]: string };
    licencePlateProvinceAliases?: {
      [countryName: string]: { [provinceShortName: string]: string };
    };
    licencePlateProvinces?: {
      [countryName: string]: configTypes.ConfigLicencePlateCountry;
    };
  } = {};
  let defaultConfigPropertiesIsLoaded = false;

  const loadConfigPropertiesFromStorage = () => {
    try {
      const defaultConfigPropertiesString = window.localStorage.getItem(
        "defaultConfigProperties"
      );

      if (defaultConfigPropertiesString) {
        defaultConfigProperties = JSON.parse(defaultConfigPropertiesString);
        defaultConfigPropertiesIsLoaded = true;

        return true;
      }
    } catch (e) {
      defaultConfigProperties = {};
      defaultConfigPropertiesIsLoaded = true;
    }

    return false;
  };

  pts.loadDefaultConfigProperties = (callbackFn: () => void) => {
    if (defaultConfigPropertiesIsLoaded) {
      callbackFn();
      return;
    }

    if (loadConfigPropertiesFromStorage()) {
      callbackFn();
      return;
    }

    cityssm.postJSON(
      "/dashboard/doGetDefaultConfigProperties",
      {},
      (defaultConfigPropertiesResult) => {
        defaultConfigProperties = defaultConfigPropertiesResult;
        defaultConfigPropertiesIsLoaded = true;

        try {
          window.localStorage.setItem(
            "defaultConfigProperties",
            JSON.stringify(defaultConfigProperties)
          );
        } catch (_e) {
          // Ignore
        }

        callbackFn();
      }
    );
  };

  // tslint:disable-next-line:no-any
  pts.getDefaultConfigProperty = (
    propertyName,
    propertyValueCallbackFn: (propertyValue: any) => void
  ) => {
    // Check memory

    if (defaultConfigPropertiesIsLoaded) {
      propertyValueCallbackFn(defaultConfigProperties[propertyName]);
      return;
    }

    // Check local storage

    if (loadConfigPropertiesFromStorage()) {
      propertyValueCallbackFn(defaultConfigProperties[propertyName]);
      return;
    }

    // Populate local storage

    pts.loadDefaultConfigProperties(() => {
      propertyValueCallbackFn(defaultConfigProperties[propertyName]);
    });
  };

  pts.getLicencePlateCountryProperties = (originalLicencePlateCountry) => {
    if (!defaultConfigPropertiesIsLoaded) {
      return {};
    }

    const licencePlateCountryAlias =
      defaultConfigProperties.licencePlateCountryAliases[
      originalLicencePlateCountry.toUpperCase()
      ] || originalLicencePlateCountry;

    if (
      defaultConfigProperties.licencePlateProvinces.hasOwnProperty(
        licencePlateCountryAlias
      )
    ) {
      return defaultConfigProperties.licencePlateProvinces[
        licencePlateCountryAlias
      ];
    }

    return {};
  };

  pts.getLicencePlateLocationProperties = (
    originalLicencePlateCountry,
    originalLicencePlateProvince
  ) => {
    const licencePlateProvinceDefault = {
      provinceShortName: originalLicencePlateProvince,
      color: "#000",
      backgroundColor: "#fff"
    };

    if (!defaultConfigPropertiesIsLoaded) {
      return {
        licencePlateCountryAlias: originalLicencePlateCountry,
        licencePlateProvinceAlias: originalLicencePlateProvince,
        licencePlateProvince: licencePlateProvinceDefault
      };
    }

    // Get the country alias

    const licencePlateCountryAlias =
      defaultConfigProperties.licencePlateCountryAliases[
      originalLicencePlateCountry.toUpperCase()
      ] || originalLicencePlateCountry;

    // Get the province alias

    let licencePlateProvinceAlias = originalLicencePlateProvince;

    if (
      defaultConfigProperties.licencePlateProvinceAliases.hasOwnProperty(
        licencePlateCountryAlias
      )
    ) {
      const provinceAliases =
        defaultConfigProperties.licencePlateProvinceAliases[
        licencePlateCountryAlias
        ];

      licencePlateProvinceAlias =
        provinceAliases[originalLicencePlateProvince.toUpperCase()] ||
        originalLicencePlateProvince;
    }

    // Get the province object

    let licencePlateProvince = licencePlateProvinceDefault;

    if (
      defaultConfigProperties.licencePlateProvinces.hasOwnProperty(
        licencePlateCountryAlias
      )
    ) {
      licencePlateProvince =
        defaultConfigProperties.licencePlateProvinces[licencePlateCountryAlias]
          .provinces[licencePlateProvinceAlias] || licencePlateProvinceDefault;
    }

    // Return

    return {
      licencePlateCountryAlias,
      licencePlateProvinceAlias,
      licencePlateProvince
    };
  };

  const ticketStatusKeyToObject = new Map<string, configTypes.ConfigParkingTicketStatus>();
  let ticketStatusKeyToObjectIsLoaded = false;

  pts.getTicketStatus = (statusKey) => {

    const noResult = {
      statusKey,
      status: statusKey,
      isUserSettable: false,
      isFinalStatus: false
    };

    if (!defaultConfigPropertiesIsLoaded) {
      return noResult;
    }

    if (!ticketStatusKeyToObjectIsLoaded) {
      for (const ticketStatusObj of defaultConfigProperties.parkingTicketStatuses) {
        ticketStatusKeyToObject.set(ticketStatusObj.statusKey, ticketStatusObj);
      }

      ticketStatusKeyToObjectIsLoaded = true;
    }

    return ticketStatusKeyToObject.has(statusKey)
      ? ticketStatusKeyToObject.get(statusKey)
      : noResult;
  };

  const locationClassKeyToObject = new Map<string, configTypes.ConfigLocationClass>();
  let locationClassKeyToObjectIsLoaded = false;

  pts.getLocationClass = (locationClassKey) => {

    const noResult: configTypes.ConfigLocationClass = {
      locationClassKey,
      locationClass: locationClassKey
    };

    if (!defaultConfigPropertiesIsLoaded) {
      return noResult;
    }

    if (!locationClassKeyToObjectIsLoaded) {
      for (const locationClassObj of defaultConfigProperties.locationClasses) {
        locationClassKeyToObject.set(locationClassObj.locationClassKey, locationClassObj);
      }

      locationClassKeyToObjectIsLoaded = true;
    }

    return locationClassKeyToObject.has(locationClassKey)
      ? locationClassKeyToObject.get(locationClassKey)
      : noResult;
  };
})();

// TABS

pts.initializeTabs = (tabsListEle, callbackFns) => {
  if (!tabsListEle) {
    return;
  }

  const isPanelOrMenuListTabs =
    tabsListEle.classList.contains("panel-tabs") ||
    tabsListEle.classList.contains("menu-list");

  const listItemEles = tabsListEle.getElementsByTagName(
    isPanelOrMenuListTabs ? "a" : "li"
  );
  const tabLinkEles = isPanelOrMenuListTabs
    ? listItemEles
    : tabsListEle.getElementsByTagName("a");

  const tabClickFn = (clickEvent: Event) => {
    clickEvent.preventDefault();

    const tabLinkEle = clickEvent.currentTarget as HTMLAnchorElement;
    const tabContentEle = document.getElementById(
      tabLinkEle.getAttribute("href").substring(1)
    );

    for (let index = 0; index < listItemEles.length; index += 1) {
      listItemEles[index].classList.remove("is-active");
      tabLinkEles[index].setAttribute("aria-selected", "false");
    }

    // Add is-active to the selected tab
    (isPanelOrMenuListTabs
      ? tabLinkEle
      : tabLinkEle.parentElement
    ).classList.add("is-active");
    tabLinkEle.setAttribute("aria-selected", "true");

    const tabContentEles = tabContentEle.parentElement.getElementsByClassName(
      "tab-content"
    );

    for (const tabContentEle of tabContentEles) {
      tabContentEle.classList.remove("is-active");
    }

    tabContentEle.classList.add("is-active");

    if (callbackFns ?.onshown) {
      callbackFns.onshown(tabContentEle);
    }
  };

  for (const listItemEle of listItemEles) {
    (isPanelOrMenuListTabs
      ? listItemEle
      : listItemEle.getElementsByTagName("a")[0]
    ).addEventListener("click", tabClickFn);
  }
};

// TOGGLE CONTAINERS

(() => {
  const toggleHiddenFn = (clickEvent: Event) => {
    clickEvent.preventDefault();

    const href = (clickEvent.currentTarget as HTMLAnchorElement).href;
    const divID = href.substring(href.indexOf("#") + 1);

    document.getElementById(divID).classList.toggle("is-hidden");
  };

  pts.initializeToggleHiddenLinks = (searchContainerEle) => {
    const linkEles = searchContainerEle.getElementsByClassName(
      "is-toggle-hidden-link"
    );

    for (const linkEle of linkEles) {
      linkEle.addEventListener("click", toggleHiddenFn);
    }
  };
})();
