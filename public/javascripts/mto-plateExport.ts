/* eslint-disable unicorn/filename-case, unicorn/prefer-module, eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-extra-semi */

import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { ptsGlobal } from '../../types/publicTypes.js'
import type {
  LicencePlateLookupBatch,
  LicencePlateLookupBatchEntry,
  ParkingTicket
} from '../../types/recordTypes.js'

declare const cityssm: cityssmGlobal
declare const pts: ptsGlobal
;(() => {
  const canUpdate = document.querySelector('main')?.dataset.canUpdate === 'true'

  let batchId = -1
  let batchIsLocked = true
  let batchIncludesLabels = false
  let batchIsSent = false

  // Available Plates

  const availableIssueDaysAgoElement = document.querySelector(
    '#available--issueDaysAgo'
  ) as HTMLSelectElement

  const availableTicketsContainerElement = document.querySelector(
    '#is-available-tickets-container'
  ) as HTMLElement

  const licencePlateNumberFilterElement = document.querySelector(
    '#available--licencePlateNumber'
  ) as HTMLInputElement

  let availableTicketsList: Array<ParkingTicket | undefined> = []

  let batchEntriesList: LicencePlateLookupBatchEntry[] = []

  function addParkingTicketToBatch(clickEvent: Event): void {
    clickEvent.preventDefault()

    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    buttonElement.setAttribute('disabled', 'disabled')

    const recordIndex = Number.parseInt(buttonElement.dataset.index ?? '-1', 10)

    const ticketRecord = availableTicketsList[recordIndex]

    const ticketContainerElement = buttonElement.closest(
      '.is-ticket-container'
    ) as HTMLElement

    cityssm.postJSON(
      `${pts.urlPrefix}/plates/doAddLicencePlateToLookupBatch`,
      {
        batchId,
        licencePlateCountry: 'CA',
        licencePlateProvince: 'ON',
        licencePlateNumber: ticketRecord.licencePlateNumber,
        ticketId: ticketRecord.ticketId
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          batch?: LicencePlateLookupBatch
        }

        if (responseJSON.success) {
          // Remove element from available list
          ticketContainerElement.remove()

          // Set tombstone in available plates list
          availableTicketsList[recordIndex] = undefined

          populateBatchView(responseJSON.batch)
        } else {
          buttonElement.removeAttribute('disabled')
        }
      }
    )
  }

  function removeParkingTicketFromBatch(clickEvent: Event): void {
    clickEvent.preventDefault()

    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    buttonElement.setAttribute('disabled', 'disabled')

    const recordIndex = Number.parseInt(buttonElement.dataset.index ?? '-1', 10)

    const batchEntry = batchEntriesList[recordIndex]

    const entryContainerElement = buttonElement.closest(
      '.is-entry-container'
    ) as HTMLElement

    cityssm.postJSON(
      `${pts.urlPrefix}/plates/doRemoveLicencePlateFromLookupBatch`,
      {
        batchId,
        ticketId: batchEntry.ticketId,
        licencePlateCountry: 'CA',
        licencePlateProvince: 'ON',
        licencePlateNumber: batchEntry.licencePlateNumber
      },
      (responseJSON: { success: boolean }) => {
        if (responseJSON.success) {
          // Remove element from list
          entryContainerElement.remove()

          refreshAvailableTickets()
        } else {
          buttonElement.removeAttribute('disabled')
        }
      }
    )
  }

  function clearBatch(clickEvent: Event): void {
    clickEvent.preventDefault()

    function clearFunction(): void {
      cityssm.postJSON(
        pts.urlPrefix + '/plates/doClearLookupBatch',
        {
          batchId
        },
        (responseJSON: {
          success: boolean
          batch?: LicencePlateLookupBatch
        }) => {
          if (responseJSON.success) {
            populateBatchView(responseJSON.batch)
            refreshAvailableTickets()
          }
        }
      )
    }

    cityssm.confirmModal(
      'Clear Batch?',
      'Are you sure you want to remove all licence plates from the batch?',
      'Yes, Clear the Batch',
      'warning',
      clearFunction
    )
  }

  function downloadBatch(clickEvent: Event): void {
    clickEvent.preventDefault()

    function downloadFunction(): void {
      window.open(
        `${pts.urlPrefix}/plates-ontario/mtoExport/${batchId.toString()}`
      )
      batchIsSent = true
    }

    if (batchIsSent) {
      downloadFunction()
      return
    }

    cityssm.confirmModal(
      'Download Batch?',
      `<strong>You are about to download this batch for the first time.</strong><br />
        The date of this download will be tracked as part of the batch record.`,
      'OK, Download the File',
      'warning',
      downloadFunction
    )
  }

  function populateAvailableTicketsView(): void {
    cityssm.clearElement(availableTicketsContainerElement)

    const resultsPanelElement = document.createElement('div')
    resultsPanelElement.className = 'panel'

    const filterStringSplit = licencePlateNumberFilterElement.value
      .toLowerCase()
      .trim()
      .split(' ')

    const includedTicketIds: number[] = []

    for (const [recordIndex, ticketRecord] of availableTicketsList.entries()) {
      // Tombstone record
      if (!ticketRecord) {
        continue
      }

      let displayRecord = true
      const licencePlateNumberLowerCase =
        ticketRecord.licencePlateNumber.toLowerCase()

      for (const searchStringPiece of filterStringSplit) {
        if (!licencePlateNumberLowerCase.includes(searchStringPiece)) {
          displayRecord = false
          break
        }
      }

      if (!displayRecord) {
        continue
      }

      includedTicketIds.push(ticketRecord.ticketId)

      const resultElement = document.createElement('div')
      resultElement.className = 'panel-block is-block is-ticket-container'

      resultElement.innerHTML = `<div class="level is-marginless">
        <div class="level-left">
          <div class="licence-plate">
            <div class="licence-plate-number">
            ${cityssm.escapeHTML(ticketRecord.licencePlateNumber)}
            </div>
          </div>
        </div>
        <div class="level-right">
          <button class="button is-small" data-index="${recordIndex.toString()}" data-cy="add-ticket" data-tooltip="Add to Batch" type="button">
            <span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>
            <span>Add</span
          </button>
        </div>
        </div>
        <div class="level">
        <div class="level-left">
          <div class="tags">
            <a class="tag has-tooltip-bottom" data-tooltip="View Ticket (Opens in New Window)"
              href="${pts.urlPrefix}/tickets/${ticketRecord.ticketId}"
              target="_blank">
              ${cityssm.escapeHTML(ticketRecord.ticketNumber)}
            </a>
          </div>
        </div>
        <div class="level-right is-size-7">
          ${ticketRecord.issueDateString}
        </div>
        </div>`

      resultElement
        .querySelector('button')
        ?.addEventListener('click', addParkingTicketToBatch)

      resultsPanelElement.append(resultElement)
    }

    if (includedTicketIds.length > 0) {
      const addAllButtonElement = document.createElement('button')
      addAllButtonElement.className = 'button is-fullwidth mb-3'
      addAllButtonElement.dataset.cy = 'add-tickets'

      addAllButtonElement.innerHTML = `<span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>
        <span>
          Add
          ${includedTicketIds.length.toString()}
          Parking Ticket${includedTicketIds.length === 1 ? '' : 's'}
        </span>`

      addAllButtonElement.addEventListener('click', () => {
        cityssm.openHtmlModal('loading', {
          onshown(_modalElement, closeModalFunction) {
            ;(
              document.querySelector('#is-loading-modal-message') as HTMLElement
            ).textContent = `Adding
              ${includedTicketIds.length.toString()}
              Parking Ticket${includedTicketIds.length === 1 ? '' : 's'}...`

            cityssm.postJSON(
              `${pts.urlPrefix}/plates/doAddAllParkingTicketsToLookupBatch`,
              {
                batchId,
                ticketIds: includedTicketIds
              },
              (rawResultJSON) => {
                const resultJSON = rawResultJSON as
                  | {
                      success: false
                    }
                  | {
                      success: true
                      batch: LicencePlateLookupBatch
                    }

                closeModalFunction()

                if (resultJSON.success) {
                  populateBatchView(resultJSON.batch)
                  refreshAvailableTickets()
                }
              }
            )
          }
        })
      })

      availableTicketsContainerElement.append(addAllButtonElement)

      availableTicketsContainerElement.append(resultsPanelElement)
    } else {
      availableTicketsContainerElement.innerHTML = `<div class="message is-info">
        <div class="message-body">There are no parking tickets that meet your search criteria.</div>
        </div>`
    }
  }

  function refreshAvailableTickets(): void {
    if (batchIsLocked) {
      availableTicketsContainerElement.innerHTML = `<div class="message is-info">
        <div class="message-body">Parking Tickets cannot be added to a locked batch.</div>
        </div>`

      return
    }

    availableTicketsContainerElement.innerHTML = `<p class="has-text-centered has-text-grey-lighter">
      <i class="fas fa-3x fa-circle-notch fa-spin" aria-hidden="true"></i><br />
      <em>Loading parking tickets...</em>
      </p>`

    cityssm.postJSON(
      `${pts.urlPrefix}/plates-ontario/doGetParkingTicketsAvailableForMTOLookup`,
      {
        batchId,
        issueDaysAgo: availableIssueDaysAgoElement.value
      },
      (responseJSON: { tickets: ParkingTicket[] }) => {
        availableTicketsList = responseJSON.tickets
        populateAvailableTicketsView()
      }
    )
  }

  document
    .querySelector('#is-more-available-filters-toggle')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()
      document
        .querySelector('#is-more-available-filters')
        ?.classList.toggle('is-hidden')
    })

  licencePlateNumberFilterElement.addEventListener(
    'keyup',
    populateAvailableTicketsView
  )

  availableIssueDaysAgoElement.addEventListener(
    'change',
    refreshAvailableTickets
  )

  // Current Batch

  const lockBatchButtonElement = document.querySelector(
    '#is-lock-batch-button'
  ) as HTMLElement

  const batchEntriesContainerElement = document.querySelector(
    '#is-batch-entries-container'
  ) as HTMLElement

  function populateBatchView(batch: LicencePlateLookupBatch): void {
    batchId = batch.batchId
    batchEntriesList = batch.batchEntries

    batchIsLocked = batch.lockDateString !== ''
    batchIsSent = batch.sentDateString !== ''
    batchIncludesLabels = batch.mto_includeLabels

    if (canUpdate) {
      if (batchIsLocked) {
        lockBatchButtonElement.setAttribute('disabled', 'disabled')
      } else {
        lockBatchButtonElement.removeAttribute('disabled')
      }
    }

    ;(
      document.querySelector('#batchSelector--batchId') as HTMLElement
    ).innerHTML = `Batch #${batch.batchId.toString()}<br />
      ${
        batchIncludesLabels
          ? `<span class="tag is-light">
            <span class="icon is-small"><i class="fas fa-tag" aria-hidden="true"></i></span>
            <span>Include Labels</span>
            </span>`
          : ''
      } ${
      batchIsLocked
        ? `<span class="tag is-light">
          <span class="icon is-small"><i class="fas fa-lock" aria-hidden="true"></i></span>
          <span>${batch.lockDateString}</span>
          </span>`
        : ''
    }`
    ;(
      document.querySelector('#batchSelector--batchDetails') as HTMLElement
    ).innerHTML = `<span class="icon is-small"><i class="fas fa-calendar" aria-hidden="true"></i></span>
      <span>${batch.batchDateString}</span>`

    cityssm.clearElement(batchEntriesContainerElement)

    if (batchEntriesList.length === 0) {
      batchEntriesContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no parking tickets included in the batch.</p>
        </div>`

      return
    }

    cityssm.clearElement(batchEntriesContainerElement)

    const panelElement = document.createElement('div')
    panelElement.className = 'panel'

    for (const [index, batchEntry] of batchEntriesList.entries()) {
      const panelBlockElement = document.createElement('div')
      panelBlockElement.className = 'panel-block is-block is-entry-container'

      panelBlockElement.innerHTML = `<div class="level mb-0">
          <div class="level-left">
            <div class="licence-plate">
              <div class="licence-plate-number">
              ${cityssm.escapeHTML(batchEntry.licencePlateNumber)}
              </div>
            </div>
          </div>
          ${
            batchIsLocked
              ? ''
              : `<div class="level-right">
                  <button class="button is-small" data-index="${index.toString()}" data-cy="remove-ticket" type="button">
                    <span class="icon is-small"><i class="fas fa-minus" aria-hidden="true"></i></span>
                    <span>Remove</span>
                  </button>
                  </div>`
          }
          </div>
          <a class="tag has-tooltip-bottom" data-tooltip="View Ticket (Opens in New Window)"
            href="${pts.urlPrefix}/tickets/${
        batchEntry.ticketId
      }" target="_blank">
            ${cityssm.escapeHTML(batchEntry.ticketNumber)}
          </a>`

      if (!batchIsLocked) {
        panelBlockElement
          .querySelector('button')
          ?.addEventListener('click', removeParkingTicketFromBatch)
      }

      panelElement.append(panelBlockElement)
    }

    if (batchIsLocked) {
      const downloadFileButtonElement = document.createElement('button')
      downloadFileButtonElement.className = 'button is-fullwidth mb-3'
      downloadFileButtonElement.innerHTML = `<span class="icon is-small"><i class="fas fa-download" aria-hidden="true"></i></span>
        <span>Download File for MTO</span>`

      downloadFileButtonElement.addEventListener('click', downloadBatch)

      batchEntriesContainerElement.append(downloadFileButtonElement)

      batchEntriesContainerElement.insertAdjacentHTML(
        'beforeend',
        `<a class="button is-fullwidth mb-3" href="https://www.aris.mto.gov.on.ca/edtW/login/login.jsp" target="_blank" rel="noreferrer">
          <span class="icon is-small"><i class="fas fa-building" aria-hidden="true"></i></span>
          <span>MTO ARIS Login</span>
          </a>`
      )
    } else {
      const clearAllButtonElement = document.createElement('button')
      clearAllButtonElement.className = 'button is-fullwidth mb-3'
      clearAllButtonElement.dataset.cy = 'clear-batch'
      clearAllButtonElement.innerHTML = `<span class="icon is-small"><i class="fas fa-broom" aria-hidden="true"></i></span>
        <span>Clear Batch</span>`

      clearAllButtonElement.addEventListener('click', clearBatch)

      batchEntriesContainerElement.append(clearAllButtonElement)
    }

    batchEntriesContainerElement.append(panelElement)
  }

  function refreshBatch(): void {
    cityssm.postJSON(
      `${pts.urlPrefix}/plates/doGetLookupBatch`,
      {
        batchId
      },
      (batch: LicencePlateLookupBatch) => {
        populateBatchView(batch)
        refreshAvailableTickets()
      }
    )
  }

  function openCreateBatchModal(): void {
    let createCloseModal: () => void

    function createFunction(clickEvent: Event): void {
      clickEvent.preventDefault()

      const mto_includeLabels = (clickEvent.currentTarget as HTMLButtonElement)
        .dataset.includeLabels

      cityssm.postJSON(
        `${pts.urlPrefix}/plates/doCreateLookupBatch`,
        {
          mto_includeLabels
        },
        (responseJSON: {
          success: boolean
          batch?: LicencePlateLookupBatch
        }) => {
          if (responseJSON.success) {
            createCloseModal()
            populateBatchView(responseJSON.batch)
            refreshAvailableTickets()
          }
        }
      )
    }

    cityssm.openHtmlModal('mto-createBatch', {
      onshow: (modalElement) => {
        const createBatchButtonElements = modalElement.querySelectorAll(
          '.is-create-batch-button'
        )

        for (const createBatchButtonElement of createBatchButtonElements) {
          createBatchButtonElement.addEventListener('click', createFunction)
        }
      },
      onshown: (_modalElement, closeModalFunction) => {
        createCloseModal = closeModalFunction
      }
    })
  }

  function openSelectBatchModal(clickEvent: Event): void {
    clickEvent.preventDefault()

    let selectBatchCloseModalFunction: () => void
    let resultsContainerElement: HTMLDivElement

    function selectBatch(batchClickEvent: Event): void {
      batchClickEvent.preventDefault()

      batchId = Number.parseInt(
        (batchClickEvent.currentTarget as HTMLAnchorElement).dataset.batchId ??
          '-1',
        10
      )

      selectBatchCloseModalFunction()
      refreshBatch()
    }

    function loadBatches(): void {
      cityssm.postJSON(
        `${pts.urlPrefix}/plates/doGetUnreceivedLicencePlateLookupBatches`,
        {},
        (batchList: LicencePlateLookupBatch[]) => {
          if (batchList.length === 0) {
            resultsContainerElement.innerHTML = `<div class="message is-info">
              <p class="message-body">There are no unsent batches available.</p>
              </div>`
            return
          }

          const listElement = document.createElement('div')
          listElement.className = 'panel'

          for (const batch of batchList) {
            const linkElement = document.createElement('a')
            linkElement.className = 'panel-block is-block'
            linkElement.setAttribute('href', '#')
            linkElement.dataset.batchId = batch.batchId.toString()

            linkElement.innerHTML = `<div class="columns">
              <div class="column is-narrow">
                #${batch.batchId.toString()}
              </div>
              <div class="column has-text-right">
                ${batch.batchDateString}<br />
                <div class="tags justify-flex-end">
                ${
                  batch.mto_includeLabels
                    ? `<span class="tag">
                        <span class="icon is-small"><i class="fas fa-tag" aria-hidden="true"></i></span>
                        <span>Includes Labels</span>
                        </span>`
                    : ''
                }
                ${
                  batch.lockDate
                    ? `<span class="tag">
                        <span class="icon is-small"><i class="fas fa-lock" aria-hidden="true"></i></span>
                        <span>Locked</span>
                        </span>`
                    : ''
                }
                ${
                  batch.sentDate
                    ? `<span class="tag">
                        <span class="icon is-small"><i class="fas fa-share" aria-hidden="true"></i></span>
                        <span>Sent to MTO</span>
                        </span>`
                    : ''
                }
                </div>
              </div>
              </div>`

            linkElement.addEventListener('click', selectBatch)

            listElement.append(linkElement)
          }

          cityssm.clearElement(resultsContainerElement)
          resultsContainerElement.append(listElement)
        }
      )
    }

    cityssm.openHtmlModal('mto-selectBatch', {
      onshow(modalElement) {
        resultsContainerElement = modalElement.querySelector(
          '.is-results-container'
        ) as HTMLDivElement
        loadBatches()

        if (canUpdate) {
          const createBatchButtonElement = modalElement.querySelector(
            '.is-create-batch-button'
          ) as HTMLElement

          createBatchButtonElement.classList.remove('is-hidden')

          createBatchButtonElement.addEventListener('click', () => {
            selectBatchCloseModalFunction()

            openCreateBatchModal()
          })
        }
      },
      onshown(_modalElement, closeModalFunction) {
        selectBatchCloseModalFunction = closeModalFunction
      }
    })
  }

  document
    .querySelector('#is-select-batch-button')
    ?.addEventListener('click', openSelectBatchModal)

  if (canUpdate) {
    lockBatchButtonElement?.addEventListener('click', () => {
      if (batchIsLocked) {
        return
      }

      function lockFunction(): void {
        cityssm.postJSON(
          `${pts.urlPrefix}/plates/doLockLookupBatch`,
          {
            batchId
          },
          (responseJSON: {
            success: boolean
            batch?: LicencePlateLookupBatch
          }) => {
            if (responseJSON.success) {
              populateBatchView(responseJSON.batch)
            }
          }
        )
      }

      cityssm.confirmModal(
        'Lock Batch?',
        `<strong>Are you sure you want to lock the batch?</strong><br />
          Once the batch is locked, no licence plates can be added or deleted from the batch.
          All tickets related to the licence plates in the batch will be updated with a "Pending Lookup" status.`,
        'Yes, Lock the Batch',
        'info',
        lockFunction
      )
    })
  }

  if (exports.plateExportBatch) {
    populateBatchView(exports.plateExportBatch)
    delete exports.plateExportBatch

    refreshAvailableTickets()
  }
})()
