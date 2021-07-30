"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const recordDelete_timeMillis = exports.recordDelete_timeMillis;
    delete exports.recordDelete_timeMillis;
    const purgeTableFunction = (clickEvent) => {
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        buttonElement.setAttribute("disabled", "disabled");
        const table = buttonElement.getAttribute("data-table");
        const purgeFunction = () => {
            cityssm.postJSON("/admin/doCleanupTable", {
                table,
                recordDelete_timeMillis
            }, (responseJSON) => {
                if (responseJSON.success) {
                    cityssm.alertModal("Table Purged Successfully", "", "OK", "success");
                    buttonElement.closest("td").innerHTML = "<span class=\"has-text-grey\">Records Purged</span>";
                }
                else {
                    buttonElement.removeAttribute("disabled");
                }
            });
        };
        cityssm.confirmModal("Purge Table?", "Are you sure you want to purge the deleted records in this table? This cannot be undone.", "Yes, Delete the Records", "warning", purgeFunction);
    };
    const purgeButtonElements = document.querySelectorAll(".is-purge-button");
    for (const purgeButtonElement of purgeButtonElements) {
        purgeButtonElement.addEventListener("click", purgeTableFunction);
    }
})();