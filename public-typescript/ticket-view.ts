/* eslint-disable unicorn/filename-case */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;


(() => {

  const unresolveTicketButtonElement = document.querySelector("#is-unresolve-ticket-button");

  if (unresolveTicketButtonElement) {

    unresolveTicketButtonElement.addEventListener("click", (clickEvent) => {

      clickEvent.preventDefault();

      const ticketID = (clickEvent.currentTarget as HTMLButtonElement).getAttribute("data-ticket-id");

      cityssm.confirmModal(
        "Remove Resolved Status?",
        "Are you sure you want to remove the resolved status from this ticket?",
        "Yes, Mark as Unresolved",
        "warning",
        () => {

          cityssm.postJSON("/tickets/doUnresolveTicket", {
            ticketID
          },
            (responseJSON: { success: boolean }) => {

              if (responseJSON.success) {
                window.location.reload();
              }
            });
        }
      );

    });

  }

  const restoreTicketButtonElement = document.querySelector("#is-restore-ticket-button");

  if (restoreTicketButtonElement) {

    restoreTicketButtonElement.addEventListener("click", (clickEvent) => {

      clickEvent.preventDefault();

      const ticketID = (clickEvent.currentTarget as HTMLButtonElement).getAttribute("data-ticket-id");

      cityssm.confirmModal(
        "Restore Ticket?",
        "Are you sure you want to restore this parking ticket?",
        "Yes, Restore the Ticket",
        "warning",
        () => {

          cityssm.postJSON("/tickets/doRestoreTicket", {
            ticketID
          },
            (responseJSON: { success: boolean }) => {

              if (responseJSON.success) {
                window.location.reload();
              }
            });
        }
      );
    });
  }
})();
