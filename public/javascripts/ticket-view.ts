import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/types";
declare const cityssm: cityssmGlobal;


(function() {

  const unresolveTicketButtonEle = document.getElementById("is-unresolve-ticket-button");

  if (unresolveTicketButtonEle) {

    unresolveTicketButtonEle.addEventListener("click", function(clickEvent) {

      clickEvent.preventDefault();

      const ticketID = (<HTMLButtonElement>clickEvent.currentTarget).getAttribute("data-ticket-id");

      cityssm.confirmModal(
        "Remove Resolved Status?",
        "Are you sure you want to remove the resolved status from this ticket?",
        "Yes, Mark as Unresolved",
        "warning",
        function() {

          cityssm.postJSON("/tickets/doUnresolveTicket", {
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
