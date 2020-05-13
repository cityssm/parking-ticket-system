"use strict";

(function() {

  const ticketFilterEle = document.getElementById("filter--parkingTicket");

  const convictableTicketsContainerEle = document.getElementById("is-convictable-tickets-container");

  let batchID;

  let convictableTickets = pts.convictableTicketsInit;
  delete pts.convictableTicketsInit;

  let displayedTicketIDs = [];

  function addTicketToBatchByTicketID(clickEvent) {

    clickEvent.preventDefault();

    const ticketID = clickEvent.currentTarget.getAttribute("data-ticket-id");

    cityssm.postJSON("/tickets/doAddTicketToConvictionBatch", {
      batchID: batchID,
      ticketID: ticketID
    }, function(resultJSON) {

    });
  }

  function addAllTicketsToBatch(clickEvent) {

    clickEvent.preventDefault();

    cityssm.postJSON("/tickets/doAddAllTicketsToConvictionBatch", {
      batchID: batchID,
      ticketIDs: displayedTicketIDs
    }, function(resultJSON) {

    });

  }

  function renderConvictableTickets() {

    cityssm.clearElement(convictableTicketsContainerEle);
    displayedTicketIDs = [];

    if (convictableTickets.length === 0) {

      convictableTicketsContainerEle.innerHTML = "<div class=\"message is-info\">" +
        "<div class=\"message-body\">There are no parking tickets currently eligible for conviction.</div>" +
        "</div>";

      return;

    }

    const ticketFilter = ticketFilterEle.value.trim().toLowerCase();

    const tbodyEle = document.createElement("tbody");

    for (let index = 0; index < convictableTickets.length; index += 1) {

      const ticket = convictableTickets[index];

      if (ticket.ticketNumber.toLowerCase().indexOf(ticketFilter) === -1 &&
        ticket.licencePlateNumber.toLowerCase().indexOf(ticketFilter) === -1) {

        continue;

      }

      displayedTicketIDs.push(ticket.ticketID);

      const trEle = document.createElement("tr");

      trEle.innerHTML =
        ("<td>" +
          "<a data-tooltip=\"View Ticket (Opens in New Window)\" href=\"/tickets/" + ticket.ticketID + "\" target=\"_blank\">" +
          cityssm.escapeHTML(ticket.ticketNumber) +
          "</a>" +
          "</td>") +
        ("<td>" +
          "<span class=\"licence-plate-number is-size-6\">" +
          cityssm.escapeHTML(ticket.licencePlateNumber) +
          "</span><br />" +
          "<span class=\"has-tooltip-right is-size-7\" data-tooltip=\"Primary Owner\">" +
          cityssm.escapeHTML(ticket.ownerName1) +
          "</span>" +
          "</td>") +
        "<td>" + ticket.issueDateString + "</td>" +

        ("<td class=\"has-text-right\">" +
          "<button class=\"button is-small\" data-ticket-id=\"" + ticket.ticketID + "\" type=\"button\">" +
          "<span class=\"icon is-small\"><i class=\"fas fa-plus\" aria-hidden=\"true\"></i></span>" +
          "<span>Add</span>" +
          "</button>" +
          "</td>");

      trEle.getElementsByTagName("button")[0].addEventListener("click", addTicketToBatchByTicketID);

      tbodyEle.appendChild(trEle);

    }

    if (displayedTicketIDs.length === 0) {

      convictableTicketsContainerEle.innerHTML = "<div class=\"message is-info\">" +
        "<div class=\"message-body\">There are no parking tickets that meet the search criteria.</div>" +
        "</div>";

      return;

    }

    const addAllButtonEle = document.createElement("button");
    addAllButtonEle.className = "button is-fullwidth has-margin-bottom-10";

    addAllButtonEle.innerHTML = "<span class=\"icon is-small\"><i class=\"fas fa-plus\" aria-hidden=\"true\"></i></span>" +
      "<span>Add " + displayedTicketIDs.length + " Parking Ticket" + (displayedTicketIDs.length === 1 ? "" : "s") + "</span>";

    addAllButtonEle.addEventListener("click", addAllTicketsToBatch);

    convictableTicketsContainerEle.appendChild(addAllButtonEle);

    const tableEle = document.createElement("table");
    tableEle.className = "table is-striped is-hoverable is-fullwidth";

    tableEle.innerHTML = "<thead><tr>" +
      "<th>Ticket Number</th>" +
      "<th>Licence Plate</th>" +
      "<th>Issue Date</th>" +
      "<th></th>" +
      "</tr></thead>";

    tableEle.appendChild(tbodyEle);

    convictableTicketsContainerEle.appendChild(tableEle);


  }

  renderConvictableTickets();

  ticketFilterEle.addEventListener("keyup", renderConvictableTickets);

  // Batch

  document.getElementById("is-select-batch-button").addEventListener("click", function(clickEvent) {

    clickEvent.preventDefault();

    let selectBatchCloseModalFn;

    const shownFn = function(modalEle, closeModalFn) {

      selectBatchCloseModalFn = closeModalFn;
      
    };

    cityssm.openHtmlModal("mto-selectBatch", {
      onShown: shownFn
    });

  });

}());
