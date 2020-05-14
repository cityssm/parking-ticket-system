"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pts = {};
(function () {
    var defaultConfigProperties = {};
    var defaultConfigPropertiesIsLoaded = false;
    var loadConfigPropertiesFromStorage = function () {
        try {
            var defaultConfigPropertiesString = window.localStorage.getItem("defaultConfigProperties");
            if (defaultConfigPropertiesString) {
                defaultConfigProperties = JSON.parse(defaultConfigPropertiesString);
                defaultConfigPropertiesIsLoaded = true;
                return true;
            }
        }
        catch (e) {
        }
        return false;
    };
    pts.loadDefaultConfigProperties = function (callbackFn) {
        if (defaultConfigPropertiesIsLoaded) {
            callbackFn();
            return;
        }
        if (loadConfigPropertiesFromStorage()) {
            callbackFn();
            return;
        }
        cityssm.postJSON("/dashboard/doGetDefaultConfigProperties", {}, function (defaultConfigPropertiesResult) {
            defaultConfigProperties = defaultConfigPropertiesResult;
            defaultConfigPropertiesIsLoaded = true;
            try {
                window.localStorage.setItem("defaultConfigProperties", JSON.stringify(defaultConfigProperties));
            }
            catch (e) {
            }
            callbackFn();
        });
    };
    pts.getDefaultConfigProperty = function (propertyName, propertyValueCallbackFn) {
        if (defaultConfigPropertiesIsLoaded) {
            propertyValueCallbackFn(defaultConfigProperties[propertyName]);
            return;
        }
        if (loadConfigPropertiesFromStorage()) {
            propertyValueCallbackFn(defaultConfigProperties[propertyName]);
            return;
        }
        pts.loadDefaultConfigProperties(function () {
            propertyValueCallbackFn(defaultConfigProperties[propertyName]);
        });
    };
    pts.getLicencePlateCountryProperties = function (originalLicencePlateCountry) {
        if (!defaultConfigPropertiesIsLoaded) {
            return {};
        }
        var licencePlateCountryAlias = defaultConfigProperties.licencePlateCountryAliases[originalLicencePlateCountry.toUpperCase()] ||
            originalLicencePlateCountry;
        if (defaultConfigProperties.licencePlateProvinces.hasOwnProperty(licencePlateCountryAlias)) {
            return defaultConfigProperties.licencePlateProvinces[licencePlateCountryAlias];
        }
        return {};
    };
    pts.getLicencePlateLocationProperties =
        function (originalLicencePlateCountry, originalLicencePlateProvince) {
            var licencePlateProvinceDefault = {
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
            var licencePlateCountryAlias = defaultConfigProperties.licencePlateCountryAliases[originalLicencePlateCountry.toUpperCase()] ||
                originalLicencePlateCountry;
            var licencePlateProvinceAlias = originalLicencePlateProvince;
            if (defaultConfigProperties.licencePlateProvinceAliases.hasOwnProperty(licencePlateCountryAlias)) {
                licencePlateProvinceAlias =
                    defaultConfigProperties.licencePlateProvinceAliases[licencePlateCountryAlias][originalLicencePlateProvince.toUpperCase()] ||
                        originalLicencePlateProvince;
            }
            var licencePlateProvince = licencePlateProvinceDefault;
            if (defaultConfigProperties.licencePlateProvinces.hasOwnProperty(licencePlateCountryAlias)) {
                licencePlateProvince =
                    defaultConfigProperties.licencePlateProvinces[licencePlateCountryAlias].provinces[licencePlateProvinceAlias] || licencePlateProvinceDefault;
            }
            return {
                licencePlateCountryAlias: licencePlateCountryAlias,
                licencePlateProvinceAlias: licencePlateProvinceAlias,
                licencePlateProvince: licencePlateProvince
            };
        };
    var ticketStatusKeyToObject = new Map();
    var ticketStatusKeyToObjectIsLoaded = false;
    pts.getTicketStatus = function (statusKey) {
        var noResult = {
            statusKey: statusKey,
            status: statusKey
        };
        if (!defaultConfigPropertiesIsLoaded) {
            return noResult;
        }
        if (!ticketStatusKeyToObjectIsLoaded) {
            for (var index = 0; index < defaultConfigProperties.parkingTicketStatuses.length; index += 1) {
                var ticketStatusObj = defaultConfigProperties.parkingTicketStatuses[index];
                ticketStatusKeyToObject.set(ticketStatusObj.statusKey, ticketStatusObj);
            }
            ticketStatusKeyToObjectIsLoaded = true;
        }
        return ticketStatusKeyToObject.has(statusKey) ? ticketStatusKeyToObject.get(statusKey) : noResult;
    };
}());
pts.initializeTabs = function (tabsListEle, callbackFns) {
    if (!tabsListEle) {
        return;
    }
    var isPanelOrMenuListTabs = tabsListEle.classList.contains("panel-tabs") || tabsListEle.classList.contains("menu-list");
    var listItemEles = tabsListEle.getElementsByTagName(isPanelOrMenuListTabs ? "a" : "li");
    var tabLinkEles = (isPanelOrMenuListTabs ? listItemEles : tabsListEle.getElementsByTagName("a"));
    function tabClickFn(clickEvent) {
        clickEvent.preventDefault();
        var tabLinkEle = clickEvent.currentTarget;
        var tabContentEle = document.getElementById(tabLinkEle.getAttribute("href").substring(1));
        for (var index = 0; index < listItemEles.length; index += 1) {
            listItemEles[index].classList.remove("is-active");
            tabLinkEles[index].setAttribute("aria-selected", "false");
        }
        (isPanelOrMenuListTabs ? tabLinkEle : tabLinkEle.parentElement).classList.add("is-active");
        tabLinkEle.setAttribute("aria-selected", "true");
        var tabContentEles = tabContentEle.parentElement.getElementsByClassName("tab-content");
        for (var index = 0; index < tabContentEles.length; index += 1) {
            tabContentEles[index].classList.remove("is-active");
        }
        tabContentEle.classList.add("is-active");
        if (callbackFns && callbackFns.onshown) {
            callbackFns.onshown(tabContentEle);
        }
    }
    for (var index = 0; index < listItemEles.length; index += 1) {
        (isPanelOrMenuListTabs ?
            listItemEles[index] :
            listItemEles[index].getElementsByTagName("a")[0]).addEventListener("click", tabClickFn);
    }
};
(function () {
    function toggleHiddenFn(clickEvent) {
        clickEvent.preventDefault();
        var href = clickEvent.currentTarget.href;
        var divID = href.substring(href.indexOf("#") + 1);
        document.getElementById(divID).classList.toggle("is-hidden");
    }
    pts.initializeToggleHiddenLinks = function (searchContainerEle) {
        var linkEles = searchContainerEle.getElementsByClassName("is-toggle-hidden-link");
        for (var index = 0; index < linkEles.length; index += 1) {
            linkEles[index].addEventListener("click", toggleHiddenFn);
        }
    };
}());
