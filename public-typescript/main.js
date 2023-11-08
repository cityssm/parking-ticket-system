"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pts = {};
;
(() => {
    let defaultConfigProperties = {};
    let defaultConfigPropertiesIsLoaded = false;
    function loadConfigPropertiesFromStorage() {
        try {
            const defaultConfigPropertiesString = window.localStorage.getItem('defaultConfigProperties');
            if (defaultConfigPropertiesString !== null) {
                defaultConfigProperties = JSON.parse(defaultConfigPropertiesString);
                defaultConfigPropertiesIsLoaded = true;
                return true;
            }
        }
        catch (_a) {
            defaultConfigProperties = {};
            defaultConfigPropertiesIsLoaded = true;
        }
        return false;
    }
    pts.loadDefaultConfigProperties = (callbackFunction) => {
        if (defaultConfigPropertiesIsLoaded) {
            callbackFunction();
            return;
        }
        if (loadConfigPropertiesFromStorage()) {
            callbackFunction();
            return;
        }
        cityssm.postJSON('/dashboard/doGetDefaultConfigProperties', {}, (rawResponseJSON) => {
            const defaultConfigPropertiesResult = rawResponseJSON;
            defaultConfigProperties = defaultConfigPropertiesResult;
            defaultConfigPropertiesIsLoaded = true;
            try {
                window.localStorage.setItem('defaultConfigProperties', JSON.stringify(defaultConfigProperties));
            }
            catch (_a) {
            }
            callbackFunction();
        });
    };
    pts.getDefaultConfigProperty = (propertyName, propertyValueCallbackFunction) => {
        if (defaultConfigPropertiesIsLoaded) {
            propertyValueCallbackFunction(defaultConfigProperties[propertyName]);
            return;
        }
        if (loadConfigPropertiesFromStorage()) {
            propertyValueCallbackFunction(defaultConfigProperties[propertyName]);
            return;
        }
        pts.loadDefaultConfigProperties(() => {
            propertyValueCallbackFunction(defaultConfigProperties[propertyName]);
        });
    };
    pts.getLicencePlateCountryProperties = (originalLicencePlateCountry) => {
        var _a;
        if (!defaultConfigPropertiesIsLoaded) {
            return {};
        }
        const licencePlateCountryAlias = (_a = defaultConfigProperties.licencePlateCountryAliases[originalLicencePlateCountry.toUpperCase()]) !== null && _a !== void 0 ? _a : originalLicencePlateCountry;
        if (Object.prototype.hasOwnProperty.call(defaultConfigProperties.licencePlateProvinces, licencePlateCountryAlias)) {
            return defaultConfigProperties.licencePlateProvinces[licencePlateCountryAlias];
        }
        return {};
    };
    pts.getLicencePlateLocationProperties = (originalLicencePlateCountry, originalLicencePlateProvince) => {
        const licencePlateProvinceDefault = {
            provinceShortName: originalLicencePlateProvince,
            color: '#000',
            backgroundColor: '#fff'
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
        if (Object.prototype.hasOwnProperty.call(defaultConfigProperties.licencePlateProvinceAliases, licencePlateCountryAlias)) {
            const provinceAliases = defaultConfigProperties.licencePlateProvinceAliases[licencePlateCountryAlias];
            licencePlateProvinceAlias =
                provinceAliases[originalLicencePlateProvince.toUpperCase()] ||
                    originalLicencePlateProvince;
        }
        let licencePlateProvince = licencePlateProvinceDefault;
        if (Object.prototype.hasOwnProperty.call(defaultConfigProperties.licencePlateProvinces, licencePlateCountryAlias)) {
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
        var _a;
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
            for (const ticketStatusObject of (_a = defaultConfigProperties.parkingTicketStatuses) !== null && _a !== void 0 ? _a : []) {
                ticketStatusKeyToObject.set(ticketStatusObject.statusKey, ticketStatusObject);
            }
            ticketStatusKeyToObjectIsLoaded = true;
        }
        return ticketStatusKeyToObject.has(statusKey)
            ? ticketStatusKeyToObject.get(statusKey)
            : noResult;
    };
    const locationClassKeyToObject = new Map();
    let locationClassKeyToObjectIsLoaded = false;
    pts.getLocationClass = (locationClassKey) => {
        var _a;
        const noResult = {
            locationClassKey,
            locationClass: locationClassKey
        };
        if (!defaultConfigPropertiesIsLoaded) {
            return noResult;
        }
        if (!locationClassKeyToObjectIsLoaded) {
            for (const locationClassObject of (_a = defaultConfigProperties.locationClasses) !== null && _a !== void 0 ? _a : []) {
                locationClassKeyToObject.set(locationClassObject.locationClassKey, locationClassObject);
            }
            locationClassKeyToObjectIsLoaded = true;
        }
        return locationClassKeyToObject.has(locationClassKey)
            ? locationClassKeyToObject.get(locationClassKey)
            : noResult;
    };
})();
pts.initializeTabs = (tabsListElement, callbackFunctions) => {
    var _a;
    if (!tabsListElement) {
        return;
    }
    const isPanelOrMenuListTabs = tabsListElement.classList.contains('panel-tabs') ||
        tabsListElement.classList.contains('menu-list');
    const listItemElements = tabsListElement.querySelectorAll(isPanelOrMenuListTabs ? 'a' : 'li');
    const tabLinkElements = isPanelOrMenuListTabs
        ? listItemElements
        : tabsListElement.querySelectorAll('a');
    function tabClickFunction(clickEvent) {
        var _a, _b, _c;
        clickEvent.preventDefault();
        const selectedTabLinkElement = clickEvent.currentTarget;
        const selectedTabContentElement = document.querySelector((_a = selectedTabLinkElement.getAttribute('href')) !== null && _a !== void 0 ? _a : '');
        for (const [index, listItemElement] of listItemElements.entries()) {
            listItemElement.classList.remove('is-active');
            tabLinkElements[index].setAttribute('aria-selected', 'false');
        }
        ;
        (_b = (isPanelOrMenuListTabs
            ? selectedTabLinkElement
            : selectedTabLinkElement.parentElement)) === null || _b === void 0 ? void 0 : _b.classList.add('is-active');
        selectedTabLinkElement.setAttribute('aria-selected', 'true');
        const tabContentElements = (_c = selectedTabContentElement.parentElement) === null || _c === void 0 ? void 0 : _c.querySelectorAll('.tab-content');
        for (const tabContentElement_ of tabContentElements !== null && tabContentElements !== void 0 ? tabContentElements : []) {
            tabContentElement_.classList.remove('is-active');
        }
        selectedTabContentElement.classList.add('is-active');
        if (callbackFunctions === null || callbackFunctions === void 0 ? void 0 : callbackFunctions.onshown) {
            callbackFunctions.onshown(selectedTabContentElement);
        }
    }
    for (const listItemElement of listItemElements) {
        ;
        (_a = (isPanelOrMenuListTabs
            ? listItemElement
            : listItemElement.querySelector('a'))) === null || _a === void 0 ? void 0 : _a.addEventListener('click', tabClickFunction);
    }
};
(() => {
    function toggleHiddenFunction(clickEvent) {
        var _a;
        clickEvent.preventDefault();
        const href = clickEvent.currentTarget.href;
        const divId = href.slice(Math.max(0, href.indexOf('#') + 1));
        (_a = document.querySelector(`#${divId}`)) === null || _a === void 0 ? void 0 : _a.classList.toggle('is-hidden');
    }
    pts.initializeToggleHiddenLinks = (searchContainerElement) => {
        const linkElements = searchContainerElement.querySelectorAll('.is-toggle-hidden-link');
        for (const linkElement of linkElements) {
            linkElement.addEventListener('click', toggleHiddenFunction);
        }
    };
})();
