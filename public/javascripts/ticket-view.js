"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    const unresolveTicketButtonEle = document.getElementById("is-unresolve-ticket-button");
    if (unresolveTicketButtonEle) {
        unresolveTicketButtonEle.addEventListener("click", function (clickEvent) {
            clickEvent.preventDefault();
            const ticketID = clickEvent.currentTarget.getAttribute("data-ticket-id");
            cityssm.confirmModal("Remove Resolved Status?", "Are you sure you want to remove the resolved status from this ticket?", "Yes, Mark as Unresolved", "warning", function () {
                cityssm.postJSON("/tickets/doUnresolveTicket", {
                    ticketID
                }, function (responseJSON) {
                    if (responseJSON.success) {
                        window.location.reload(true);
                    }
                });
            });
        });
    }
    const restoreTicketButtonEle = document.getElementById("is-restore-ticket-button");
    if (restoreTicketButtonEle) {
        restoreTicketButtonEle.addEventListener("click", function (clickEvent) {
            clickEvent.preventDefault();
            const ticketID = clickEvent.currentTarget.getAttribute("data-ticket-id");
            cityssm.confirmModal("Restore Ticket?", "Are you sure you want to restore this parking ticket?", "Yes, Restore the Ticket", "warning", function () {
                cityssm.postJSON("/tickets/doRestoreTicket", {
                    ticketID
                }, function (responseJSON) {
                    if (responseJSON.success) {
                        window.location.reload(true);
                    }
                });
            });
        });
    }
}());
