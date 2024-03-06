/* eslint-disable unicorn/filename-case, eslint-comments/disable-enable-pair */

import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { ptsGlobal } from '../../types/publicTypes.js'
import type { LicencePlate } from '../../types/recordTypes.js'

declare const cityssm: cityssmGlobal
declare const pts: ptsGlobal
;(() => {
  const formElement = document.querySelector(
    '#form--filters'
  ) as HTMLFormElement

  const offsetElement = document.querySelector(
    '#filter--offset'
  ) as HTMLInputElement

  const searchResultsElement = document.querySelector(
    '#container--searchResults'
  ) as HTMLElement

  function buildPlateTrElementFunction(
    plateObject: LicencePlate
  ): HTMLTableRowElement {
    const trElement = document.createElement('tr')

    // Output row
    const url = `${pts.urlPrefix}/plates/${
      plateObject.licencePlateCountry === ''
        ? '_'
        : encodeURIComponent(plateObject.licencePlateCountry)
    }/${
      plateObject.licencePlateProvince === ''
        ? '_'
        : encodeURIComponent(plateObject.licencePlateProvince)
    }/${
      plateObject.licencePlateNumber === ''
        ? '_'
        : encodeURIComponent(plateObject.licencePlateNumber)
    }`

    trElement.innerHTML = `<td>
      <a href="${url}" data-tooltip="View Licence Plate">
      ${
        plateObject.licencePlateNumber === ''
          ? '(Blank)'
          : `<span class="licence-plate-number">${plateObject.licencePlateNumber}</span>`
      }
      </a>
      </td>
      <td class="is-vcentered">
      ${
        plateObject.licencePlateProvince === ''
          ? '<span class="has-text-grey">(Blank)</span>'
          : plateObject.licencePlateProvince
      }
      </td>
      <td class="is-vcentered">
      ${
        plateObject.licencePlateCountry === ''
          ? '<span class="has-text-grey">(Blank)</span>'
          : plateObject.licencePlateCountry
      }
      </td>
      <td class="has-text-right is-vcentered">
      ${
        plateObject.hasOwnerRecord
          ? `<span data-tooltip="Has Ownership Record">
              <i class="fas fa-check" aria-hidden="true"></i>
              </span>
              <span class="sr-only">Has Ownership Record</span>`
          : ''
      }
      </td>
      <td class="has-text-right is-vcentered">
        ${(plateObject.unresolvedTicketCount ?? -1).toString()}
      </td>`

    return trElement
  }

  function processPlateResultsFunction(licencePlateResults: {
    count: number
    limit: number
    offset: number
    licencePlates: LicencePlate[]
  }): void {
    const plateList = licencePlateResults.licencePlates

    if (plateList.length === 0) {
      searchResultsElement.innerHTML = `<div class="message is-info">
        <div class="message-body">
        <strong>Your search returned no results.</strong><br />
        Please try expanding your search criteria.
        </div>
        </div>`

      return
    }

    searchResultsElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
      <thead><tr>
      <th>Licence Plate Number</th>
      <th>Province</th>
      <th>Country</th>
      <th class="has-text-right">Ownership Record</th>
      <th class="has-text-right">Unresolved Tickets</th>
      </tr></thead>
      <tbody></tbody>
      </table>`

    const tbodyElement = searchResultsElement.querySelector(
      'tbody'
    ) as HTMLTableSectionElement

    for (const plateObject of plateList) {
      const trElement = buildPlateTrElementFunction(plateObject)
      tbodyElement.append(trElement)
    }

    searchResultsElement.insertAdjacentHTML(
      'beforeend',
      `<div class="level is-block-print">
        <div class="level-left has-text-weight-bold">
        Displaying licence plates
        ${(licencePlateResults.offset + 1).toString()}
        to
        ${Math.min(
          licencePlateResults.limit + licencePlateResults.offset,
          licencePlateResults.count
        ).toString()}
        of
        ${licencePlateResults.count.toString()}
        </div>
      </div>`
    )

    if (licencePlateResults.limit < licencePlateResults.count) {
      const paginationElement = document.createElement('nav')
      paginationElement.className = 'level-right is-hidden-print'
      paginationElement.setAttribute('role', 'pagination')
      paginationElement.setAttribute('aria-label', 'pagination')

      if (licencePlateResults.offset > 0) {
        const previousElement = document.createElement('a')
        previousElement.className = 'button'
        previousElement.innerHTML = `<span class="icon">
          <i class="fas fa-chevron-left" aria-hidden="true"></i>
          </span>
          <span>Previous</span>`

        previousElement.addEventListener('click', (clickEvent) => {
          clickEvent.preventDefault()
          offsetElement.value = Math.max(
            0,
            licencePlateResults.offset - licencePlateResults.limit
          ).toString()
          getLicencePlatesFunction()
        })

        paginationElement.append(previousElement)
      }

      if (
        licencePlateResults.limit + licencePlateResults.offset <
        licencePlateResults.count
      ) {
        const nextElement = document.createElement('a')
        nextElement.className = 'button ml-3'
        nextElement.innerHTML = `<span>Next Licence Plates</span>
          <span class="icon"><i class="fas fa-chevron-right" aria-hidden="true"></i></span>`

        nextElement.addEventListener('click', (clickEvent) => {
          clickEvent.preventDefault()
          offsetElement.value = (
            licencePlateResults.offset + licencePlateResults.limit
          ).toString()
          getLicencePlatesFunction()
        })

        paginationElement.append(nextElement)
      }

      searchResultsElement.querySelector('.level')?.append(paginationElement)
    }
  }

  function getLicencePlatesFunction(): void {
    searchResultsElement.innerHTML = `<p class="has-text-centered has-text-grey-lighter">
      <i class="fas fa-3x fa-circle-notch fa-spin" aria-hidden="true"></i><br />
      <em>Loading licence plates...</em>
      </p>`

    cityssm.postJSON(
      `${pts.urlPrefix}/plates/doGetLicencePlates`,
      formElement,
      processPlateResultsFunction
    )
  }

  function resetOffsetAndGetLicencePlatesFunction(): void {
    offsetElement.value = '0'
    getLicencePlatesFunction()
  }

  formElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()
  })

  document
    .querySelector('#filter--licencePlateNumber')
    ?.addEventListener('change', resetOffsetAndGetLicencePlatesFunction)
  document
    .querySelector('#filter--hasOwnerRecord')
    ?.addEventListener('change', resetOffsetAndGetLicencePlatesFunction)
  document
    .querySelector('#filter--hasUnresolvedTickets')
    ?.addEventListener('change', resetOffsetAndGetLicencePlatesFunction)

  pts.loadDefaultConfigProperties(resetOffsetAndGetLicencePlatesFunction)
})()
