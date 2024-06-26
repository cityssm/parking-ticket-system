/* eslint-disable unicorn/filename-case, unicorn/prefer-module, eslint-comments/disable-enable-pair */
/* eslint-disable no-extra-semi */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { ConfigParkingTicketStatus } from '../../types/configTypes.js'
import type { ptsGlobal } from '../../types/publicTypes.js'
import type { ParkingTicketStatusLog } from '../../types/recordTypes.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
declare const pts: ptsGlobal
;(() => {
  const ticketId = cityssm.escapeHTML(
    (document.querySelector('#ticket--ticketId') as HTMLInputElement).value
  )

  const statusPanelElement = document.querySelector(
    '#is-status-panel'
  ) as HTMLElement

  let statusList = exports.ticketStatusLog as ParkingTicketStatusLog[]
  delete exports.ticketStatusLog

  function clearStatusPanelFunction(): void {
    const panelBlockElements =
      statusPanelElement.querySelectorAll('.panel-block')

    for (const panelBlockElement of panelBlockElements) {
      panelBlockElement.remove()
    }
  }

  function doResolve(): void {
    cityssm.postJSON(
      `${pts.urlPrefix}/tickets/doResolveTicket`,
      {
        ticketId
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as { success: boolean }
        if (responseJSON.success) {
          window.location.href = `${pts.urlPrefix}/tickets/${ticketId}`
        }
      }
    )
  }

  function confirmResolveTicketFunction(clickEvent: Event): void {
    clickEvent.preventDefault()

    bulmaJS.confirm({
      title: 'Mark Ticket as Resolved',
      message:
        'Once resolved, you will no longer be able to make changes to the ticket.',
      contextualColorName: 'info',
      okButton: {
        text: 'Yes, Resolve Ticket',
        callbackFunction: doResolve
      }
    })
  }

  function confirmDeleteStatusFunction(clickEvent: Event): void {
    const statusIndex = (clickEvent.currentTarget as HTMLElement).dataset
      .statusIndex

    function doDeleteStatus(): void {
      cityssm.postJSON(
        `${pts.urlPrefix}/tickets/doDeleteStatus`,
        {
          ticketId,
          statusIndex
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as { success: boolean }
          if (responseJSON.success) {
            getStatusesFunction()
          }
        }
      )
    }

    bulmaJS.confirm({
      title: 'Delete Status',
      message: 'Are you sure you want to delete this status?',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Delete Status',
        callbackFunction: doDeleteStatus
      }
    })
  }

  function openEditStatusModal(clickEvent: Event): void {
    clickEvent.preventDefault()

    let editStatusCloseModalFunction: () => void

    const index = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).dataset.index ?? '-1',
      10
    )

    // eslint-disable-next-line security/detect-object-injection
    const statusObject = statusList[index]

    function doSubmit(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${pts.urlPrefix}/tickets/doUpdateStatus`,
        formEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as { success: boolean }
          if (responseJSON.success) {
            editStatusCloseModalFunction()
            getStatusesFunction()
          }
        }
      )
    }

    function statusKeyChangeFunction(changeEvent: Event): void {
      const statusKeyObject = pts.getTicketStatus(
        (changeEvent.currentTarget as HTMLSelectElement).value
      )

      const statusFieldInputElement = document.querySelector(
        '#editStatus--statusField'
      ) as HTMLInputElement
      statusFieldInputElement.value = ''

      const statusFieldFieldElement = statusFieldInputElement.closest(
        '.field'
      ) as HTMLElement

      if (statusKeyObject?.statusField) {
        ;(
          statusFieldFieldElement.querySelector('label') as HTMLLabelElement
        ).textContent = statusKeyObject.statusField.fieldLabel
        statusFieldFieldElement.classList.remove('is-hidden')
      } else {
        statusFieldFieldElement.classList.add('is-hidden')
      }

      const statusField2InputElement = document.querySelector(
        '#editStatus--statusField2'
      ) as HTMLInputElement
      statusField2InputElement.value = ''

      const statusField2FieldElement = statusField2InputElement.closest(
        '.field'
      ) as HTMLElement

      if (statusKeyObject?.statusField2) {
        ;(
          statusField2FieldElement.querySelector('label') as HTMLLabelElement
        ).textContent = statusKeyObject.statusField2.fieldLabel
        statusField2FieldElement.classList.remove('is-hidden')
      } else {
        statusField2FieldElement.classList.add('is-hidden')
      }
    }

    cityssm.openHtmlModal('ticket-editStatus', {
      onshow(modalElement) {
        ;(
          document.querySelector('#editStatus--ticketId') as HTMLInputElement
        ).value = ticketId
        ;(
          document.querySelector('#editStatus--statusIndex') as HTMLInputElement
        ).value = (statusObject.statusIndex as number).toString()
        ;(
          document.querySelector('#editStatus--statusField') as HTMLInputElement
        ).value = statusObject.statusField ?? ''
        ;(
          document.querySelector(
            '#editStatus--statusField2'
          ) as HTMLInputElement
        ).value = statusObject.statusField2 ?? ''
        ;(
          document.querySelector(
            '#editStatus--statusNote'
          ) as HTMLTextAreaElement
        ).value = statusObject.statusNote ?? ''

        const statusDateElement = document.querySelector(
          '#editStatus--statusDateString'
        ) as HTMLInputElement
        statusDateElement.value = statusObject.statusDateString ?? ''
        statusDateElement.setAttribute('max', cityssm.dateToString(new Date()))
        ;(
          document.querySelector(
            '#editStatus--statusTimeString'
          ) as HTMLInputElement
        ).value = statusObject.statusTimeString ?? ''

        pts.getDefaultConfigProperty(
          'parkingTicketStatuses',
          (parkingTicketStatuses: ConfigParkingTicketStatus[]) => {
            let statusKeyFound = false

            const statusKeyElement = document.querySelector(
              '#editStatus--statusKey'
            ) as HTMLSelectElement

            for (const statusKeyObject of parkingTicketStatuses) {
              if (
                statusKeyObject.isUserSettable ||
                statusKeyObject.statusKey === statusObject.statusKey
              ) {
                statusKeyElement.insertAdjacentHTML(
                  'beforeend',
                  `<option value="${statusKeyObject.statusKey}">${statusKeyObject.status}</option>`
                )

                if (statusKeyObject.statusKey === statusObject.statusKey) {
                  statusKeyFound = true

                  if (statusKeyObject.statusField) {
                    const fieldElement = document
                      .querySelector('#editStatus--statusField')
                      ?.closest('.field') as HTMLElement

                    ;(
                      fieldElement.querySelector('label') as HTMLLabelElement
                    ).textContent = statusKeyObject.statusField.fieldLabel
                    fieldElement.classList.remove('is-hidden')
                  }

                  if (statusKeyObject.statusField2) {
                    const fieldElement = document
                      .querySelector('#editStatus--statusField2')
                      ?.closest('.field') as HTMLElement

                    ;(
                      fieldElement.querySelector('label') as HTMLLabelElement
                    ).textContent = statusKeyObject.statusField2.fieldLabel
                    fieldElement.classList.remove('is-hidden')
                  }
                }
              }
            }

            if (!statusKeyFound) {
              statusKeyElement.insertAdjacentHTML(
                'beforeend',
                `<option value="${statusObject.statusKey}">${statusObject.statusKey}</option>`
              )
            }

            statusKeyElement.value = statusObject.statusKey ?? ''

            statusKeyElement.addEventListener('change', statusKeyChangeFunction)
          }
        )

        modalElement.querySelector('form')?.addEventListener('submit', doSubmit)
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        editStatusCloseModalFunction = closeModalFunction
        ;(
          modalElement.querySelector(
            '#editStatus--statusKey'
          ) as HTMLSelectElement
        ).focus()
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function populateStatusesPanelFunction(): void {
    clearStatusPanelFunction()

    if (statusList.length === 0) {
      statusPanelElement.insertAdjacentHTML(
        'beforeend',
        `<div class="panel-block is-block">
          <div class="message is-info">
          <p class="message-body">There are no statuses associated with this ticket.</p>
          </div>
          </div>`
      )

      return
    }

    // Loop through statuses
    for (const statusObject of statusList) {
      const statusDefinitionObject = pts.getTicketStatus(
        statusObject.statusKey ?? ''
      )

      const panelBlockElement = document.createElement('div')
      panelBlockElement.className = 'panel-block is-block'

      panelBlockElement.innerHTML = `<div class="columns">
        <div class="column">
        <div class="level mb-1">
          <div class="level-left">
          <strong>
          ${
            statusDefinitionObject
              ? statusDefinitionObject.status
              : statusObject.statusKey
          }
          </strong>
          </div>
          <div class="level-right">
            ${statusObject.statusDateString}
          </div>
        </div>
        ${
          !statusObject.statusField || statusObject.statusField === ''
            ? ''
            : `<p class="is-size-7">
                <strong>${
                  statusDefinitionObject?.statusField
                    ? statusDefinitionObject.statusField.fieldLabel
                    : ''
                }:</strong> ${statusObject.statusField}</p>`
        }
        ${
          !statusObject.statusField2 || statusObject.statusField2 === ''
            ? ''
            : `<p class="is-size-7">
                <strong>
                ${
                  statusDefinitionObject?.statusField2
                    ? statusDefinitionObject.statusField2.fieldLabel
                    : ''
                }:</strong> ${statusObject.statusField2}
                </p>`
        }
        <p class="has-newline-chars is-size-7">
          ${statusObject.statusNote}
        </p>
        </div>
        </div>`

      statusPanelElement.append(panelBlockElement)
    }

    // Initialize edit and delete buttons (if applicable)
    const firstStatusObject = statusList[0]

    if (firstStatusObject.canUpdate) {
      const firstStatusColumnsElement = statusPanelElement
        .querySelector('.panel-block')
        ?.querySelector('.columns') as HTMLElement

      firstStatusColumnsElement.insertAdjacentHTML(
        'beforeend',
        `<div class="column is-narrow">
          <div class="buttons is-right has-addons">
            <button class="button is-small is-edit-status-button" data-tooltip="Edit Status" data-index="0" type="button">
              <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
              <span>Edit</span>
            </button>
            <button class="button is-small has-text-danger is-delete-status-button" data-tooltip="Delete Status" data-status-index="${firstStatusObject.statusIndex.toString()}" type="button">
              <i class="fas fa-trash" aria-hidden="true"></i>
              <span class="sr-only">Delete</span>
            </button>
          </div>
          </div>`
      )

      firstStatusColumnsElement
        .querySelector('.is-edit-status-button')
        ?.addEventListener('click', openEditStatusModal)

      firstStatusColumnsElement
        .querySelector('.is-delete-status-button')
        ?.addEventListener('click', confirmDeleteStatusFunction)
    }

    // Add finalize button
    const firstStatusDefinitionObject = pts.getTicketStatus(
      firstStatusObject.statusKey
    )

    if (firstStatusDefinitionObject?.isFinalStatus) {
      const finalizePanelBlockElement = document.createElement('div')
      finalizePanelBlockElement.className = 'panel-block is-block'

      finalizePanelBlockElement.innerHTML = `<div class="message is-info is-clearfix">
        <div class="message-body">
          <div class="columns">
            <div class="column">
              <strong>This ticket is able to be marked as resolved.</strong>
            </div>
            <div class="column is-narrow has-text-right align-self-flex-end">
              <button class="button is-info" data-cy="resolve" type="button">
                <span class="icon is-small"><i class="fas fa-check" aria-hidden="true"></i></span>
                <span>Resolve Ticket</span>
              </button>
            </div>
          </div>
        </div>
        </div>`

      finalizePanelBlockElement
        .querySelector('button')
        ?.addEventListener('click', confirmResolveTicketFunction)

      statusPanelElement.prepend(finalizePanelBlockElement)
    }
  }

  function getStatusesFunction(): void {
    clearStatusPanelFunction()

    statusPanelElement.insertAdjacentHTML(
      'beforeend',
      `<div class="panel-block is-block">
        <p class="has-text-centered has-text-grey-lighter">
          <i class="fas fa-2x fa-circle-notch fa-spin" aria-hidden="true"></i><br />
          <em>Loading statuses...</em>
        </p>
        </div>`
    )

    cityssm.postJSON(
      `${pts.urlPrefix}/tickets/doGetStatuses`,
      {
        ticketId
      },
      (rawResponseJSON) => {
        const responseStatusList =
          rawResponseJSON as unknown as ParkingTicketStatusLog[]
        statusList = responseStatusList
        populateStatusesPanelFunction()
      }
    )
  }

  document
    .querySelector('#is-add-status-button')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      let addStatusCloseModalFunction: () => void

      function submitFunction(formEvent: Event): void {
        formEvent.preventDefault()

        const resolveTicket = (
          document.querySelector(
            '#addStatus--resolveTicket'
          ) as HTMLInputElement
        ).checked

        cityssm.postJSON(
          `${pts.urlPrefix}/tickets/doAddStatus`,
          formEvent.currentTarget,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as { success: boolean }
            if (responseJSON.success) {
              addStatusCloseModalFunction()

              if (resolveTicket) {
                window.location.href = `${pts.urlPrefix}/tickets/${ticketId}`
              } else {
                getStatusesFunction()
              }
            }
          }
        )
      }

      function statusKeyChangeFunction(changeEvent: Event): void {
        const statusObject = pts.getTicketStatus(
          (changeEvent.currentTarget as HTMLInputElement).value
        )

        const statusFieldInputElement = document.querySelector(
          '#addStatus--statusField'
        ) as HTMLInputElement
        statusFieldInputElement.value = ''

        const statusFieldFieldElement = statusFieldInputElement.closest(
          '.field'
        ) as HTMLElement

        if (statusObject?.statusField) {
          ;(
            statusFieldFieldElement.querySelector('label') as HTMLLabelElement
          ).textContent = statusObject.statusField.fieldLabel
          statusFieldFieldElement.classList.remove('is-hidden')
        } else {
          statusFieldFieldElement.classList.add('is-hidden')
        }

        const statusField2InputElement = document.querySelector(
          '#addStatus--statusField2'
        ) as HTMLInputElement
        statusField2InputElement.value = ''

        const statusField2FieldElement = statusField2InputElement.closest(
          '.field'
        ) as HTMLElement

        if (statusObject?.statusField2) {
          ;(
            statusField2FieldElement.querySelector('label') as HTMLLabelElement
          ).textContent = statusObject.statusField2.fieldLabel
          statusField2FieldElement.classList.remove('is-hidden')
        } else {
          statusField2FieldElement.classList.add('is-hidden')
        }

        const resolveTicketElement = document.querySelector(
          '#addStatus--resolveTicket'
        ) as HTMLInputElement
        resolveTicketElement.checked = false

        if (statusObject?.isFinalStatus) {
          resolveTicketElement.closest('.field')?.classList.remove('is-hidden')
        } else {
          resolveTicketElement.closest('.field')?.classList.add('is-hidden')
        }
      }

      cityssm.openHtmlModal('ticket-addStatus', {
        onshow(modalElement) {
          ;(
            document.querySelector('#addStatus--ticketId') as HTMLInputElement
          ).value = ticketId

          pts.getDefaultConfigProperty(
            'parkingTicketStatuses',
            (parkingTicketStatuses) => {
              const statusKeyElement = document.querySelector(
                '#addStatus--statusKey'
              ) as HTMLSelectElement

              for (const statusObject of parkingTicketStatuses as ConfigParkingTicketStatus[]) {
                if (statusObject.isUserSettable) {
                  statusKeyElement.insertAdjacentHTML(
                    'beforeend',
                    `<option value="${statusObject.statusKey}">${statusObject.status}</option>`
                  )
                }
              }

              statusKeyElement.addEventListener(
                'change',
                statusKeyChangeFunction
              )
            }
          )

          modalElement
            .querySelector('form')
            ?.addEventListener('submit', submitFunction)
        },
        onshown(modalElement, closeModalFunction) {
          bulmaJS.toggleHtmlClipped()
          addStatusCloseModalFunction = closeModalFunction
          ;(
            modalElement.querySelector(
              '#addStatus--statusKey'
            ) as HTMLSelectElement
          ).focus()
        },
        onremoved() {
          bulmaJS.toggleHtmlClipped()
          ;(
            document.querySelector('#is-add-status-button') as HTMLButtonElement
          ).focus()
        }
      })
    })

  document
    .querySelector('#is-add-paid-status-button')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      let addPaidStatusCloseModalFunction: () => void

      function submitFunction(formEvent: Event): void {
        formEvent.preventDefault()

        const resolveTicket = (
          document.querySelector(
            '#addPaidStatus--resolveTicket'
          ) as HTMLInputElement
        ).checked

        cityssm.postJSON(
          `${pts.urlPrefix}/tickets/doAddStatus`,
          formEvent.currentTarget,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as { success: boolean }
            if (responseJSON.success) {
              addPaidStatusCloseModalFunction()

              if (resolveTicket) {
                window.location.href = `${pts.urlPrefix}/tickets/${ticketId}`
              } else {
                getStatusesFunction()
              }
            }
          }
        )
      }

      cityssm.openHtmlModal('ticket-addStatusPaid', {
        onshow(modalElement) {
          ;(
            document.querySelector(
              '#addPaidStatus--ticketId'
            ) as HTMLInputElement
          ).value = ticketId

          // Set amount

          const statusFieldElement = document.querySelector(
            '#addPaidStatus--statusField'
          ) as HTMLInputElement

          const offenceAmount = (
            document.querySelector('#ticket--offenceAmount') as HTMLInputElement
          ).value

          const issueDateString = (
            document.querySelector(
              '#ticket--issueDateString'
            ) as HTMLInputElement
          ).value

          const discountDays = (
            document.querySelector('#ticket--discountDays') as HTMLInputElement
          ).value

          if (issueDateString === '' || discountDays === '') {
            statusFieldElement.value = offenceAmount
          } else {
            const currentDateString = cityssm.dateToString(new Date())

            const dateDifference = cityssm.dateStringDifferenceInDays(
              issueDateString,
              currentDateString
            )

            statusFieldElement.value =
              dateDifference <= Number.parseInt(discountDays, 10)
                ? (
                    document.querySelector(
                      '#ticket--discountOffenceAmount'
                    ) as HTMLInputElement
                  ).value
                : offenceAmount
          }

          modalElement
            .querySelector('form')
            ?.addEventListener('submit', submitFunction)
        },
        onshown(modalElement, closeModalFunction) {
          bulmaJS.toggleHtmlClipped()
          addPaidStatusCloseModalFunction = closeModalFunction
          ;(
            modalElement.querySelector(
              '#addPaidStatus--statusField2'
            ) as HTMLInputElement
          ).focus()
        },
        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    })

  pts.loadDefaultConfigProperties(populateStatusesPanelFunction)
})()
