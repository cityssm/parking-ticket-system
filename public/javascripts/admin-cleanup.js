"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const recordDelete_timeMillis = exports.recordDelete_timeMillis;
    delete exports.recordDelete_timeMillis;
    const purgeTableFn = (clickEvent) => {
        clickEvent.preventDefault();
        const buttonEle = clickEvent.currentTarget;
        buttonEle.setAttribute("disabled", "disabled");
        const table = buttonEle.getAttribute("data-table");
        const purgeFn = () => {
            cityssm.postJSON("/admin/doCleanupTable", {
                table,
                recordDelete_timeMillis
            }, (responseJSON) => {
                if (responseJSON.success) {
                    cityssm.alertModal("Table Purged Successfully", "", "OK", "success");
                    buttonEle.closest("td").innerHTML = "<span class=\"has-text-grey\">Records Purged</span>";
                }
                else {
                    buttonEle.removeAttribute("disabled");
                }
            });
        };
        cityssm.confirmModal("Purge Table?", "Are you sure you want to purge the deleted records in this table? This cannot be undone.", "Yes, Delete the Records", "warning", purgeFn);
    };
    const purgeButtonEles = document.getElementsByClassName("is-purge-button");
    for (const purgeButtonEle of purgeButtonEles) {
        purgeButtonEle.addEventListener("click", purgeTableFn);
    }
})();
