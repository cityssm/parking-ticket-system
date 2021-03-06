"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const unresolveTicketButtonEle = document.getElementById("is-unresolve-ticket-button");
    if (unresolveTicketButtonEle) {
        unresolveTicketButtonEle.addEventListener("click", (clickEvent) => {
            clickEvent.preventDefault();
            const ticketID = clickEvent.currentTarget.getAttribute("data-ticket-id");
            cityssm.confirmModal("Remove Resolved Status?", "Are you sure you want to remove the resolved status from this ticket?", "Yes, Mark as Unresolved", "warning", () => {
                cityssm.postJSON("/tickets/doUnresolveTicket", {
                    ticketID
                }, (responseJSON) => {
                    if (responseJSON.success) {
                        window.location.reload();
                    }
                });
            });
        });
    }
    const restoreTicketButtonEle = document.getElementById("is-restore-ticket-button");
    if (restoreTicketButtonEle) {
        restoreTicketButtonEle.addEventListener("click", (clickEvent) => {
            clickEvent.preventDefault();
            const ticketID = clickEvent.currentTarget.getAttribute("data-ticket-id");
            cityssm.confirmModal("Restore Ticket?", "Are you sure you want to restore this parking ticket?", "Yes, Restore the Ticket", "warning", () => {
                cityssm.postJSON("/tickets/doRestoreTicket", {
                    ticketID
                }, (responseJSON) => {
                    if (responseJSON.success) {
                        window.location.reload();
                    }
                });
            });
        });
    }
})();
