/* eslint-disable unicorn/filename-case, eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-extra-semi */
/* eslint-disable unicorn/prefer-module */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { ParkingBylaw } from '../types/recordTypes.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

type UpdateBylawResponseJSON =
  | {
      success: true
      bylaws: ParkingBylaw[]
      message?: string
    }
  | {
      success: false
      message?: string
    }
;(() => {
  const bylawFilterElement = document.querySelector(
    '#bylawFilter--bylaw'
  ) as HTMLInputElement

  const bylawResultsElement = document.querySelector(
    '#bylawResults'
  ) as HTMLElement

  let bylawList = exports.bylaws as ParkingBylaw[]
  delete exports.bylaws

  function openUpdateOffencesModal(clickEvent: Event): void {
    clickEvent.preventDefault()

    const listIndex = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).dataset.index ?? '',
      10
    )
    const bylaw = bylawList[listIndex]

    let updateOffencesCloseModalFunction: () => void

    function updateFunction(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        '/admin/doUpdateOffencesByBylaw',
        formEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as UpdateBylawResponseJSON

          if (responseJSON.success) {
            updateOffencesCloseModalFunction()
            bylawList = responseJSON.bylaws
            renderBylawListFunction()
          }
        }
      )
    }

    cityssm.openHtmlModal('bylaw-updateOffences', {
      onshow() {
        ;(
          document.querySelector(
            '#updateOffences--bylawNumber'
          ) as HTMLInputElement
        ).value = bylaw.bylawNumber
        ;(
          document.querySelector(
            '#updateOffences--bylawDescription'
          ) as HTMLInputElement
        ).value = bylaw.bylawDescription
        ;(
          document.querySelector(
            '#updateOffences--offenceAmount'
          ) as HTMLInputElement
        ).value = (bylaw.offenceAmountMin ?? 0).toFixed(2)
        ;(
          document.querySelector(
            '#updateOffences--discountDays'
          ) as HTMLInputElement
        ).value = (bylaw.discountDaysMin ?? 0).toString()
        ;(
          document.querySelector(
            '#updateOffences--discountOffenceAmount'
          ) as HTMLInputElement
        ).value = (bylaw.discountOffenceAmountMin ?? 0).toFixed(2)
      },
      onshown(modalElement: HTMLElement, closeModalFunction: () => void) {
        bulmaJS.toggleHtmlClipped()
        updateOffencesCloseModalFunction = closeModalFunction
        modalElement
          .querySelector('form')
          ?.addEventListener('submit', updateFunction)
      },
      onhidden() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function openEditBylawModalFunction(clickEvent: Event): void {
    clickEvent.preventDefault()

    const listIndex = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).dataset.index ?? '',
      10
    )
    const bylaw = bylawList[listIndex]

    let editBylawCloseModalFunction: () => void

    function deleteFunction(): void {
      cityssm.postJSON(
        '/admin/doDeleteBylaw',
        {
          bylawNumber: bylaw.bylawNumber
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as UpdateBylawResponseJSON
          if (responseJSON.success) {
            editBylawCloseModalFunction()
            bylawList = responseJSON.bylaws
            renderBylawListFunction()
          }
        }
      )
    }

    function confirmDeleteFunction(deleteClickEvent: Event): void {
      deleteClickEvent.preventDefault()

      cityssm.confirmModal(
        'Delete By-Law',
        `Are you sure you want to remove by-law "${bylaw.bylawNumber}" from the list of available options?`,
        'Yes, Remove By-Law',
        'danger',
        deleteFunction
      )
    }

    function editFunction(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        '/admin/doUpdateBylaw',
        formEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as UpdateBylawResponseJSON
          if (responseJSON.success) {
            editBylawCloseModalFunction()
            bylawList = responseJSON.bylaws
            renderBylawListFunction()
          }
        }
      )
    }

    cityssm.openHtmlModal('bylaw-edit', {
      onshow() {
        ;(
          document.querySelector('#editBylaw--bylawNumber') as HTMLInputElement
        ).value = bylaw.bylawNumber
        ;(
          document.querySelector(
            '#editBylaw--bylawDescription'
          ) as HTMLInputElement
        ).value = bylaw.bylawDescription
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()

        editBylawCloseModalFunction = closeModalFunction

        modalElement
          .querySelector('form')
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

  function renderBylawListFunction(): void {
    let displayCount = 0

    const bylawFilterSplit = bylawFilterElement.value
      .trim()
      .toLowerCase()
      .split(' ')

    const tbodyElement = document.createElement('tbody')

    for (const [bylawIndex, bylaw] of bylawList.entries()) {
      let showRecord = true

      const bylawNumberLowerCase = bylaw.bylawNumber.toLowerCase()
      const bylawDescriptionLowerCase = bylaw.bylawDescription.toLowerCase()

      for (const searchStringPiece of bylawFilterSplit) {
        if (
          !bylawNumberLowerCase.includes(searchStringPiece) &&
          !bylawDescriptionLowerCase.includes(searchStringPiece)
        ) {
          showRecord = false
          break
        }
      }

      if (!showRecord) {
        continue
      }

      displayCount += 1

      const trElement = document.createElement('tr')

      let offenceAmountRange = ''
      let hasOffences = false

      if (bylaw.offenceAmountMin) {
        hasOffences = true

        offenceAmountRange = '$' + bylaw.offenceAmountMin.toFixed(2)

        if (bylaw.offenceAmountMin !== bylaw.offenceAmountMax) {
          offenceAmountRange += ` to $${(bylaw.offenceAmountMax ?? 0).toFixed(
            2
          )}`
        }

        offenceAmountRange = `<a class="has-tooltip-left" data-tooltip="Update Offence Amounts" data-index="${bylawIndex.toString()}" href="#">
          ${offenceAmountRange}
          </a>`
      } else {
        offenceAmountRange = '(No Offences)'
      }

      trElement.innerHTML = `<td>
          <a data-index="${bylawIndex.toString()}" href="#">
            ${cityssm.escapeHTML(bylaw.bylawNumber)}
          </a>
          </td>
          <td class="has-border-right-width-2">
            ${cityssm.escapeHTML(bylaw.bylawDescription)}
          </td>
          <td class="has-text-right">
            ${(bylaw.offenceCount ?? 0).toString()}
          </td>
          <td class="has-text-right">
            ${offenceAmountRange}
          </td>`

      trElement
        .querySelectorAll('a')[0]
        .addEventListener('click', openEditBylawModalFunction)

      if (hasOffences) {
        trElement
          .querySelectorAll('a')[1]
          .addEventListener('click', openUpdateOffencesModal)
      }

      tbodyElement.append(trElement)
    }

    cityssm.clearElement(bylawResultsElement)

    if (displayCount === 0) {
      bylawResultsElement.innerHTML = `<div class="message is-info">
        <div class="message-body">There are no by-laws that meet your search criteria.</div>
        </div>`

      return
    }

    bylawResultsElement.innerHTML = `<table class="table is-striped is-hoverable is-fullwidth">
        <thead><tr>
        <th>By-Law Number</th>
        <th class="has-border-right-width-2">Description</th>
        <th class="has-text-right">Total Offences</th>
        <th class="has-text-right">Offence Amount Range</th>
        </tr></thead>
      </table>`
    ;(bylawResultsElement.querySelector('table') as HTMLTableElement).append(
      tbodyElement
    )
  }

  // Initialize filters

  bylawFilterElement.addEventListener('keyup', renderBylawListFunction)
  renderBylawListFunction()

  // Initialize add button

  document
    .querySelector('#is-add-bylaw-button')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      let addBylawCloseModalFunction: () => void

      function addFunction(formEvent: Event): void {
        formEvent.preventDefault()

        cityssm.postJSON(
          '/admin/doAddBylaw',
          formEvent.currentTarget,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as UpdateBylawResponseJSON

            if (responseJSON.success) {
              addBylawCloseModalFunction()

              if (responseJSON.message !== undefined) {
                cityssm.alertModal(
                  'By-Law Added',
                  responseJSON.message,
                  'OK',
                  'warning'
                )
              }

              bylawList = responseJSON.bylaws
              renderBylawListFunction()
            } else {
              cityssm.alertModal(
                'By-Law Not Added',
                responseJSON.message ?? '',
                'OK',
                'danger'
              )
            }
          }
        )
      }

      cityssm.openHtmlModal('bylaw-add', {
        onshown(modalElement, closeModalFunction): void {
          addBylawCloseModalFunction = closeModalFunction
          modalElement
            .querySelector('form')
            ?.addEventListener('submit', addFunction)
        }
      })
    })
})()
