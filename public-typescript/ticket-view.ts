/* eslint-disable unicorn/filename-case, eslint-comments/disable-enable-pair */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal

interface SuccessResponse {
  success: boolean
}

// eslint-disable-next-line no-extra-semi
;(() => {
  document
    .querySelector('#is-unresolve-ticket-button')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      const ticketID = (clickEvent.currentTarget as HTMLButtonElement).dataset
        .ticketId

      function doUnresolve(): void {
        cityssm.postJSON(
          '/tickets/doUnresolveTicket',
          {
            ticketID
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as unknown as SuccessResponse
            if (responseJSON.success) {
              window.location.reload()
            }
          }
        )
      }

      bulmaJS.confirm({
        title: 'Remove Resolved Status',
        message:
          'Are you sure you want to remove the resolved status from this ticket?',
        contextualColorName: 'warning',
        okButton: {
          text: 'Yes, Mark as Unresolved',
          callbackFunction: doUnresolve
        }
      })
    })

  document
    .querySelector('#is-restore-ticket-button')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      const ticketID = (clickEvent.currentTarget as HTMLButtonElement).dataset
        .ticketId

      function doRestore(): void {
        cityssm.postJSON(
          '/tickets/doRestoreTicket',
          {
            ticketID
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as unknown as SuccessResponse
            if (responseJSON.success) {
              window.location.reload()
            }
          }
        )
      }

      bulmaJS.confirm({
        title: 'Restore Ticket',
        message: 'Are you sure you want to restore this parking ticket?',
        contextualColorName: 'warning',
        okButton: {
          text: 'Yes, Restore the Ticket',
          callbackFunction: doRestore
        }
      })
    })
})()
