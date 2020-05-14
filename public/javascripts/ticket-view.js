"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var unresolveTicketButtonEle = document.getElementById("is-unresolve-ticket-button");
    if (unresolveTicketButtonEle) {
        unresolveTicketButtonEle.addEventListener("click", function (clickEvent) {
            clickEvent.preventDefault();
            var ticketID = clickEvent.currentTarget.getAttribute("data-ticket-id");
            cityssm.confirmModal("Remove Resolved Status?", "Are you sure you want to remove the resolved status from this ticket?", "Yes, Mark as Unresolved", "warning", function () {
                cityssm.postJSON("/tickets/doUnresolveTicket", {
                    ticketID: ticketID
                }, function (responseJSON) {
                    if (responseJSON.success) {
                        window.location.reload(true);
                    }
                });
            });
        });
    }
}());
