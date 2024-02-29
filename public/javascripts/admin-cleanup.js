"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const recordDelete_timeMillis = exports.recordDelete_timeMillis;
    delete exports.recordDelete_timeMillis;
    function purgeTableFunction(clickEvent) {
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        buttonElement.setAttribute('disabled', 'disabled');
        const table = buttonElement.dataset.table;
        function purgeFunction() {
            cityssm.postJSON('/admin/doCleanupTable', {
                table,
                recordDelete_timeMillis
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    cityssm.alertModal('Table Purged Successfully', '', 'OK', 'success');
                    buttonElement.closest('td').innerHTML =
                        '<span class="has-text-grey">Records Purged</span>';
                }
                else {
                    buttonElement.removeAttribute('disabled');
                }
            });
        }
        bulmaJS.confirm({
            title: 'Purge Table?',
            message: 'Are you sure you want to purge the deleted records in this table? This cannot be undone.',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete the Records',
                callbackFunction: purgeFunction
            },
            cancelButton: {
                callbackFunction: () => {
                    buttonElement.removeAttribute('disabled');
                }
            }
        });
    }
    const purgeButtonElements = document.querySelectorAll('.is-purge-button');
    for (const purgeButtonElement of purgeButtonElements) {
        purgeButtonElement.addEventListener('click', purgeTableFunction);
    }
})();
