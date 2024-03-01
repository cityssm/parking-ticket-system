/* eslint-disable unicorn/filename-case, eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-labels */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { ptsGlobal } from '../../types/publicTypes.js'
// eslint-disable-next-line import/namespace
import type {
  ParkingLocation,
  ParkingOffence
} from '../../types/recordTypes.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
declare const pts: ptsGlobal

  // eslint-disable-next-line sonarjs/cognitive-complexity
;(() => {
  const ticketId = (
    document.querySelector('#ticket--ticketId') as HTMLInputElement
  ).value
  const isCreate = ticketId === ''

  /*
   * Form Management
   */

  const formMessageElement = document.querySelector(
    '#container--form-message'
  ) as HTMLElement

  // let hasUnsavedChanges = false;

  function setUnsavedChangesFunction(): void {
    cityssm.enableNavBlocker()

    // hasUnsavedChanges = true;
    formMessageElement.innerHTML = `<span class="tag is-light is-info is-medium">
      <span class="icon"><i class="fas fa-exclamation-triangle" aria-hidden="true"></i></span>
      <span>Unsaved Changes</span>
      </span>`
  }

  const inputElements = document.querySelectorAll('.input, .select, .textarea')

  for (const inputElement of inputElements) {
    inputElement.addEventListener('change', setUnsavedChangesFunction)
  }

  type FormResponseJSON =
    | {
        success: true
        ticketId: number
        nextTicketNumber?: string
      }
    | {
        success: false
        message: string
      }

  document
    .querySelector('#form--ticket')
    ?.addEventListener('submit', (formEvent) => {
      formEvent.preventDefault()

      const ticketNumber = (
        document.querySelector('#ticket--ticketNumber') as HTMLInputElement
      ).value

      formMessageElement.innerHTML = `<span class="tag is-light is-info is-medium">
        <span>Saving ticket... </span>
        <span class="icon"><i class="fas fa-circle-notch fa-spin" aria-hidden="true"></i></span>
        </span>`

      cityssm.postJSON(
        isCreate
          ? pts.urlPrefix + '/tickets/doCreateTicket'
          : pts.urlPrefix + '/tickets/doUpdateTicket',
        formEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as FormResponseJSON
          if (responseJSON.success) {
            cityssm.disableNavBlocker()
            // hasUnsavedChanges = false;

            formMessageElement.innerHTML = `<span class="tag is-light is-success is-medium">
              <span class="icon"><i class="fas fa-check" aria-hidden="true"></i></span>
              <span>Saved Successfully</span>
              </span>`
          } else {
            setUnsavedChangesFunction()
            cityssm.alertModal(
              'Ticket Not Saved',
              responseJSON.message,
              'OK',
              'danger'
            )
          }

          if (responseJSON.success && isCreate) {
            cityssm.openHtmlModal('ticket-createSuccess', {
              onshow() {
                ;(
                  document.querySelector(
                    '#createSuccess--ticketNumber'
                  ) as HTMLElement
                ).textContent = ticketNumber

                document
                  .querySelector('#createSuccess--editTicketButton')
                  ?.setAttribute(
                    'href',
                    `${pts.urlPrefix}/tickets/${responseJSON.ticketId.toString()}/edit`
                  )

                document
                  .querySelector('#createSuccess--newTicketButton')
                  ?.setAttribute(
                    'href',
                    `${pts.urlPrefix}/tickets/new/${responseJSON.nextTicketNumber}`
                  )
              }
            })
          }
        }
      )
    })

  function doDelete(): void {
    cityssm.postJSON(
      pts.urlPrefix + '/tickets/doDeleteTicket',
      {
        ticketId
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as { success: boolean }

        if (responseJSON.success) {
          window.location.href = `${pts.urlPrefix}/tickets`
        }
      }
    )
  }

  document
    .querySelector('#is-delete-ticket-button')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      bulmaJS.confirm({
        title: 'Delete Ticket',
        message: 'Are you sure you want to delete this ticket record?',
        contextualColorName: 'danger',
        okButton: {
          text: 'Yes, Delete Ticket',
          callbackFunction: doDelete
        }
      })
    })

  /*
   * Location Lookup
   */

  pts.getDefaultConfigProperty('locationClasses', () => {
    let locationLookupCloseModalFunction: () => void
    let locationFilterElement: HTMLInputElement

    let locationList: ParkingLocation[] = []

    function clearLocationFunction(clickEvent: Event): void {
      clickEvent.preventDefault()
      ;(
        document.querySelector('#ticket--locationKey') as HTMLInputElement
      ).value = ''
      ;(
        document.querySelector('#ticket--locationName') as HTMLInputElement
      ).value = ''

      locationLookupCloseModalFunction()

      locationList = []
    }

    function setLocationFunction(clickEvent: Event): void {
      clickEvent.preventDefault()

      const locationObject =
        locationList[
          Number.parseInt(
            (clickEvent.currentTarget as HTMLAnchorElement).dataset.index ?? '',
            10
          )
        ]
      ;(
        document.querySelector('#ticket--locationKey') as HTMLInputElement
      ).value = locationObject.locationKey
      ;(
        document.querySelector('#ticket--locationName') as HTMLInputElement
      ).value = locationObject.locationName

      locationLookupCloseModalFunction()

      locationList = []
    }

    function renderLocationsFunction(): void {
      const listElement = document.createElement('div')
      listElement.className = 'panel mb-4'

      const filterPieces = locationFilterElement.value
        .trim()
        .toLowerCase()
        .split(' ')

      locationLoop: for (const [
        index,
        locationObject
      ] of locationList.entries()) {
        for (const filterPiece of filterPieces) {
          if (
            !locationObject.locationName.toLowerCase().includes(filterPiece)
          ) {
            continue locationLoop
          }
        }

        const locationClassObject = pts.getLocationClass(
          locationObject.locationClassKey
        )

        const linkElement = document.createElement('a')
        linkElement.className = 'panel-block is-block'
        linkElement.dataset.index = index.toString()
        linkElement.setAttribute('href', '#')
        linkElement.addEventListener('click', setLocationFunction)
        linkElement.innerHTML =
          '<div class="level">' +
          '<div class="level-left">' +
          cityssm.escapeHTML(locationObject.locationName) +
          '</div>' +
          (locationClassObject?.locationClass
            ? '<div class="level-right">' +
              '<span class="tag is-primary">' +
              cityssm.escapeHTML(locationClassObject.locationClass) +
              '</span>' +
              '</div>'
            : '') +
          '</div>'

        listElement.append(linkElement)
      }

      const containerElement = document.querySelector(
        '#container--parkingLocations'
      ) as HTMLElement
      cityssm.clearElement(containerElement)
      containerElement.append(listElement)
    }

    function populateLocationsFunction(): void {
      cityssm.postJSON(
        pts.urlPrefix + '/offences/doGetAllLocations',
        {},
        (rawResponseJSON) => {
          const locationListResponse =
            rawResponseJSON as unknown as ParkingLocation[]

          locationList = locationListResponse

          renderLocationsFunction()
        }
      )
    }

    function openLocationLookupModalFunction(clickEvent: Event): void {
      clickEvent.preventDefault()

      cityssm.openHtmlModal('ticket-setLocation', {
        onshown(modalElement, closeModalFunction) {
          bulmaJS.toggleHtmlClipped()

          locationLookupCloseModalFunction = closeModalFunction

          if (locationList.length === 0) {
            populateLocationsFunction()
          } else {
            renderLocationsFunction()
          }

          locationFilterElement = modalElement.querySelector(
            '#filter--parkingLocations'
          ) as HTMLInputElement

          locationFilterElement.focus()
          locationFilterElement.addEventListener(
            'keyup',
            renderLocationsFunction
          )

          modalElement
            .querySelector('#is-clear-location-button')
            ?.addEventListener('click', clearLocationFunction)
        },
        onremoved(): void {
          ;(
            document.querySelector(
              '#is-location-lookup-button'
            ) as HTMLButtonElement
          ).focus()

          bulmaJS.toggleHtmlClipped()
        }
      })
    }

    document
      .querySelector('#is-location-lookup-button')
      ?.addEventListener('click', openLocationLookupModalFunction)

    document
      .querySelector('#ticket--locationName')
      ?.addEventListener('dblclick', openLocationLookupModalFunction)
  })

  /*
   * By-law / Offence Lookup
   */

  let bylawLookupCloseModalFunction: () => void
  let offenceList: ParkingOffence[] = []
  let listItemElements: HTMLAnchorElement[] = []

  function clearBylawOffenceFunction(clickEvent: Event): void {
    clickEvent.preventDefault()
    ;(
      document.querySelector('#ticket--bylawNumber') as HTMLInputElement
    ).value = ''

    // Offence Amount
    const offenceAmountElement = document.querySelector(
      '#ticket--offenceAmount'
    ) as HTMLInputElement

    offenceAmountElement.classList.add('is-readonly')
    offenceAmountElement.setAttribute('readonly', 'readonly')
    offenceAmountElement
      .closest('.field')
      ?.querySelector('.is-unlock-field-button')
      ?.removeAttribute('disabled')
    offenceAmountElement.value = ''

    // Discount Offence Amount
    const discountOffenceAmountElement = document.querySelector(
      '#ticket--discountOffenceAmount'
    ) as HTMLInputElement

    discountOffenceAmountElement.classList.add('is-readonly')
    discountOffenceAmountElement.setAttribute('readonly', 'readonly')
    discountOffenceAmountElement
      .closest('.field')
      ?.querySelector('.is-unlock-field-button')
      ?.removeAttribute('disabled')
    discountOffenceAmountElement.value = ''

    // Discount Days
    const discountDaysElement = document.querySelector(
      '#ticket--discountDays'
    ) as HTMLInputElement

    discountDaysElement.classList.add('is-readonly')
    discountDaysElement.setAttribute('readonly', 'readonly')
    discountDaysElement
      .closest('.field')
      ?.querySelector('.is-unlock-field-button')
      ?.removeAttribute('disabled')
    discountDaysElement.value = ''
    ;(
      document.querySelector('#ticket--parkingOffence') as HTMLTextAreaElement
    ).value = ''

    bylawLookupCloseModalFunction()

    offenceList = []
  }

  function setBylawOffenceFunction(clickEvent: Event): void {
    clickEvent.preventDefault()

    const offenceObject =
      offenceList[
        Number.parseInt(
          (clickEvent.currentTarget as HTMLInputElement).dataset.index ?? '',
          10
        )
      ]
    ;(
      document.querySelector('#ticket--bylawNumber') as HTMLInputElement
    ).value = offenceObject.bylawNumber

    // Offence Amount
    const offenceAmountElement = document.querySelector(
      '#ticket--offenceAmount'
    ) as HTMLInputElement

    offenceAmountElement.classList.add('is-readonly')
    offenceAmountElement.setAttribute('readonly', 'readonly')
    offenceAmountElement
      .closest('.field')
      ?.querySelector('.is-unlock-field-button')
      ?.removeAttribute('disabled')
    offenceAmountElement.value = offenceObject.offenceAmount.toFixed(2)

    // Discount Offence Amount
    const discountOffenceAmountElement = document.querySelector(
      '#ticket--discountOffenceAmount'
    ) as HTMLInputElement

    discountOffenceAmountElement.classList.add('is-readonly')
    discountOffenceAmountElement.setAttribute('readonly', 'readonly')
    discountOffenceAmountElement
      .closest('.field')
      ?.querySelector('.is-unlock-field-button')
      ?.removeAttribute('disabled')
    discountOffenceAmountElement.value =
      offenceObject.discountOffenceAmount.toFixed(2)

    // Discount Days
    const discountDaysElement = document.querySelector(
      '#ticket--discountDays'
    ) as HTMLInputElement

    discountDaysElement.classList.add('is-readonly')
    discountDaysElement.setAttribute('readonly', 'readonly')
    discountDaysElement
      .closest('.field')
      ?.querySelector('.is-unlock-field-button')
      ?.removeAttribute('disabled')
    discountDaysElement.value = offenceObject.discountDays.toString()
    ;(
      document.querySelector('#ticket--parkingOffence') as HTMLTextAreaElement
    ).value = offenceObject.bylawDescription

    bylawLookupCloseModalFunction()

    offenceList = []
  }

  function populateBylawsFunction(): void {
    const locationKey = (
      document.querySelector('#ticket--locationKey') as HTMLInputElement
    ).value
    // const locationName = document.getElementById("ticket--locationName").value;
    cityssm.postJSON(
      pts.urlPrefix + '/offences/doGetOffencesByLocation',
      {
        locationKey
      },
      (rawResponseJSON) => {
        const offenceListResponse =
          rawResponseJSON as unknown as ParkingOffence[]

        offenceList = offenceListResponse
        listItemElements = []

        const listElement = document.createElement('div')
        listElement.className = 'panel mb-4'

        for (const [index, offenceObject] of offenceList.entries()) {
          const linkElement = document.createElement('a')
          linkElement.className = 'panel-block is-block'
          linkElement.dataset.index = index.toString()
          linkElement.setAttribute('href', '#')
          linkElement.addEventListener('click', setBylawOffenceFunction)
          linkElement.innerHTML = `<div class="columns">
            <div class="column">
              <span class="has-text-weight-semibold">
                ${cityssm.escapeHTML(offenceObject.bylawNumber)}
              </span><br />
              <small>
                ${cityssm.escapeHTML(offenceObject.bylawDescription)}
              </small>
            </div>
            <div class="column is-narrow has-text-weight-semibold">
              $${offenceObject.offenceAmount.toFixed(2)}
            </div></div>`

          listElement.append(linkElement)
          listItemElements.push(linkElement)
        }

        const containerElement = document.querySelector(
          '#container--bylawNumbers'
        ) as HTMLElement
        cityssm.clearElement(containerElement)
        containerElement.append(listElement)
      }
    )
  }

  function filterBylawsFunction(keyupEvent: Event): void {
    const searchStringSplit = (
      keyupEvent.currentTarget as HTMLInputElement
    ).value
      .trim()
      .toLowerCase()
      .split(' ')

    for (const [recordIndex, offenceRecord] of offenceList.entries()) {
      let displayRecord = true

      for (const searchPiece of searchStringSplit) {
        if (
          !offenceRecord.bylawNumber.toLowerCase().includes(searchPiece) &&
          !offenceRecord.bylawDescription.toLowerCase().includes(searchPiece)
        ) {
          displayRecord = false
          break
        }
      }

      if (displayRecord) {
        listItemElements[recordIndex].classList.remove('is-hidden')
      } else {
        listItemElements[recordIndex].classList.add('is-hidden')
      }
    }
  }

  function openBylawLookupModalFunction(clickEvent: Event): void {
    clickEvent.preventDefault()

    cityssm.openHtmlModal('ticket-setBylawOffence', {
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()

        bylawLookupCloseModalFunction = closeModalFunction
        populateBylawsFunction()

        const searchStringElement = modalElement.querySelector(
          '#bylawLookup--searchStr'
        ) as HTMLInputElement

        searchStringElement.focus()
        searchStringElement.addEventListener('keyup', filterBylawsFunction)

        modalElement
          .querySelector('#is-clear-bylaw-button')
          ?.addEventListener('click', clearBylawOffenceFunction)
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
        ;(
          document.querySelector('#is-bylaw-lookup-button') as HTMLButtonElement
        ).focus()
      }
    })
  }

  document
    .querySelector('#is-bylaw-lookup-button')
    ?.addEventListener('click', openBylawLookupModalFunction)

  document
    .querySelector('#ticket--bylawNumber')
    ?.addEventListener('dblclick', openBylawLookupModalFunction)

  /*
   * Licence Plate Required
   */

  {
    const licencePlateIsMissingCheckboxElement = document.querySelector(
      '#ticket--licencePlateIsMissing'
    ) as HTMLInputElement

    const licencePlateInputSelectors = [
      '#ticket--licencePlateCountry',
      '#ticket--licencePlateProvince',
      '#ticket--licencePlateNumber'
    ]

    licencePlateIsMissingCheckboxElement.addEventListener('change', () => {
      for (const inputSelector of licencePlateInputSelectors) {
        ;(document.querySelector(inputSelector) as HTMLInputElement).required =
          !licencePlateIsMissingCheckboxElement.checked
      }
    })
  }

  /*
   * Licence Plate Province Datalist
   */

  function populateLicencePlateProvinceDatalistFunction(): void {
    const datalistElement = document.querySelector(
      '#datalist--licencePlateProvince'
    ) as HTMLElement
    cityssm.clearElement(datalistElement)

    const countryString = (
      document.querySelector('#ticket--licencePlateCountry') as HTMLInputElement
    ).value

    const countryProperties =
      pts.getLicencePlateCountryProperties(countryString)

    if (countryProperties?.provinces) {
      const provincesList = Object.values(countryProperties.provinces)

      for (const province of provincesList) {
        const optionElement = document.createElement('option')
        optionElement.setAttribute('value', province.provinceShortName)
        datalistElement.append(optionElement)
      }
    }
  }

  document
    .querySelector('#ticket--licencePlateCountry')
    ?.addEventListener('change', populateLicencePlateProvinceDatalistFunction)

  pts.loadDefaultConfigProperties(populateLicencePlateProvinceDatalistFunction)

  /*
   * Unlock Buttons
   */

  function unlockFieldFunction(unlockButtonClickEvent: Event): void {
    unlockButtonClickEvent.preventDefault()

    const unlockButtonElement =
      unlockButtonClickEvent.currentTarget as HTMLButtonElement

    const inputTag = unlockButtonElement.dataset.unlock ?? ''

    const readOnlyElement = unlockButtonElement
      .closest('.field')
      ?.querySelector(inputTag) as HTMLInputElement

    readOnlyElement.removeAttribute('readonly')
    readOnlyElement.classList.remove('is-readonly')

    readOnlyElement.focus()

    unlockButtonElement.setAttribute('disabled', 'disabled')
  }

  const unlockButtonElements = document.querySelectorAll(
    '.is-unlock-field-button'
  )

  for (const unlockButtonElement of unlockButtonElements) {
    unlockButtonElement.addEventListener('click', unlockFieldFunction)
  }
})()
