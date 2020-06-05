"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var recordDelete_timeMillis = exports.recordDelete_timeMillis;
    delete exports.recordDelete_timeMillis;
    function purgeTable(clickEvent) {
        clickEvent.preventDefault();
        var buttonEle = clickEvent.currentTarget;
        buttonEle.setAttribute("disabled", "disabled");
        var table = buttonEle.getAttribute("data-table");
        var purgeFn = function () {
            cityssm.postJSON("/admin/doCleanupTable", {
                table: table,
                recordDelete_timeMillis: recordDelete_timeMillis
            }, function (responseJSON) {
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
    }
    var purgeButtonEles = document.getElementsByClassName("is-purge-button");
    for (var buttonIndex = 0; buttonIndex < purgeButtonEles.length; buttonIndex += 1) {
        purgeButtonEles[buttonIndex].addEventListener("click", purgeTable);
    }
}());
