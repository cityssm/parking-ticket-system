/* eslint-disable unicorn/filename-case, unicorn/prefer-module */

import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types'
import type { ptsGlobal } from '../types/publicTypes'
import type * as configTypes from '../types/configTypes'
import type * as recordTypes from '../types/recordTypes'

declare const cityssm: cityssmGlobal
declare const pts: ptsGlobal

;(() => {
  const ticketID = cityssm.escapeHTML(
    (document.querySelector('#ticket--ticketID') as HTMLInputElement).value
  )

  const statusPanelElement = document.querySelector(
    '#is-status-panel'
  ) as HTMLElement

  let statusList =
    exports.ticketStatusLog as recordTypes.ParkingTicketStatusLog[]
  delete exports.ticketStatusLog

  const clearStatusPanelFunction = () => {
    const panelBlockElements =
      statusPanelElement.querySelectorAll('.panel-block')

    for (const panelBlockElement of panelBlockElements) {
      panelBlockElement.remove()
    }
  }

  const confirmResolveTicketFunction = (clickEvent: Event) => {
    clickEvent.preventDefault()

    cityssm.confirmModal(
      'Mark Ticket as Resolved?',
      'Once resolved, you will no longer be able to make changes to the ticket.',
      'Yes, Resolve Ticket',
      'info',
      () => {
        cityssm.postJSON(
          '/tickets/doResolveTicket',
          {
            ticketID
          },
          (responseJSON: { success: boolean }) => {
            if (responseJSON.success) {
              window.location.href = '/tickets/' + ticketID
            }
          }
        )
      }
    )
  }

  const confirmDeleteStatusFunction = (clickEvent: Event) => {
    const statusIndex = (clickEvent.currentTarget as HTMLButtonElement).dataset
      .statusIndex

    cityssm.confirmModal(
      'Delete Remark?',
      'Are you sure you want to delete this status?',
      'Yes, Delete',
      'warning',
      () => {
        cityssm.postJSON(
          '/tickets/doDeleteStatus',
          {
            ticketID,
            statusIndex
          },
          (responseJSON: { success: boolean }) => {
            if (responseJSON.success) {
              getStatusesFunction()
            }
          }
        )
      }
    )
  }

  const openEditStatusModalFunction = (clickEvent: Event) => {
    clickEvent.preventDefault()

    let editStatusCloseModalFunction: () => void

    const index = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).dataset.index,
      10
    )

    const statusObject = statusList[index]

    const submitFunction = (formEvent: Event) => {
      formEvent.preventDefault()

      cityssm.postJSON(
        '/tickets/doUpdateStatus',
        formEvent.currentTarget,
        (responseJSON: { success: boolean }) => {
          if (responseJSON.success) {
            editStatusCloseModalFunction()
            getStatusesFunction()
          }
        }
      )
    }

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const statusKeyChangeFunction = (changeEvent: Event) => {
      const statusKeyObject = pts.getTicketStatus(
        (changeEvent.currentTarget as HTMLSelectElement).value
      )

      const statusFieldElement = document.querySelector(
        '#editStatus--statusField'
      ) as HTMLInputElement
      statusFieldElement.value = ''

      if (statusKeyObject?.statusField) {
        const fieldElement = statusFieldElement.closest('.field')
        fieldElement.querySelector('label').textContent =
          statusKeyObject.statusField.fieldLabel
        fieldElement.classList.remove('is-hidden')
      } else {
        statusFieldElement.closest('.field').classList.add('is-hidden')
      }

      const statusField2Element = document.querySelector(
        '#editStatus--statusField2'
      ) as HTMLInputElement
      statusField2Element.value = ''

      if (statusKeyObject?.statusField2) {
        const fieldElement = statusField2Element.closest('.field')
        fieldElement.querySelector('label').textContent =
          statusKeyObject.statusField2.fieldLabel
        fieldElement.classList.remove('is-hidden')
      } else {
        statusFieldElement.closest('.field').classList.add('is-hidden')
      }
    }

    cityssm.openHtmlModal('ticket-editStatus', {
      onshow(modalElement) {
        ;(
          document.querySelector('#editStatus--ticketID') as HTMLInputElement
        ).value = ticketID

        ;(
          document.querySelector('#editStatus--statusIndex') as HTMLInputElement
        ).value = statusObject.statusIndex.toString()

        ;(
          document.querySelector('#editStatus--statusField') as HTMLInputElement
        ).value = statusObject.statusField
        ;(
          document.querySelector(
            '#editStatus--statusField2'
          ) as HTMLInputElement
        ).value = statusObject.statusField2
        ;(
          document.querySelector(
            '#editStatus--statusNote'
          ) as HTMLTextAreaElement
        ).value = statusObject.statusNote

        const statusDateElement = document.querySelector(
          '#editStatus--statusDateString'
        ) as HTMLInputElement
        statusDateElement.value = statusObject.statusDateString
        statusDateElement.setAttribute('max', cityssm.dateToString(new Date()))

        ;(
          document.querySelector(
            '#editStatus--statusTimeString'
          ) as HTMLInputElement
        ).value = statusObject.statusTimeString

        pts.getDefaultConfigProperty(
          'parkingTicketStatuses',
          (parkingTicketStatuses: configTypes.ConfigParkingTicketStatus[]) => {
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
                  '<option value="' +
                    statusKeyObject.statusKey +
                    '">' +
                    statusKeyObject.status +
                    '</option>'
                )

                if (statusKeyObject.statusKey === statusObject.statusKey) {
                  statusKeyFound = true

                  if (statusKeyObject.statusField) {
                    const fieldElement = document
                      .querySelector('#editStatus--statusField')
                      .closest('.field')
                    fieldElement.querySelector('label').textContent =
                      statusKeyObject.statusField.fieldLabel
                    fieldElement.classList.remove('is-hidden')
                  }

                  if (statusKeyObject.statusField2) {
                    const fieldElement = document
                      .querySelector('#editStatus--statusField2')
                      .closest('.field')
                    fieldElement.querySelector('label').textContent =
                      statusKeyObject.statusField2.fieldLabel
                    fieldElement.classList.remove('is-hidden')
                  }
                }
              }
            }

            if (!statusKeyFound) {
              statusKeyElement.insertAdjacentHTML(
                'beforeend',
                '<option value="' +
                  statusObject.statusKey +
                  '">' +
                  statusObject.statusKey +
                  '</option>'
              )
            }

            statusKeyElement.value = statusObject.statusKey

            statusKeyElement.addEventListener('change', statusKeyChangeFunction)
          }
        )

        modalElement
          .querySelector('form')
          .addEventListener('submit', submitFunction)
      },
      onshown(_modalElement, closeModalFunction) {
        editStatusCloseModalFunction = closeModalFunction
      }
    })
  }

  const populateStatusesPanelFunction = () => {
    clearStatusPanelFunction()

    if (statusList.length === 0) {
      statusPanelElement.insertAdjacentHTML(
        'beforeend',
        '<div class="panel-block is-block">' +
          '<div class="message is-info">' +
          '<p class="message-body">' +
          'There are no statuses associated with this ticket.' +
          '</p>' +
          '</div>' +
          '</div>'
      )

      return
    }

    // Loop through statuses

    for (const statusObject of statusList) {
      const statusDefinitionObject = pts.getTicketStatus(statusObject.statusKey)

      const panelBlockElement = document.createElement('div')
      panelBlockElement.className = 'panel-block is-block'

      panelBlockElement.innerHTML =
        '<div class="columns">' +
        ('<div class="column">' +
          ('<div class="level mb-1">' +
            '<div class="level-left">' +
            '<strong>' +
            (statusDefinitionObject
              ? statusDefinitionObject.status
              : statusObject.statusKey) +
            '</strong>' +
            '</div>' +
            '<div class="level-right">' +
            statusObject.statusDateString +
            '</div>' +
            '</div>') +
          (!statusObject.statusField || statusObject.statusField === ''
            ? ''
            : '<p class="is-size-7">' +
              '<strong>' +
              (statusDefinitionObject?.statusField
                ? statusDefinitionObject.statusField.fieldLabel
                : '') +
              ':</strong> ' +
              statusObject.statusField +
              '</p>') +
          (!statusObject.statusField2 || statusObject.statusField2 === ''
            ? ''
            : '<p class="is-size-7">' +
              '<strong>' +
              (statusDefinitionObject?.statusField2
                ? statusDefinitionObject.statusField2.fieldLabel
                : '') +
              ':</strong> ' +
              statusObject.statusField2 +
              '</p>') +
          '<p class="has-newline-chars is-size-7">' +
          statusObject.statusNote +
          '</p>' +
          '</div>') +
        '</div>'

      statusPanelElement.append(panelBlockElement)
    }

    // Initialize edit and delete buttons (if applicable)

    const firstStatusObject = statusList[0]

    if (firstStatusObject.canUpdate) {
      const firstStatusColumnsElement = statusPanelElement
        .querySelector('.panel-block')
        .querySelector('.columns')

      firstStatusColumnsElement.insertAdjacentHTML(
        'beforeend',
        '<div class="column is-narrow">' +
          '<div class="buttons is-right has-addons">' +
          ('<button class="button is-small is-edit-status-button"' +
            ' data-tooltip="Edit Status" data-index="0" type="button">' +
            '<span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>' +
            ' <span>Edit</span>' +
            '</button>') +
          ('<button class="button is-small has-text-danger is-delete-status-button" data-tooltip="Delete Status"' +
            ' data-status-index="' +
            firstStatusObject.statusIndex.toString() +
            '" type="button">' +
            '<i class="fas fa-trash" aria-hidden="true"></i>' +
            '<span class="sr-only">Delete</span>' +
            '</button>') +
          '</div>' +
          '</div>'
      )

      firstStatusColumnsElement
        .querySelector('.is-edit-status-button')
        .addEventListener('click', openEditStatusModalFunction)

      firstStatusColumnsElement
        .querySelector('.is-delete-status-button')
        .addEventListener('click', confirmDeleteStatusFunction)
    }

    // Add finalize button

    const firstStatusDefinitionObject = pts.getTicketStatus(
      firstStatusObject.statusKey
    )

    if (firstStatusDefinitionObject?.isFinalStatus) {
      const finalizePanelBlockElement = document.createElement('div')
      finalizePanelBlockElement.className = 'panel-block is-block'

      finalizePanelBlockElement.innerHTML =
        '<div class="message is-info is-clearfix">' +
        '<div class="message-body">' +
        '<div class="columns">' +
        '<div class="column">' +
        '<strong>This ticket is able to be marked as resolved.</strong>' +
        '</div>' +
        '<div class="column is-narrow has-text-right align-self-flex-end">' +
        '<button class="button is-info" data-cy="resolve" type="button">' +
        '<span class="icon is-small"><i class="fas fa-check" aria-hidden="true"></i></span>' +
        '<span>Resolve Ticket</span>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'

      finalizePanelBlockElement
        .querySelector('button')
        .addEventListener('click', confirmResolveTicketFunction)

      statusPanelElement.prepend(finalizePanelBlockElement)
    }
  }

  const getStatusesFunction = () => {
    clearStatusPanelFunction()

    statusPanelElement.insertAdjacentHTML(
      'beforeend',
      '<div class="panel-block is-block">' +
        '<p class="has-text-centered has-text-grey-lighter">' +
        '<i class="fas fa-2x fa-circle-notch fa-spin" aria-hidden="true"></i><br />' +
        '<em>Loading statuses...' +
        '</p>' +
        '</div>'
    )

    cityssm.postJSON(
      '/tickets/doGetStatuses',
      {
        ticketID
      },
      (responseStatusList: recordTypes.ParkingTicketStatusLog[]) => {
        statusList = responseStatusList
        populateStatusesPanelFunction()
      }
    )
  }

  document
    .querySelector('#is-add-status-button')
    .addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      let addStatusCloseModalFunction: () => void

      const submitFunction = (formEvent: Event) => {
        formEvent.preventDefault()

        const resolveTicket = (
          document.querySelector(
            '#addStatus--resolveTicket'
          ) as HTMLInputElement
        ).checked

        cityssm.postJSON(
          '/tickets/doAddStatus',
          formEvent.currentTarget,
          (responseJSON: { success: boolean }) => {
            if (responseJSON.success) {
              addStatusCloseModalFunction()

              if (resolveTicket) {
                window.location.href = '/tickets/' + ticketID
              } else {
                getStatusesFunction()
              }
            }
          }
        )
      }

      // eslint-disable-next-line unicorn/consistent-function-scoping
      const statusKeyChangeFunction = (changeEvent: Event) => {
        const statusObject = pts.getTicketStatus(
          (changeEvent.currentTarget as HTMLInputElement).value
        )

        const statusFieldElement = document.querySelector(
          '#addStatus--statusField'
        ) as HTMLInputElement
        statusFieldElement.value = ''

        if (statusObject?.statusField) {
          const fieldElement = statusFieldElement.closest('.field')
          fieldElement.querySelector('label').textContent =
            statusObject.statusField.fieldLabel
          fieldElement.classList.remove('is-hidden')
        } else {
          statusFieldElement.closest('.field').classList.add('is-hidden')
        }

        const statusField2Element = document.querySelector(
          '#addStatus--statusField2'
        ) as HTMLInputElement
        statusField2Element.value = ''

        if (statusObject?.statusField2) {
          const fieldElement = statusField2Element.closest('.field')
          fieldElement.querySelector('label').textContent =
            statusObject.statusField2.fieldLabel
          fieldElement.classList.remove('is-hidden')
        } else {
          statusField2Element.closest('.field').classList.add('is-hidden')
        }

        const resolveTicketElement = document.querySelector(
          '#addStatus--resolveTicket'
        ) as HTMLInputElement
        resolveTicketElement.checked = false

        if (statusObject?.isFinalStatus) {
          resolveTicketElement.closest('.field').classList.remove('is-hidden')
        } else {
          resolveTicketElement.closest('.field').classList.add('is-hidden')
        }
      }

      cityssm.openHtmlModal('ticket-addStatus', {
        onshow(modalElement) {
          ;(
            document.querySelector('#addStatus--ticketID') as HTMLInputElement
          ).value = ticketID

          pts.getDefaultConfigProperty(
            'parkingTicketStatuses',
            (
              parkingTicketStatuses: configTypes.ConfigParkingTicketStatus[]
            ) => {
              const statusKeyElement = document.querySelector(
                '#addStatus--statusKey'
              )

              for (const statusObject of parkingTicketStatuses) {
                if (statusObject.isUserSettable) {
                  statusKeyElement.insertAdjacentHTML(
                    'beforeend',
                    '<option value="' +
                      statusObject.statusKey +
                      '">' +
                      statusObject.status +
                      '</option>'
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
            .addEventListener('submit', submitFunction)
        },
        onshown(_modalElement, closeModalFunction) {
          addStatusCloseModalFunction = closeModalFunction
        }
      })
    })

  document
    .querySelector('#is-add-paid-status-button')
    .addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      let addPaidStatusCloseModalFunction: () => void

      const submitFunction = (formEvent: Event) => {
        formEvent.preventDefault()

        const resolveTicket = (
          document.querySelector(
            '#addPaidStatus--resolveTicket'
          ) as HTMLInputElement
        ).checked

        cityssm.postJSON(
          '/tickets/doAddStatus',
          formEvent.currentTarget,
          (responseJSON: { success: boolean }) => {
            if (responseJSON.success) {
              addPaidStatusCloseModalFunction()

              if (resolveTicket) {
                window.location.href = '/tickets/' + ticketID
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
              '#addPaidStatus--ticketID'
            ) as HTMLInputElement
          ).value = ticketID

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
            .addEventListener('submit', submitFunction)
        },
        onshown(_modalElement, closeModalFunction) {
          addPaidStatusCloseModalFunction = closeModalFunction
        }
      })
    })

  pts.loadDefaultConfigProperties(populateStatusesPanelFunction)
})()
