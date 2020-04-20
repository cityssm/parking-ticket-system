"use strict";

window.pts = {};


// CONFIG DEFAULTS

(function() {

  let defaultConfigProperties = {};
  let defaultConfigPropertiesIsLoaded = false;

  const loadConfigPropertiesFromStorage = function() {

    try {

      const defaultConfigPropertiesString = window.localStorage.getItem("defaultConfigProperties");

      if (defaultConfigPropertiesString) {

        defaultConfigProperties = JSON.parse(defaultConfigPropertiesString);
        defaultConfigPropertiesIsLoaded = true;

        return true;

      }

    } catch (e) {
      // Ignore
    }

    return false;

  };

  pts.loadDefaultConfigProperties = function(callbackFn) {

    if (defaultConfigPropertiesIsLoaded) {

      callbackFn();
      return;

    }

    if (loadConfigPropertiesFromStorage()) {

      callbackFn();
      return;

    }

    cityssm.postJSON(
      "/dashboard/doGetDefaultConfigProperties", {},
      function(defaultConfigPropertiesResult) {

        defaultConfigProperties = defaultConfigPropertiesResult;
        defaultConfigPropertiesIsLoaded = true;

        try {

          window.localStorage.setItem("defaultConfigProperties", JSON.stringify(defaultConfigProperties));

        } catch (e) {
          // Ignore
        }

        callbackFn();

      }
    );

  };

  pts.getDefaultConfigProperty = function(propertyName, propertyValueCallbackFn) {

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

    pts.loadDefaultConfigProperties(function() {

      propertyValueCallbackFn(defaultConfigProperties[propertyName]);

    });

  };

  pts.getLicencePlateCountryProperties = function(originalLicencePlateCountry) {

    if (!defaultConfigPropertiesIsLoaded) {

      return {};

    }

    const licencePlateCountryAlias =
      defaultConfigProperties.licencePlateCountryAliases[originalLicencePlateCountry.toUpperCase()] ||
      originalLicencePlateCountry;

    if (defaultConfigProperties.licencePlateProvinces.hasOwnProperty(licencePlateCountryAlias)) {

      return defaultConfigProperties.licencePlateProvinces[licencePlateCountryAlias];

    }

    return {};

  };

  pts.getLicencePlateLocationProperties =
    function(originalLicencePlateCountry, originalLicencePlateProvince) {

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
        defaultConfigProperties.licencePlateCountryAliases[originalLicencePlateCountry.toUpperCase()] ||
        originalLicencePlateCountry;

      // Get the province alias

      let licencePlateProvinceAlias = originalLicencePlateProvince;

      if (defaultConfigProperties.licencePlateProvinceAliases.hasOwnProperty(licencePlateCountryAlias)) {

        licencePlateProvinceAlias =
          defaultConfigProperties.licencePlateProvinceAliases[licencePlateCountryAlias][originalLicencePlateProvince.toUpperCase()] ||
          originalLicencePlateProvince;

      }

      // Get the province object

      let licencePlateProvince = licencePlateProvinceDefault;

      if (defaultConfigProperties.licencePlateProvinces.hasOwnProperty(licencePlateCountryAlias)) {

        licencePlateProvince =
          defaultConfigProperties.licencePlateProvinces[licencePlateCountryAlias].provinces[licencePlateProvinceAlias] || licencePlateProvinceDefault;

      }

      // Return

      return {
        licencePlateCountryAlias: licencePlateCountryAlias,
        licencePlateProvinceAlias: licencePlateProvinceAlias,
        licencePlateProvince: licencePlateProvince
      };

    };

  const ticketStatusKeyToObject = new Map();
  let ticketStatusKeyToObjectIsLoaded = false;

  pts.getTicketStatus = function(statusKey) {

    const noResult = {
      statusKey: statusKey,
      status: statusKey
    };

    if (!defaultConfigPropertiesIsLoaded) {

      return noResult;

    }

    if (!ticketStatusKeyToObjectIsLoaded) {

      for (let index = 0; index < defaultConfigProperties.parkingTicketStatuses.length; index += 1) {

        const ticketStatusObj = defaultConfigProperties.parkingTicketStatuses[index];
        ticketStatusKeyToObject.set(ticketStatusObj.statusKey, ticketStatusObj);

      }

      ticketStatusKeyToObjectIsLoaded = true;

    }

    return ticketStatusKeyToObject.has(statusKey) ? ticketStatusKeyToObject.get(statusKey) : noResult;

  };

}());


// TABS

pts.initializeTabs = function(tabsListEle, callbackFns) {

  if (!tabsListEle) {

    return;

  }

  const isPanelOrMenuListTabs =
    tabsListEle.classList.contains("panel-tabs") || tabsListEle.classList.contains("menu-list");


  const listItemEles = tabsListEle.getElementsByTagName(isPanelOrMenuListTabs ? "a" : "li");
  const tabLinkEles = (isPanelOrMenuListTabs ? listItemEles : tabsListEle.getElementsByTagName("a"));

  function tabClickFn(clickEvent) {

    clickEvent.preventDefault();

    const tabLinkEle = clickEvent.currentTarget;
    const tabContentEle = document.getElementById(tabLinkEle.getAttribute("href").substring(1));

    for (let index = 0; index < listItemEles.length; index += 1) {

      listItemEles[index].classList.remove("is-active");
      tabLinkEles[index].setAttribute("aria-selected", "false");

    }

    // Add is-active to the selected tab
    (isPanelOrMenuListTabs ? tabLinkEle : tabLinkEle.parentNode).classList.add("is-active");
    tabLinkEle.setAttribute("aria-selected", "true");

    const tabContentEles = tabContentEle.parentNode.getElementsByClassName("tab-content");

    for (let index = 0; index < tabContentEles.length; index += 1) {

      tabContentEles[index].classList.remove("is-active");

    }

    tabContentEle.classList.add("is-active");

    if (callbackFns && callbackFns.onshown) {

      callbackFns.onshown(tabContentEle);

    }

  }

  for (let index = 0; index < listItemEles.length; index += 1) {

    (isPanelOrMenuListTabs ?
      listItemEles[index] :
      listItemEles[index].getElementsByTagName("a")[0]).addEventListener("click", tabClickFn);

  }

};


// TOGGLE CONTAINERS

(function() {

  function toggleHiddenFn(clickEvent) {

    clickEvent.preventDefault();

    const href = clickEvent.currentTarget.href;
    const divID = href.substring(href.indexOf("#") + 1);

    document.getElementById(divID).classList.toggle("is-hidden");

  }

  pts.initializeToggleHiddenLinks = function(searchContainerEle) {

    const linkEles = searchContainerEle.getElementsByClassName("is-toggle-hidden-link");

    for (let index = 0; index < linkEles.length; index += 1) {

      linkEles[index].addEventListener("click", toggleHiddenFn);

    }

  };

}());
