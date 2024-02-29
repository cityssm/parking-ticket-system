/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-extra-semi */

import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { ConfigLicencePlateCountry, ConfigLocationClass, ConfigParkingTicketStatus } from '../../types/configTypes.js'
import type { ptsGlobal } from '../../types/publicTypes.js'

declare const cityssm: cityssmGlobal
const pts: Partial<ptsGlobal> = {}

// CONFIG DEFAULTS

interface DefaultConfigProperties {
  locationClasses?: ConfigLocationClass[]
  ticketNumber_fieldLabel?: string
  parkingTicketStatuses?: ConfigParkingTicketStatus[]
  licencePlateCountryAliases?: Record<string, string>
  licencePlateProvinceAliases?: Record<string, Record<string, string>>
  licencePlateProvinces?: Record<string, ConfigLicencePlateCountry>
}

;(() => {
  let defaultConfigProperties: DefaultConfigProperties = {}
  let defaultConfigPropertiesIsLoaded = false

  function loadConfigPropertiesFromStorage(): boolean {
    try {
      const defaultConfigPropertiesString = window.localStorage.getItem(
        'defaultConfigProperties'
      )

      if (defaultConfigPropertiesString !== null) {
        defaultConfigProperties = JSON.parse(defaultConfigPropertiesString)
        defaultConfigPropertiesIsLoaded = true

        return true
      }
    } catch {
      defaultConfigProperties = {}
      defaultConfigPropertiesIsLoaded = true
    }

    return false
  }

  pts.loadDefaultConfigProperties = (callbackFunction: () => void) => {
    if (defaultConfigPropertiesIsLoaded) {
      callbackFunction()
      return
    }

    if (loadConfigPropertiesFromStorage()) {
      callbackFunction()
      return
    }

    cityssm.postJSON(
      '/dashboard/doGetDefaultConfigProperties',
      {},
      (rawResponseJSON) => {
        const defaultConfigPropertiesResult =
          rawResponseJSON as DefaultConfigProperties
        defaultConfigProperties = defaultConfigPropertiesResult
        defaultConfigPropertiesIsLoaded = true

        try {
          window.localStorage.setItem(
            'defaultConfigProperties',
            JSON.stringify(defaultConfigProperties)
          )
        } catch {
          // Ignore
        }

        callbackFunction()
      }
    )
  }

  pts.getDefaultConfigProperty = (
    propertyName,
    propertyValueCallbackFunction: (propertyValue: unknown) => void
  ) => {
    // Check memory

    if (defaultConfigPropertiesIsLoaded) {
      propertyValueCallbackFunction(defaultConfigProperties[propertyName])
      return
    }

    // Check local storage

    if (loadConfigPropertiesFromStorage()) {
      propertyValueCallbackFunction(defaultConfigProperties[propertyName])
      return
    }

    // Populate local storage

    pts.loadDefaultConfigProperties(() => {
      propertyValueCallbackFunction(defaultConfigProperties[propertyName])
    })
  }

  pts.getLicencePlateCountryProperties = (originalLicencePlateCountry) => {
    if (!defaultConfigPropertiesIsLoaded) {
      return {}
    }

    const licencePlateCountryAlias =
      defaultConfigProperties.licencePlateCountryAliases[
        originalLicencePlateCountry.toUpperCase()
      ] ?? originalLicencePlateCountry

    if (
      Object.prototype.hasOwnProperty.call(
        defaultConfigProperties.licencePlateProvinces,
        licencePlateCountryAlias
      )
    ) {
      return defaultConfigProperties.licencePlateProvinces[
        licencePlateCountryAlias
      ]
    }

    return {}
  }

  pts.getLicencePlateLocationProperties = (
    originalLicencePlateCountry,
    originalLicencePlateProvince
  ) => {
    const licencePlateProvinceDefault = {
      provinceShortName: originalLicencePlateProvince,
      color: '#000',
      backgroundColor: '#fff'
    }

    if (!defaultConfigPropertiesIsLoaded) {
      return {
        licencePlateCountryAlias: originalLicencePlateCountry,
        licencePlateProvinceAlias: originalLicencePlateProvince,
        licencePlateProvince: licencePlateProvinceDefault
      }
    }

    // Get the country alias

    const licencePlateCountryAlias =
      defaultConfigProperties.licencePlateCountryAliases[
        originalLicencePlateCountry.toUpperCase()
      ] || originalLicencePlateCountry

    // Get the province alias

    let licencePlateProvinceAlias = originalLicencePlateProvince

    if (
      Object.prototype.hasOwnProperty.call(
        defaultConfigProperties.licencePlateProvinceAliases,
        licencePlateCountryAlias
      )
    ) {
      const provinceAliases =
        defaultConfigProperties.licencePlateProvinceAliases[
          licencePlateCountryAlias
        ]

      licencePlateProvinceAlias =
        provinceAliases[originalLicencePlateProvince.toUpperCase()] ||
        originalLicencePlateProvince
    }

    // Get the province object

    let licencePlateProvince = licencePlateProvinceDefault

    if (
      Object.prototype.hasOwnProperty.call(
        defaultConfigProperties.licencePlateProvinces,
        licencePlateCountryAlias
      )
    ) {
      licencePlateProvince =
        defaultConfigProperties.licencePlateProvinces[licencePlateCountryAlias]
          .provinces[licencePlateProvinceAlias] || licencePlateProvinceDefault
    }

    // Return

    return {
      licencePlateCountryAlias,
      licencePlateProvinceAlias,
      licencePlateProvince
    }
  }

  const ticketStatusKeyToObject = new Map<
    string,
    ConfigParkingTicketStatus
  >()
  let ticketStatusKeyToObjectIsLoaded = false

  pts.getTicketStatus = (statusKey) => {
    const noResult = {
      statusKey,
      status: statusKey,
      isUserSettable: false,
      isFinalStatus: false
    }

    if (!defaultConfigPropertiesIsLoaded) {
      return noResult
    }

    if (!ticketStatusKeyToObjectIsLoaded) {
      for (const ticketStatusObject of defaultConfigProperties.parkingTicketStatuses ??
        []) {
        ticketStatusKeyToObject.set(
          ticketStatusObject.statusKey,
          ticketStatusObject
        )
      }

      ticketStatusKeyToObjectIsLoaded = true
    }

    return ticketStatusKeyToObject.has(statusKey)
      ? ticketStatusKeyToObject.get(statusKey)
      : noResult
  }

  const locationClassKeyToObject = new Map<
    string,
    ConfigLocationClass
  >()
  let locationClassKeyToObjectIsLoaded = false

  pts.getLocationClass = (locationClassKey) => {
    const noResult: ConfigLocationClass = {
      locationClassKey,
      locationClass: locationClassKey
    }

    if (!defaultConfigPropertiesIsLoaded) {
      return noResult
    }

    if (!locationClassKeyToObjectIsLoaded) {
      for (const locationClassObject of defaultConfigProperties.locationClasses ??
        []) {
        locationClassKeyToObject.set(
          locationClassObject.locationClassKey,
          locationClassObject
        )
      }

      locationClassKeyToObjectIsLoaded = true
    }

    return locationClassKeyToObject.has(locationClassKey)
      ? locationClassKeyToObject.get(locationClassKey)
      : noResult
  }
})()

// TABS

pts.initializeTabs = (tabsListElement, callbackFunctions) => {
  if (!tabsListElement) {
    return
  }

  const isPanelOrMenuListTabs =
    tabsListElement.classList.contains('panel-tabs') ||
    tabsListElement.classList.contains('menu-list')

  const listItemElements = tabsListElement.querySelectorAll(
    isPanelOrMenuListTabs ? 'a' : 'li'
  )

  const tabLinkElements = isPanelOrMenuListTabs
    ? listItemElements
    : tabsListElement.querySelectorAll('a')

  function tabClickFunction(clickEvent: Event): void {
    clickEvent.preventDefault()

    const selectedTabLinkElement = clickEvent.currentTarget as HTMLAnchorElement
    const selectedTabContentElement = document.querySelector(
      selectedTabLinkElement.getAttribute('href') ?? ''
    ) as HTMLElement

    for (const [index, listItemElement] of listItemElements.entries()) {
      listItemElement.classList.remove('is-active')
      tabLinkElements[index].setAttribute('aria-selected', 'false')
    }

    // Add .is-active to the selected tab
    ;(isPanelOrMenuListTabs
      ? selectedTabLinkElement
      : selectedTabLinkElement.parentElement
    )?.classList.add('is-active')
    selectedTabLinkElement.setAttribute('aria-selected', 'true')

    const tabContentElements =
      selectedTabContentElement.parentElement?.querySelectorAll('.tab-content')

    for (const tabContentElement_ of tabContentElements ?? []) {
      tabContentElement_.classList.remove('is-active')
    }

    selectedTabContentElement.classList.add('is-active')

    if (callbackFunctions?.onshown) {
      callbackFunctions.onshown(selectedTabContentElement)
    }
  }

  for (const listItemElement of listItemElements) {
    ;(isPanelOrMenuListTabs
      ? listItemElement
      : listItemElement.querySelector('a')
    )?.addEventListener('click', tabClickFunction)
  }
}

// TOGGLE CONTAINERS
;(() => {
  function toggleHiddenFunction(clickEvent: Event): void {
    clickEvent.preventDefault()

    const href = (clickEvent.currentTarget as HTMLAnchorElement).href
    const divId = href.slice(Math.max(0, href.indexOf('#') + 1))

    document.querySelector(`#${divId}`)?.classList.toggle('is-hidden')
  }

  pts.initializeToggleHiddenLinks = (searchContainerElement) => {
    const linkElements = searchContainerElement.querySelectorAll(
      '.is-toggle-hidden-link'
    )

    for (const linkElement of linkElements) {
      linkElement.addEventListener('click', toggleHiddenFunction)
    }
  }
})()
