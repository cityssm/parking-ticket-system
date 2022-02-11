/* eslint-disable unicorn/filename-case, unicorn/prefer-module */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { BulmaJS } from "@cityssm/bulma-js/types";

declare const cityssm: cityssmGlobal;
declare const bulmaJS: BulmaJS;


(() => {

  const recordDelete_timeMillis: number = exports.recordDelete_timeMillis;
  delete exports.recordDelete_timeMillis;

  const purgeTableFunction = (clickEvent: Event) => {

    clickEvent.preventDefault();

    const buttonElement = clickEvent.currentTarget as HTMLButtonElement;
    buttonElement.setAttribute("disabled", "disabled");

    const table = buttonElement.dataset.table;

    const purgeFunction = () => {

      cityssm.postJSON("/admin/doCleanupTable", {
        table,
        recordDelete_timeMillis
      },
        (responseJSON: { success: true }) => {

          if (responseJSON.success) {

            cityssm.alertModal("Table Purged Successfully",
              "",
              "OK",
              "success");

            buttonElement.closest("td").innerHTML = "<span class=\"has-text-grey\">Records Purged</span>";

          } else {
            buttonElement.removeAttribute("disabled");
          }
        });
    };

    bulmaJS.confirm({
      title: "Purge Table?",
      message: "Are you sure you want to purge the deleted records in this table? This cannot be undone.",
      contextualColorName: "warning",
      okButton: {
        text: "Yes, Delete the Records",
        callbackFunction: purgeFunction
      },
      cancelButton: {
        callbackFunction: () => {
          buttonElement.removeAttribute("disabled");
        }
      }
    });

  };

  const purgeButtonElements = document.querySelectorAll(".is-purge-button") as NodeListOf<HTMLButtonElement>;

  for (const purgeButtonElement of purgeButtonElements) {
    purgeButtonElement.addEventListener("click", purgeTableFunction);
  }
})();
