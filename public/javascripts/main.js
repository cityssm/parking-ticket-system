"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pts = {};
(() => {
    let defaultConfigProperties = {};
    let defaultConfigPropertiesIsLoaded = false;
    const loadConfigPropertiesFromStorage = () => {
        try {
            const defaultConfigPropertiesString = window.localStorage.getItem("defaultConfigProperties");
            if (defaultConfigPropertiesString) {
                defaultConfigProperties = JSON.parse(defaultConfigPropertiesString);
                defaultConfigPropertiesIsLoaded = true;
                return true;
            }
        }
        catch (e) {
            defaultConfigProperties = {};
            defaultConfigPropertiesIsLoaded = true;
        }
        return false;
    };
    pts.loadDefaultConfigProperties = (callbackFn) => {
        if (defaultConfigPropertiesIsLoaded) {
            callbackFn();
            return;
        }
        if (loadConfigPropertiesFromStorage()) {
            callbackFn();
            return;
        }
        cityssm.postJSON("/dashboard/doGetDefaultConfigProperties", {}, (defaultConfigPropertiesResult) => {
            defaultConfigProperties = defaultConfigPropertiesResult;
            defaultConfigPropertiesIsLoaded = true;
            try {
                window.localStorage.setItem("defaultConfigProperties", JSON.stringify(defaultConfigProperties));
            }
            catch (_e) {
            }
            callbackFn();
        });
    };
    pts.getDefaultConfigProperty = (propertyName, propertyValueCallbackFn) => {
        if (defaultConfigPropertiesIsLoaded) {
            propertyValueCallbackFn(defaultConfigProperties[propertyName]);
            return;
        }
        if (loadConfigPropertiesFromStorage()) {
            propertyValueCallbackFn(defaultConfigProperties[propertyName]);
            return;
        }
        pts.loadDefaultConfigProperties(() => {
            propertyValueCallbackFn(defaultConfigProperties[propertyName]);
        });
    };
    pts.getLicencePlateCountryProperties = (originalLicencePlateCountry) => {
        if (!defaultConfigPropertiesIsLoaded) {
            return {};
        }
        const licencePlateCountryAlias = defaultConfigProperties.licencePlateCountryAliases[originalLicencePlateCountry.toUpperCase()] || originalLicencePlateCountry;
        if (defaultConfigProperties.licencePlateProvinces.hasOwnProperty(licencePlateCountryAlias)) {
            return defaultConfigProperties.licencePlateProvinces[licencePlateCountryAlias];
        }
        return {};
    };
    pts.getLicencePlateLocationProperties = (originalLicencePlateCountry, originalLicencePlateProvince) => {
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
        const licencePlateCountryAlias = defaultConfigProperties.licencePlateCountryAliases[originalLicencePlateCountry.toUpperCase()] || originalLicencePlateCountry;
        let licencePlateProvinceAlias = originalLicencePlateProvince;
        if (defaultConfigProperties.licencePlateProvinceAliases.hasOwnProperty(licencePlateCountryAlias)) {
            const provinceAliases = defaultConfigProperties.licencePlateProvinceAliases[licencePlateCountryAlias];
            licencePlateProvinceAlias =
                provinceAliases[originalLicencePlateProvince.toUpperCase()] ||
                    originalLicencePlateProvince;
        }
        let licencePlateProvince = licencePlateProvinceDefault;
        if (defaultConfigProperties.licencePlateProvinces.hasOwnProperty(licencePlateCountryAlias)) {
            licencePlateProvince =
                defaultConfigProperties.licencePlateProvinces[licencePlateCountryAlias]
                    .provinces[licencePlateProvinceAlias] || licencePlateProvinceDefault;
        }
        return {
            licencePlateCountryAlias,
            licencePlateProvinceAlias,
            licencePlateProvince
        };
    };
    const ticketStatusKeyToObject = new Map();
    let ticketStatusKeyToObjectIsLoaded = false;
    pts.getTicketStatus = (statusKey) => {
        const noResult = {
            statusKey,
            status: statusKey
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
})();
pts.initializeTabs = (tabsListEle, callbackFns) => {
    if (!tabsListEle) {
        return;
    }
    const isPanelOrMenuListTabs = tabsListEle.classList.contains("panel-tabs") ||
        tabsListEle.classList.contains("menu-list");
    const listItemEles = tabsListEle.getElementsByTagName(isPanelOrMenuListTabs ? "a" : "li");
    const tabLinkEles = isPanelOrMenuListTabs
        ? listItemEles
        : tabsListEle.getElementsByTagName("a");
    const tabClickFn = (clickEvent) => {
        clickEvent.preventDefault();
        const tabLinkEle = clickEvent.currentTarget;
        const tabContentEle = document.getElementById(tabLinkEle.getAttribute("href").substring(1));
        for (let index = 0; index < listItemEles.length; index += 1) {
            listItemEles[index].classList.remove("is-active");
            tabLinkEles[index].setAttribute("aria-selected", "false");
        }
        (isPanelOrMenuListTabs
            ? tabLinkEle
            : tabLinkEle.parentElement).classList.add("is-active");
        tabLinkEle.setAttribute("aria-selected", "true");
        const tabContentEles = tabContentEle.parentElement.getElementsByClassName("tab-content");
        for (const tabContentEle of tabContentEles) {
            tabContentEle.classList.remove("is-active");
        }
        tabContentEle.classList.add("is-active");
        if (callbackFns === null || callbackFns === void 0 ? void 0 : callbackFns.onshown) {
            callbackFns.onshown(tabContentEle);
        }
    };
    for (const listItemEle of listItemEles) {
        (isPanelOrMenuListTabs
            ? listItemEle
            : listItemEle.getElementsByTagName("a")[0]).addEventListener("click", tabClickFn);
    }
};
(() => {
    const toggleHiddenFn = (clickEvent) => {
        clickEvent.preventDefault();
        const href = clickEvent.currentTarget.href;
        const divID = href.substring(href.indexOf("#") + 1);
        document.getElementById(divID).classList.toggle("is-hidden");
    };
    pts.initializeToggleHiddenLinks = (searchContainerEle) => {
        const linkEles = searchContainerEle.getElementsByClassName("is-toggle-hidden-link");
        for (const linkEle of linkEles) {
            linkEle.addEventListener("click", toggleHiddenFn);
        }
    };
})();
