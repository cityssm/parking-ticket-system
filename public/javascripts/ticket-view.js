"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
(() => {
    document
        .querySelector('#is-unresolve-ticket-button')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        const ticketId = clickEvent.currentTarget.dataset
            .ticketId;
        function doUnresolve() {
            cityssm.postJSON('/tickets/doUnresolveTicket', {
                ticketId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    window.location.reload();
                }
            });
        }
        bulmaJS.confirm({
            title: 'Remove Resolved Status',
            message: 'Are you sure you want to remove the resolved status from this ticket?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Mark as Unresolved',
                callbackFunction: doUnresolve
            }
        });
    });
    document
        .querySelector('#is-restore-ticket-button')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        const ticketId = clickEvent.currentTarget.dataset
            .ticketId;
        function doRestore() {
            cityssm.postJSON('/tickets/doRestoreTicket', {
                ticketId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    window.location.reload();
                }
            });
        }
        bulmaJS.confirm({
            title: 'Restore Ticket',
            message: 'Are you sure you want to restore this parking ticket?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Restore the Ticket',
                callbackFunction: doRestore
            }
        });
    });
})();
