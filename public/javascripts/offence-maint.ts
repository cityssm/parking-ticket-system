/* eslint-disable unicorn/filename-case, unicorn/prefer-module, eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-extra-semi */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { ptsGlobal } from '../../types/publicTypes.js'
import type {
  ParkingBylaw,
  ParkingLocation,
  ParkingOffence
} from '../../types/recordTypes.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const pts: ptsGlobal

type UpdateOffenceResponseJSON =
  | {
      success: true
      offences: ParkingOffence[]
      message?: string
    }
  | {
      success: false
      message?: string
    }

// eslint-disable-next-line sonarjs/cognitive-complexity
;(() => {
  const offenceMap = new Map<string, ParkingOffence>()

  const offenceAccountNumberPatternString = exports.accountNumberPattern
  delete exports.accountNumberPattern

  const locationMap = new Map<string, ParkingLocation>()
  const limitResultsCheckboxElement = document.querySelector(
    '#offenceFilter--limitResults'
  ) as HTMLInputElement
  const resultsElement = document.querySelector(
    '#offenceResults'
  ) as HTMLElement

  const locationInputElement = document.querySelector(
    '#offenceFilter--location'
  ) as HTMLInputElement
  const locationTextElement = document.querySelector(
    '#offenceFilter--locationText'
  ) as HTMLElement

  let locationKeyFilterIsSet = false
  let locationKeyFilter = ''

  const bylawMap = new Map<string, ParkingBylaw>()

  const bylawInputElement = document.querySelector(
    '#offenceFilter--bylaw'
  ) as HTMLInputElement
  const bylawTextElement = document.querySelector(
    '#offenceFilter--bylawText'
  ) as HTMLElement

  let bylawNumberFilterIsSet = false
  let bylawNumberFilter = ''

  function getOffenceMapKey(bylawNumber: string, locationKey: string): string {
    return `${bylawNumber}::::${locationKey}`
  }

  function loadOffenceMap(offenceList: ParkingOffence[]): void {
    offenceMap.clear()

    for (const offence of offenceList) {
      const offenceMapKey = getOffenceMapKey(
        offence.bylawNumber,
        offence.locationKey
      )
      offenceMap.set(offenceMapKey, offence)
    }
  }

  function openEditOffenceModal(clickEvent: Event): void {
    clickEvent.preventDefault()

    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const offenceMapKey = getOffenceMapKey(
      buttonElement.dataset.bylawNumber ?? '',
      buttonElement.dataset.locationKey ?? ''
    )

    const offence = offenceMap.get(offenceMapKey) as ParkingOffence
    const location = locationMap.get(offence.locationKey) as ParkingLocation
    const bylaw = bylawMap.get(offence.bylawNumber) as ParkingBylaw

    let editOffenceModalCloseFunction: () => void

    function doDelete(): void {
      cityssm.postJSON(
        pts.urlPrefix + '/admin/doDeleteOffence',
        {
          bylawNumber: offence.bylawNumber,
          locationKey: offence.locationKey
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as UpdateOffenceResponseJSON

          if (responseJSON.success) {
            loadOffenceMap(responseJSON.offences)
            editOffenceModalCloseFunction()
            renderOffences()
          }
        }
      )
    }

    function confirmDelete(deleteClickEvent: Event): void {
      deleteClickEvent.preventDefault()

      bulmaJS.confirm({
        title: 'Remove Offence',
        message: 'Are you sure you want to remove this offence?',
        contextualColorName: 'warning',
        okButton: {
          text: 'Yes, Remove Offence',
          callbackFunction: doDelete
        }
      })
    }

    function doSubmit(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        pts.urlPrefix + '/admin/doUpdateOffence',
        formEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as UpdateOffenceResponseJSON
          if (responseJSON.success) {
            loadOffenceMap(responseJSON.offences)
            editOffenceModalCloseFunction()
            renderOffences()
          }
        }
      )
    }

    cityssm.openHtmlModal('offence-edit', {
      onshow() {
        ;(
          document.querySelector(
            '#offenceEdit--locationKey'
          ) as HTMLInputElement
        ).value = offence.locationKey
        ;(
          document.querySelector(
            '#offenceEdit--bylawNumber'
          ) as HTMLInputElement
        ).value = offence.bylawNumber
        ;(
          document.querySelector(
            '#offenceEdit--locationName'
          ) as HTMLSpanElement
        ).textContent = location.locationName
        ;(
          document.querySelector(
            '#offenceEdit--locationClass'
          ) as HTMLSpanElement
        ).textContent = pts.getLocationClass(
          location.locationClassKey
        ).locationClass

        document.querySelector('#offenceEdit--bylawNumberSpan').textContent =
          bylaw?.bylawNumber ?? ''

        document.querySelector('#offenceEdit--bylawDescription').textContent =
          bylaw?.bylawDescription ?? ''
        ;(
          document.querySelector(
            '#offenceEdit--parkingOffence'
          ) as HTMLInputElement
        ).value = offence.parkingOffence
        ;(
          document.querySelector(
            '#offenceEdit--offenceAmount'
          ) as HTMLInputElement
        ).value = offence.offenceAmount.toFixed(2)
        ;(
          document.querySelector(
            '#offenceEdit--discountOffenceAmount'
          ) as HTMLInputElement
        ).value = offence.discountOffenceAmount.toFixed(2)
        ;(
          document.querySelector(
            '#offenceEdit--discountDays'
          ) as HTMLInputElement
        ).value = offence.discountDays.toString()

        const accountNumberElement = document.querySelector(
          '#offenceEdit--accountNumber'
        ) as HTMLInputElement
        accountNumberElement.value = offence.accountNumber
        accountNumberElement.setAttribute(
          'pattern',
          offenceAccountNumberPatternString
        )
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()

        editOffenceModalCloseFunction = closeModalFunction

        document
          .querySelector('#form--offenceEdit')
          ?.addEventListener('submit', doSubmit)

        modalElement
          .querySelector('.is-delete-button')
          ?.addEventListener('click', confirmDelete)
      },
      onhidden() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function addOffence(
    bylawNumber: string,
    locationKey: string,
    returnAndRenderOffences: boolean,
    callbackFunction?: (responseJSON: UpdateOffenceResponseJSON) => void
  ): void {
    cityssm.postJSON(
      pts.urlPrefix + '/admin/doAddOffence',
      {
        bylawNumber,
        locationKey,
        returnOffences: returnAndRenderOffences
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as UpdateOffenceResponseJSON

        if (responseJSON.success && returnAndRenderOffences) {
          loadOffenceMap(responseJSON.offences)
          renderOffences()
        }

        if (callbackFunction !== undefined) {
          callbackFunction(responseJSON)
        }
      }
    )
  }

  function openAddOffenceFromListModal(): void {
    let doRefreshOnClose = false

    function addFunction(clickEvent: Event): void {
      clickEvent.preventDefault()

      const linkElement = clickEvent.currentTarget as HTMLAnchorElement

      const bylawNumber = linkElement.dataset.bylawNumber ?? ''
      const locationKey = linkElement.dataset.locationKey ?? ''

      addOffence(bylawNumber, locationKey, false, (responseJSON) => {
        if (responseJSON.success) {
          linkElement.remove()
          doRefreshOnClose = true
        }
      })
    }

    cityssm.openHtmlModal('offence-addFromList', {
      onshow(modalElement) {
        let titleHTML = ''
        let selectedHTML = ''

        if (locationKeyFilterIsSet) {
          titleHTML = 'Select By-Laws'

          const location = locationMap.get(locationKeyFilter) as ParkingLocation
          const locationClass = pts.getLocationClass(location.locationClassKey)

          selectedHTML = `${cityssm.escapeHTML(location.locationName)}<br />
            <span class="is-size-7">
            ${cityssm.escapeHTML(locationClass.locationClass)}
            </span>`
        } else {
          titleHTML = 'Select Locations'

          const bylaw = bylawMap.get(bylawNumberFilter)

          selectedHTML = `${cityssm.escapeHTML(bylaw.bylawNumber)}<br />
            <span class="is-size-7">
            ${bylaw.bylawDescription}
            </span>`
        }

        modalElement.querySelector('.modal-card-title').innerHTML = titleHTML

        document.querySelector('#addContainer--selected').innerHTML =
          selectedHTML
      },
      onshown() {
        const listElement = document.createElement('div')
        listElement.className = 'panel'

        let displayCount = 0

        if (locationKeyFilterIsSet) {
          for (const bylaw of bylawMap.values()) {
            const offenceMapKey = getOffenceMapKey(
              bylaw.bylawNumber,
              locationKeyFilter
            )

            if (offenceMap.has(offenceMapKey)) {
              continue
            }

            displayCount += 1

            const linkElement = document.createElement('a')
            linkElement.className = 'panel-block is-block'
            linkElement.dataset.bylawNumber = bylaw.bylawNumber
            linkElement.dataset.locationKey = locationKeyFilter

            linkElement.innerHTML = `${cityssm.escapeHTML(
              bylaw.bylawNumber
            )}<br />
              <span class="is-size-7">
              ${cityssm.escapeHTML(bylaw.bylawDescription)}
              </span>`

            linkElement.addEventListener('click', addFunction)

            listElement.append(linkElement)
          }
        } else {
          for (const location of locationMap.values()) {
            const offenceMapKey = getOffenceMapKey(
              bylawNumberFilter,
              location.locationKey
            )

            if (offenceMap.has(offenceMapKey)) {
              continue
            }

            displayCount += 1

            const linkElement = document.createElement('a')
            linkElement.className = 'panel-block is-block'
            linkElement.dataset.bylawNumber = bylawNumberFilter
            linkElement.dataset.locationKey = location.locationKey

            linkElement.innerHTML = `${cityssm.escapeHTML(
              location.locationName
            )}<br />
              <span class="is-size-7">
              ${cityssm.escapeHTML(
                pts.getLocationClass(location.locationClassKey).locationClass
              )}
              </span>`

            linkElement.addEventListener('click', addFunction)

            listElement.append(linkElement)
          }
        }

        const addResultsElement = document.querySelector(
          '#addContainer--results'
        ) as HTMLElement
        cityssm.clearElement(addResultsElement)

        if (displayCount === 0) {
          addResultsElement.innerHTML = `<div class="message is-info">
            <div class="message-body">There are no offence records available for creation.</div>
            </div>`
        } else {
          addResultsElement.append(listElement)
        }
      },
      onremoved() {
        if (doRefreshOnClose) {
          cityssm.postJSON(
            pts.urlPrefix + '/offences/doGetAllOffences',
            {},
            (rawResponseJSON) => {
              const offenceList = rawResponseJSON as unknown as ParkingOffence[]
              loadOffenceMap(offenceList)
              renderOffences()
            }
          )
        }
      }
    })
  }

  function renderOffences(): void {
    const tbodyElement = document.createElement('tbody')

    let matchCount = 0

    const displayLimit = limitResultsCheckboxElement.checked
      ? Number.parseInt(limitResultsCheckboxElement.value, 10)
      : offenceMap.size

    for (const offence of offenceMap.values()) {
      if (matchCount >= displayLimit) {
        continue
      }

      // Ensure offence matches filters
      if (
        (locationKeyFilterIsSet && locationKeyFilter !== offence.locationKey) ||
        (bylawNumberFilterIsSet && bylawNumberFilter !== offence.bylawNumber)
      ) {
        continue
      }

      // Ensure location record exists
      const location = locationMap.get(offence.locationKey)

      if (!location) {
        continue
      }

      // Ensure by-law record exists
      const bylaw = bylawMap.get(offence.bylawNumber)

      if (!bylaw) {
        continue
      }

      matchCount += 1

      if (matchCount > displayLimit) {
        continue
      }

      const trElement = document.createElement('tr')

      trElement.innerHTML = `<td class="has-border-right-width-2">
          ${cityssm.escapeHTML(location.locationName)}<br />
          <span class="is-size-7">
            ${cityssm.escapeHTML(
              pts.getLocationClass(location.locationClassKey).locationClass
            )}
          </span>
        </td>
        <td class="has-border-right-width-2">
          <strong>${cityssm.escapeHTML(bylaw.bylawNumber)}</strong><br />
          <span class="is-size-7">
            ${cityssm.escapeHTML(bylaw.bylawDescription)}
          </span>
        </td>
        <td class="has-text-right has-tooltip-bottom" data-tooltip="Set Rate">
          $${offence.offenceAmount.toFixed(2)}<br />
          <span class="is-size-7">
            ${offence.accountNumber}
          </span>
        </td>
      <td class="has-text-right has-tooltip-bottom" data-tooltip="Discount Rate">
        $${offence.discountOffenceAmount.toFixed(2)}<br />
        <span class="is-size-7">
        ${offence.discountDays.toString()} day${
        offence.discountDays === 1 ? '' : 's'
      }
        </span>
      </td>
      <td class="has-border-right-width-2">
        <div class="is-size-7">
          ${cityssm.escapeHTML(offence.parkingOffence)}
        </div>
      </td>
      <td class="has-text-right">
        <button class="button is-small"
          data-bylaw-number="${offence.bylawNumber}"
          data-location-key="${offence.locationKey}" type="button">
          <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
          <span>Edit</span>
        </button>
      </td>`

      trElement
        .querySelector('button')
        ?.addEventListener('click', openEditOffenceModal)

      tbodyElement.append(trElement)
    }

    cityssm.clearElement(resultsElement)

    if (matchCount === 0) {
      resultsElement.innerHTML = `<div class="message is-info">
        <div class="message-body">
        <p>There are no offences that match the given criteria.</p>
        </div>
        </div>`

      return
    }

    resultsElement.innerHTML = `<table class="table is-striped is-hoverable is-fullwidth">
      <thead><tr>
        <th class="has-border-right-width-2">Location</th>
        <th class="has-border-right-width-2">By-Law</th>
        <th class="has-border-right-width-2" colspan="3">Offence</th>
        <th class="has-width-50"></th>
      </tr></thead>
      </table>`

    resultsElement.querySelector('table')?.append(tbodyElement)

    if (matchCount > displayLimit) {
      resultsElement.insertAdjacentHTML(
        'afterbegin',
        `<div class="message is-warning">
          <div class="message-body has-text-centered">Limit Reached</div>
          </div>`
      )
    }
  }

  document
    .querySelector('#is-add-offence-button')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      if (locationKeyFilterIsSet && bylawNumberFilterIsSet) {
        const bylaw = bylawMap.get(bylawNumberFilter) as ParkingBylaw
        const location = locationMap.get(locationKeyFilter) as ParkingLocation

        bulmaJS.confirm({
          title: 'Create Offence?',
          message: `<p class="has-text-centered">Are you sure you want to create the offence record below?</p>
            <div class="columns my-4">
            <div class="column has-text-centered">
              ${cityssm.escapeHTML(location.locationName)}<br />
              <span class="is-size-7">
              ${cityssm.escapeHTML(
                pts.getLocationClass(location.locationClassKey).locationClass
              )}
              </span>
            </div>
            <div class="column has-text-centered">
              ${cityssm.escapeHTML(bylaw.bylawNumber)}<br />
              <span class="is-size-7">
                ${cityssm.escapeHTML(bylaw.bylawDescription)}
              </span>
            </div>
            </div>`,
          messageIsHtml: true,
          contextualColorName: 'info',
          okButton: {
            text: 'Yes, Create Offence',
            callbackFunction: () => {
              addOffence(
                bylawNumberFilter,
                locationKeyFilter,
                true,
                (responseJSON) => {
                  if (!responseJSON.success) {
                    bulmaJS.alert({
                      title: 'Offence Not Added',
                      message: responseJSON.message ?? '',
                      contextualColorName: 'danger'
                    })
                  } else if ((responseJSON.message ?? '') !== '') {
                    bulmaJS.alert({
                      title: 'Offence Added Successfully',
                      message: responseJSON.message ?? '',
                      contextualColorName: 'warning'
                    })
                  }
                }
              )
            }
          }
        })
      } else if (locationKeyFilterIsSet || bylawNumberFilterIsSet) {
        openAddOffenceFromListModal()
      } else {
        bulmaJS.alert({
          title: 'How to Create a New Offence',
          message:
            'To add an offence, use the main filters to select either a location, a by-law, or both.',
          contextualColorName: 'warning'
        })
      }
    })

  // Location filter setup

  function clearLocationFilter(): void {
    locationInputElement.value = ''
    cityssm.clearElement(locationTextElement)

    locationKeyFilter = ''
    locationKeyFilterIsSet = false
  }

  function openSelectLocationFilterModal(): void {
    let selectLocationCloseModalFunction: () => void

    function doSelect(clickEvent: Event): void {
      clickEvent.preventDefault()

      const location = locationMap.get(
        (clickEvent.currentTarget as HTMLAnchorElement).dataset.locationKey ??
          ''
      ) as ParkingLocation

      locationKeyFilterIsSet = true
      locationKeyFilter = location.locationKey

      locationInputElement.value = location.locationName

      selectLocationCloseModalFunction()

      renderOffences()
    }

    cityssm.openHtmlModal('location-select', {
      onshow() {
        const listElement = document.createElement('div')
        listElement.className = 'panel mb-4'

        for (const location of locationMap.values()) {
          const linkElement = document.createElement('a')

          linkElement.className = 'panel-block is-block'
          linkElement.dataset.locationKey = location.locationKey
          linkElement.setAttribute('href', '#')

          linkElement.innerHTML = `<div class="level">
            <div class="level-left">
              ${cityssm.escapeHTML(location.locationName)}
            </div>
            <div class="level-right">
              ${cityssm.escapeHTML(
                pts.getLocationClass(location.locationClassKey).locationClass
              )}
            </div>
            </div>`

          linkElement.addEventListener('click', doSelect)

          listElement.append(linkElement)
        }

        const listContainerElement = document.querySelector(
          '#container--parkingLocations'
        ) as HTMLElement
        cityssm.clearElement(listContainerElement)
        listContainerElement.append(listElement)
      },
      onshown(_modalElement, closeModalFunction) {
        selectLocationCloseModalFunction = closeModalFunction
      }
    })
  }

  locationInputElement.addEventListener(
    'dblclick',
    openSelectLocationFilterModal
  )

  document
    .querySelector('#is-select-location-filter-button')
    ?.addEventListener('click', openSelectLocationFilterModal)

  document
    .querySelector('#is-clear-location-filter-button')
    ?.addEventListener('click', () => {
      clearLocationFilter()
      renderOffences()
    })

  if (!locationKeyFilterIsSet) {
    clearLocationFilter()
  }

  // By-law filter setup

  function clearBylawFilter(): void {
    bylawInputElement.value = ''
    cityssm.clearElement(bylawTextElement)

    bylawNumberFilter = ''
    bylawNumberFilterIsSet = false
  }

  function openSelectBylawFilterModal(): void {
    let selectBylawCloseModalFunction: () => void

    function doSelect(clickEvent: Event): void {
      clickEvent.preventDefault()

      const bylaw = bylawMap.get(
        (clickEvent.currentTarget as HTMLAnchorElement).dataset.bylawNumber ??
          ''
      ) as ParkingBylaw

      bylawNumberFilterIsSet = true
      bylawNumberFilter = bylaw.bylawNumber

      bylawInputElement.value = bylaw.bylawNumber
      bylawTextElement.textContent = bylaw.bylawDescription

      selectBylawCloseModalFunction()

      renderOffences()
    }

    cityssm.openHtmlModal('bylaw-select', {
      onshow() {
        const listElement = document.createElement('div')
        listElement.className = 'panel mb-4'

        for (const bylaw of bylawMap.values()) {
          const linkElement = document.createElement('a')

          linkElement.className = 'panel-block is-block'
          linkElement.dataset.bylawNumber = bylaw.bylawNumber
          linkElement.setAttribute('href', '#')

          linkElement.innerHTML = `${cityssm.escapeHTML(
            bylaw.bylawNumber
          )}<br />
            <span class="is-size-7">
            ${cityssm.escapeHTML(bylaw.bylawDescription)}
            </span>`

          linkElement.addEventListener('click', doSelect)

          listElement.append(linkElement)
        }

        const listContainerElement = document.querySelector(
          '#container--parkingBylaws'
        ) as HTMLElement
        cityssm.clearElement(listContainerElement)
        listContainerElement.append(listElement)
      },
      onshown(_modalElement, closeModalFunction) {
        selectBylawCloseModalFunction = closeModalFunction
      }
    })
  }

  bylawInputElement.addEventListener('dblclick', openSelectBylawFilterModal)

  document
    .querySelector('#is-select-bylaw-filter-button')
    ?.addEventListener('click', openSelectBylawFilterModal)

  document
    .querySelector('#is-clear-bylaw-filter-button')
    ?.addEventListener('click', () => {
      clearBylawFilter()
      renderOffences()
    })

  if (!bylawNumberFilterIsSet) {
    clearBylawFilter()
  }

  // Limit checkbox setup

  limitResultsCheckboxElement.addEventListener('change', renderOffences)

  // Load locationMap

  for (const location of exports.locations) {
    locationMap.set(location.locationKey, location)
  }

  delete exports.locations

  // Load bylawMap

  for (const bylaw of exports.bylaws) {
    bylawMap.set(bylaw.bylawNumber, bylaw)
  }

  delete exports.bylaws

  // Load offenceList

  loadOffenceMap(exports.offences)
  delete exports.offences

  // Load locationClasses

  pts.getDefaultConfigProperty('locationClasses', renderOffences)
})()
