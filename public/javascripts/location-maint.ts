/* eslint-disable unicorn/filename-case, eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-extra-semi */
/* eslint-disable unicorn/prefer-module */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { ConfigLocationClass } from '../../types/configTypes.js'
import type { ptsGlobal } from '../../types/publicTypes.js'
import type { ParkingLocation } from '../../types/recordTypes.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const pts: ptsGlobal

type UpdateLocationResponseJSON =
  | {
      success: true
      locations: ParkingLocation[]
    }
  | {
      success: false
      message?: string
    }
;(() => {
  let locationClassKeyOptionsHTML = ''

  const locationClassKeyFilterElement = document.querySelector(
    '#locationFilter--locationClassKey'
  ) as HTMLSelectElement
  const locationNameFilterElement = document.querySelector(
    '#locationFilter--locationName'
  ) as HTMLInputElement
  const locationResultsElement = document.querySelector(
    '#locationResults'
  ) as HTMLElement

  let locationList = exports.locations as ParkingLocation[]
  delete exports.locations

  function openEditLocationModalFunction(clickEvent: Event): void {
    clickEvent.preventDefault()

    const listIndex = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).dataset.index ?? '-1',
      10
    )
    // eslint-disable-next-line security/detect-object-injection
    const location = locationList[listIndex]

    let editLocationCloseModalFunction: () => void

    function deleteFunction(): void {
      cityssm.postJSON(
        `${pts.urlPrefix}/admin/doDeleteLocation`,
        {
          locationKey: location.locationKey
        },
        (rawResponseJSON) => {
          const responseJSON =
            rawResponseJSON as unknown as UpdateLocationResponseJSON

          if (responseJSON.success) {
            editLocationCloseModalFunction()
            locationList = responseJSON.locations
            renderLocationListFunction()
          }
        }
      )
    }

    function confirmDeleteFunction(deleteClickEvent: Event): void {
      deleteClickEvent.preventDefault()

      cityssm.confirmModal(
        'Delete Location',
        `Are you sure you want to remove "${location.locationName}" from the list of available options?`,
        'Yes, Remove Location',
        'danger',
        deleteFunction
      )
    }

    function editFunction(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${pts.urlPrefix}/admin/doUpdateLocation`,
        formEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as UpdateLocationResponseJSON
          if (responseJSON.success) {
            editLocationCloseModalFunction()
            locationList = responseJSON.locations
            renderLocationListFunction()
          }
        }
      )
    }

    cityssm.openHtmlModal('location-edit', {
      onshow() {
        ;(
          document.querySelector(
            '#editLocation--locationKey'
          ) as HTMLInputElement
        ).value = location.locationKey

        const locationClassKeyEditSelectElement = document.querySelector(
          '#editLocation--locationClassKey'
        ) as HTMLSelectElement

        // eslint-disable-next-line no-unsanitized/property
        locationClassKeyEditSelectElement.innerHTML =
          locationClassKeyOptionsHTML

        if (
          locationClassKeyEditSelectElement.querySelector(
            `[value='${location.locationClassKey}']`
          ) === null
        ) {
          locationClassKeyEditSelectElement.insertAdjacentHTML(
            'beforeend',
            `<option value="${cityssm.escapeHTML(location.locationClassKey)}">
              ${cityssm.escapeHTML(location.locationClassKey)}
              </option>`
          )
        }

        locationClassKeyEditSelectElement.value = location.locationClassKey
        ;(
          document.querySelector(
            '#editLocation--locationName'
          ) as HTMLInputElement
        ).value = location.locationName
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()

        editLocationCloseModalFunction = closeModalFunction

        document
          .querySelector('#form--editLocation')
          ?.addEventListener('submit', editFunction)

        modalElement
          .querySelector('.is-delete-button')
          ?.addEventListener('click', confirmDeleteFunction)
      },
      onhidden() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function renderLocationListFunction(): void {
    let displayCount = 0

    const locationClassKeyFilter = locationClassKeyFilterElement.value
    const locationNameFilterSplit = locationNameFilterElement.value
      .trim()
      .toLowerCase()
      .split(' ')

    const tbodyElement = document.createElement('tbody')

    for (const [locationIndex, location] of locationList.entries()) {
      if (
        locationClassKeyFilter !== '' &&
        locationClassKeyFilter !== location.locationClassKey
      ) {
        continue
      }

      let showRecord = true
      const locationNameLowerCase = location.locationName.toLowerCase()

      for (const locationNamePiece of locationNameFilterSplit) {
        if (!locationNameLowerCase.includes(locationNamePiece)) {
          showRecord = false
          break
        }
      }

      if (!showRecord) {
        continue
      }

      displayCount += 1

      const locationClass = pts.getLocationClass(
        location.locationClassKey
      ).locationClass

      const trElement = document.createElement('tr')

      trElement.innerHTML = `<td>
          <a data-index="${locationIndex.toString()}" href="#">
          ${cityssm.escapeHTML(location.locationName)}
          </a>
        </td><td>
          ${cityssm.escapeHTML(locationClass)}
        </td>`

      trElement
        .querySelector('a')
        ?.addEventListener('click', openEditLocationModalFunction)

      tbodyElement.append(trElement)
    }

    cityssm.clearElement(locationResultsElement)

    if (displayCount === 0) {
      locationResultsElement.innerHTML = `<div class="message is-info">
          <div class="message-body">There are no locations that meet your search criteria.</div>
          </div>`

      return
    }

    locationResultsElement.innerHTML = `<table class="table is-fixed is-striped is-hoverable is-fullwidth">
        <thead><tr>
          <th>Location</th>
          <th>Class</th>
        </tr></thead>
        </table>`

    locationResultsElement.querySelector('table')?.append(tbodyElement)
  }

  // Initialize location classes select and map

  locationClassKeyFilterElement.addEventListener(
    'change',
    renderLocationListFunction
  )
  locationNameFilterElement.addEventListener(
    'keyup',
    renderLocationListFunction
  )

  pts.getDefaultConfigProperty(
    'locationClasses',
    (locationClassesList: ConfigLocationClass[]) => {
      locationClassKeyFilterElement.innerHTML =
        '<option value="">(All Location Classes)</option>'

      for (const locationClass of locationClassesList) {
        locationClassKeyOptionsHTML += `<option value="${cityssm.escapeHTML(
          locationClass.locationClassKey
        )}">
          ${cityssm.escapeHTML(locationClass.locationClass)}
          </option>`
      }

      // eslint-disable-next-line no-unsanitized/method
      locationClassKeyFilterElement.insertAdjacentHTML(
        'beforeend',
        locationClassKeyOptionsHTML
      )

      renderLocationListFunction()
    }
  )

  // Initialize add button

  document
    .querySelector('#is-add-location-button')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      let addLocationCloseModalFunction: () => void

      function addFunction(formEvent: Event): void {
        formEvent.preventDefault()

        cityssm.postJSON(
          `${pts.urlPrefix}/admin/doAddLocation`,
          formEvent.currentTarget,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as UpdateLocationResponseJSON

            if (responseJSON.success) {
              addLocationCloseModalFunction()
              locationList = responseJSON.locations
              renderLocationListFunction()
            } else {
              cityssm.alertModal(
                'Location Not Added',
                responseJSON.message ?? '',
                'OK',
                'danger'
              )
            }
          }
        )
      }

      cityssm.openHtmlModal('location-add', {
        onshow(modalElement) {
          modalElement
            .querySelector('#addLocation--locationClassKey')
            ?.insertAdjacentHTML('beforeend', locationClassKeyOptionsHTML)
        },
        onshown(modalElement, closeModalFunction) {
          bulmaJS.toggleHtmlClipped()
          addLocationCloseModalFunction = closeModalFunction
          ;(
            modalElement.querySelector(
              '#addLocation--locationKey'
            ) as HTMLInputElement
          ).focus()

          modalElement
            .querySelector('form')
            ?.addEventListener('submit', addFunction)
        },
        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    })
})()
