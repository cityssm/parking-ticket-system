"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pts = {
    urlPrefix: document.querySelector('main')?.dataset.urlPrefix
};
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
        catch {
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
        cityssm.postJSON(pts.urlPrefix + '/dashboard/doGetDefaultConfigProperties', {}, (rawResponseJSON) => {
            const defaultConfigPropertiesResult = rawResponseJSON;
            defaultConfigProperties = defaultConfigPropertiesResult;
            defaultConfigPropertiesIsLoaded = true;
            try {
                window.localStorage.setItem('defaultConfigProperties', JSON.stringify(defaultConfigProperties));
            }
            catch {
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
        if (!defaultConfigPropertiesIsLoaded) {
            return {};
        }
        const licencePlateCountryAlias = defaultConfigProperties.licencePlateCountryAliases[originalLicencePlateCountry.toUpperCase()] ?? originalLicencePlateCountry;
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
            for (const ticketStatusObject of defaultConfigProperties.parkingTicketStatuses ??
                []) {
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
        const noResult = {
            locationClassKey,
            locationClass: locationClassKey
        };
        if (!defaultConfigPropertiesIsLoaded) {
            return noResult;
        }
        if (!locationClassKeyToObjectIsLoaded) {
            for (const locationClassObject of defaultConfigProperties.locationClasses ??
                []) {
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
        clickEvent.preventDefault();
        const selectedTabLinkElement = clickEvent.currentTarget;
        const selectedTabContentElement = document.querySelector(selectedTabLinkElement.getAttribute('href') ?? '');
        for (const [index, listItemElement] of listItemElements.entries()) {
            listItemElement.classList.remove('is-active');
            tabLinkElements[index].setAttribute('aria-selected', 'false');
        }
        ;
        (isPanelOrMenuListTabs
            ? selectedTabLinkElement
            : selectedTabLinkElement.parentElement)?.classList.add('is-active');
        selectedTabLinkElement.setAttribute('aria-selected', 'true');
        const tabContentElements = selectedTabContentElement.parentElement?.querySelectorAll('.tab-content');
        for (const tabContentElement_ of tabContentElements ?? []) {
            tabContentElement_.classList.remove('is-active');
        }
        selectedTabContentElement.classList.add('is-active');
        if (callbackFunctions?.onshown) {
            callbackFunctions.onshown(selectedTabContentElement);
        }
    }
    for (const listItemElement of listItemElements) {
        ;
        (isPanelOrMenuListTabs
            ? listItemElement
            : listItemElement.querySelector('a'))?.addEventListener('click', tabClickFunction);
    }
};
(() => {
    function toggleHiddenFunction(clickEvent) {
        clickEvent.preventDefault();
        const href = clickEvent.currentTarget.href;
        const divId = href.slice(Math.max(0, href.indexOf('#') + 1));
        document.querySelector(`#${divId}`)?.classList.toggle('is-hidden');
    }
    pts.initializeToggleHiddenLinks = (searchContainerElement) => {
        const linkElements = searchContainerElement.querySelectorAll('.is-toggle-hidden-link');
        for (const linkElement of linkElements) {
            linkElement.addEventListener('click', toggleHiddenFunction);
        }
    };
})();
