"use strict";

(function() {

  const unresolveTicketButtonEle = document.getElementById("is-unresolve-ticket-button");

  if (unresolveTicketButtonEle) {

    unresolveTicketButtonEle.addEventListener("click", function(clickEvent) {

      clickEvent.preventDefault();

      const ticketID = clickEvent.currentTarget.getAttribute("data-ticket-id");

      pts.confirmModal(
        "Remove Resolved Status?",
        "Are you sure you want to remove the resolved status from this ticket?",
        "Yes, Mark as Unresolved",
        "warning",
        function() {

          pts.postJSON("/tickets/doUnresolveTicket", {
            ticketID: ticketID
          }, function(responseJSON) {

            if (responseJSON.success) {

              window.location.reload(true);

            }

          });

        }
      );

    });

  }

}());
