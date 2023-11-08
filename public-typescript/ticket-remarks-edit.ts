/* eslint-disable unicorn/filename-case, unicorn/prefer-module, eslint-comments/disable-enable-pair */

import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type * as recordTypes from '../types/recordTypes.js'

declare const cityssm: cityssmGlobal
;(() => {
  const ticketId = (
    document.querySelector('#ticket--ticketId') as HTMLInputElement
  ).value

  const remarkPanelElement = document.querySelector(
    '#is-remark-panel'
  ) as HTMLElement

  let remarkList: recordTypes.ParkingTicketRemark[] = exports.ticketRemarks
  delete exports.ticketRemarks

  function clearRemarkPanel(): void {
    const panelBlockElements =
      remarkPanelElement.querySelectorAll('.panel-block')

    for (const panelBlockElement of panelBlockElements) {
      panelBlockElement.remove()
    }
  }

  function confirmDeleteRemark(clickEvent: Event): void {
    const remarkIndex = (clickEvent.currentTarget as HTMLAnchorElement).dataset
      .remarkIndex

    cityssm.confirmModal(
      'Delete Remark?',
      'Are you sure you want to delete this remark?',
      'Yes, Delete',
      'warning',
      () => {
        cityssm.postJSON(
          '/tickets/doDeleteRemark',
          {
            ticketId,
            remarkIndex
          },
          (resultJSON: { success: boolean }) => {
            if (resultJSON.success) {
              getRemarks()
            }
          }
        )
      }
    )
  }

  function openEditRemarkModal(clickEvent: Event): void {
    clickEvent.preventDefault()

    let editRemarkCloseModalFunction: () => void

    const index = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).dataset.index,
      10
    )

    const remarkObject = remarkList[index]

    function doSubmit(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        '/tickets/doUpdateRemark',
        formEvent.currentTarget,
        (responseJSON: { success: boolean }) => {
          if (responseJSON.success) {
            editRemarkCloseModalFunction()
            getRemarks()
          }
        }
      )
    }

    cityssm.openHtmlModal('ticket-editRemark', {
      onshow(modalElement) {
        ;(
          document.querySelector('#editRemark--ticketId') as HTMLInputElement
        ).value = ticketId
        ;(
          document.querySelector('#editRemark--remarkIndex') as HTMLInputElement
        ).value = remarkObject.remarkIndex.toString()
        ;(
          document.querySelector('#editRemark--remark') as HTMLInputElement
        ).value = remarkObject.remark
        ;(
          document.querySelector(
            '#editRemark--remarkDateString'
          ) as HTMLInputElement
        ).value = remarkObject.remarkDateString
        ;(
          document.querySelector(
            '#editRemark--remarkTimeString'
          ) as HTMLInputElement
        ).value = remarkObject.remarkTimeString

        modalElement.querySelector('form')?.addEventListener('submit', doSubmit)
      },
      onshown(_modalElement, closeModalFunction) {
        editRemarkCloseModalFunction = closeModalFunction
      }
    })
  }

  const populateRemarksPanelFunction = () => {
    clearRemarkPanel()

    if (remarkList.length === 0) {
      remarkPanelElement.insertAdjacentHTML(
        'beforeend',
        '<div class="panel-block is-block">' +
          '<div class="message is-info">' +
          '<p class="message-body">' +
          'There are no remarks associated with this ticket.' +
          '</p>' +
          '</div>' +
          '</div>'
      )

      return
    }

    for (const [index, remarkObject] of remarkList.entries()) {
      const panelBlockElement = document.createElement('div')
      panelBlockElement.className = 'panel-block is-block'

      panelBlockElement.innerHTML =
        '<div class="columns">' +
        ('<div class="column">' +
          '<p class="has-newline-chars">' +
          cityssm.escapeHTML(remarkObject.remark) +
          '</p>' +
          '<p class="is-size-7">' +
          (remarkObject.recordCreate_timeMillis ===
          remarkObject.recordUpdate_timeMillis
            ? ''
            : '<i class="fas fa-pencil-alt" aria-hidden="true"></i> ') +
          remarkObject.recordUpdate_userName +
          ' - ' +
          remarkObject.remarkDateString +
          ' ' +
          remarkObject.remarkTimeString +
          '</p>' +
          '</div>') +
        (remarkObject.canUpdate
          ? '<div class="column is-narrow">' +
            '<div class="buttons is-right has-addons">' +
            ('<button class="button is-small is-edit-remark-button"' +
              ' data-cy="edit-remark"' +
              ' data-tooltip="Edit Remark" data-index="' +
              index.toString() +
              '" type="button">' +
              '<span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>' +
              ' <span>Edit</span>' +
              '</button>') +
            ('<button class="button is-small has-text-danger is-delete-remark-button"' +
              ' data-cy="delete-remark"' +
              ' data-tooltip="Delete Remark"' +
              ' data-remark-index="' +
              remarkObject.remarkIndex.toString() +
              '" type="button">' +
              '<i class="fas fa-trash" aria-hidden="true"></i>' +
              '<span class="sr-only">Delete</span>' +
              '</button>') +
            '</div>' +
            '</div>'
          : '') +
        '</div>'

      if (remarkObject.canUpdate) {
        panelBlockElement
          .querySelector('.is-edit-remark-button')
          ?.addEventListener('click', openEditRemarkModal)

        panelBlockElement
          .querySelector('.is-delete-remark-button')
          ?.addEventListener('click', confirmDeleteRemark)
      }

      remarkPanelElement.append(panelBlockElement)
    }
  }

  function getRemarks(): void {
    clearRemarkPanel()

    remarkPanelElement.insertAdjacentHTML(
      'beforeend',
      `<div class="panel-block is-block">
        <p class="has-text-centered has-text-grey-lighter">
        <i class="fas fa-2x fa-circle-notch fa-spin" aria-hidden="true"></i><br />
        <em>Loading remarks...</em>
        </p>
        </div>`
    )

    cityssm.postJSON(
      '/tickets/doGetRemarks',
      {
        ticketId
      },
      (responseRemarkList: recordTypes.ParkingTicketRemark[]) => {
        remarkList = responseRemarkList
        populateRemarksPanelFunction()
      }
    )
  }

  document
    .querySelector('#is-add-remark-button')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      let addRemarkCloseModalFunction: () => void

      const submitFunction = (formEvent: Event) => {
        formEvent.preventDefault()

        cityssm.postJSON(
          '/tickets/doAddRemark',
          formEvent.currentTarget,
          (responseJSON: { success: boolean }) => {
            if (responseJSON.success) {
              addRemarkCloseModalFunction()
              getRemarks()
            }
          }
        )
      }

      cityssm.openHtmlModal('ticket-addRemark', {
        onshow(modalElement) {
          ;(
            document.querySelector('#addRemark--ticketId') as HTMLInputElement
          ).value = ticketId

          modalElement
            .querySelector('form')
            ?.addEventListener('submit', submitFunction)
        },
        onshown(_modalElement, closeModalFunction) {
          addRemarkCloseModalFunction = closeModalFunction
        }
      })
    })

  populateRemarksPanelFunction()
})()
