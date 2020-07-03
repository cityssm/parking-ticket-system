import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;


(() => {

  const recordDelete_timeMillis: number = exports.recordDelete_timeMillis;
  delete exports.recordDelete_timeMillis;

  const purgeTableFn = (clickEvent: Event) => {

    clickEvent.preventDefault();

    const buttonEle = clickEvent.currentTarget as HTMLButtonElement;
    buttonEle.setAttribute("disabled", "disabled");

    const table = buttonEle.getAttribute("data-table");

    const purgeFn = () => {

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

            buttonEle.closest("td").innerHTML = "<span class=\"has-text-grey\">Records Purged</span>";

          } else {
            buttonEle.removeAttribute("disabled");
          }
        });
    };

    cityssm.confirmModal("Purge Table?",
      "Are you sure you want to purge the deleted records in this table? This cannot be undone.",
      "Yes, Delete the Records",
      "warning",
      purgeFn);
  };

  const purgeButtonEles = document.getElementsByClassName("is-purge-button") as HTMLCollectionOf<HTMLButtonElement>;

  for (const purgeButtonEle of purgeButtonEles) {
    purgeButtonEle.addEventListener("click", purgeTableFn);
  }
})();
