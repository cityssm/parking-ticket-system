/* eslint-disable unicorn/filename-case, eslint-comments/disable-enable-pair */
/* eslint-disable unicorn/prefer-module */

// eslint-disable-next-line n/no-missing-import
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { ptsGlobal } from '../../types/publicTypes.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const pts: ptsGlobal
;(() => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const recordDelete_timeMillis: number = exports.recordDelete_timeMillis
  delete exports.recordDelete_timeMillis

  function purgeTableFunction(clickEvent: Event): void {
    clickEvent.preventDefault()

    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    buttonElement.setAttribute('disabled', 'disabled')

    const table = buttonElement.dataset.table

    function purgeFunction(): void {
      cityssm.postJSON(
        `${pts.urlPrefix}/admin/doCleanupTable`,
        {
          table,
          recordDelete_timeMillis
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as { success: true }

          if (responseJSON.success) {
            cityssm.alertModal('Table Purged Successfully', '', 'OK', 'success')
            ;(buttonElement.closest('td') as HTMLElement).innerHTML =
              '<span class="has-text-grey">Records Purged</span>'
          } else {
            buttonElement.removeAttribute('disabled')
          }
        }
      )
    }

    bulmaJS.confirm({
      title: 'Purge Table?',
      message:
        'Are you sure you want to purge the deleted records in this table? This cannot be undone.',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Delete the Records',
        callbackFunction: purgeFunction
      },
      cancelButton: {
        callbackFunction: () => {
          buttonElement.removeAttribute('disabled')
        }
      }
    })
  }

  const purgeButtonElements = document.querySelectorAll('.is-purge-button')

  for (const purgeButtonElement of purgeButtonElements) {
    purgeButtonElement.addEventListener('click', purgeTableFunction)
  }
})()
