"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var canUpdate = document.getElementsByTagName("main")[0].getAttribute("data-can-update") === "true";
    var ticketFilterEle = document.getElementById("filter--parkingTicket");
    var convictableTicketsContainerEle = document.getElementById("is-convictable-tickets-container");
    var currentBatch = exports.currentBatch;
    delete exports.currentBatch;
    var convictableTickets = exports.convictableTickets;
    delete exports.convictableTickets;
    var displayedTicketIDs = [];
    function addTicketToBatchByTicketID(clickEvent) {
        clickEvent.preventDefault();
        var ticketID = clickEvent.currentTarget.getAttribute("data-ticket-id");
        cityssm.postJSON("/tickets/doAddTicketToConvictionBatch", {
            batchID: currentBatch.batchID,
            ticketID: ticketID
        }, function (resultJSON) {
        });
    }
    function addAllTicketsToBatch(clickEvent) {
        clickEvent.preventDefault();
        cityssm.postJSON("/tickets/doAddAllTicketsToConvictionBatch", {
            batchID: currentBatch.batchID,
            ticketIDs: displayedTicketIDs
        }, function (resultJSON) {
        });
    }
    function renderConvictableTickets() {
        cityssm.clearElement(convictableTicketsContainerEle);
        displayedTicketIDs = [];
        if (currentBatch === null) {
            convictableTicketsContainerEle.innerHTML = "<div class=\"message is-warning\">" +
                "<div class=\"message-body\">Select a target batch to get started.</div>" +
                "</div>";
            return;
        }
        if (convictableTickets.length === 0) {
            convictableTicketsContainerEle.innerHTML = "<div class=\"message is-info\">" +
                "<div class=\"message-body\">There are no parking tickets currently eligible for conviction.</div>" +
                "</div>";
            return;
        }
        var ticketFilter = ticketFilterEle.value.trim().toLowerCase();
        var tbodyEle = document.createElement("tbody");
        for (var index = 0; index < convictableTickets.length; index += 1) {
            var ticket = convictableTickets[index];
            if (ticket.ticketNumber.toLowerCase().indexOf(ticketFilter) === -1 &&
                ticket.licencePlateNumber.toLowerCase().indexOf(ticketFilter) === -1) {
                continue;
            }
            displayedTicketIDs.push(ticket.ticketID);
            var trEle = document.createElement("tr");
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
                        cityssm.escapeHTML(ticket.licencePlateOwner_ownerName1) +
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
        var addAllButtonEle = document.createElement("button");
        addAllButtonEle.className = "button is-fullwidth has-margin-bottom-10";
        addAllButtonEle.innerHTML = "<span class=\"icon is-small\"><i class=\"fas fa-plus\" aria-hidden=\"true\"></i></span>" +
            "<span>Add " + displayedTicketIDs.length + " Parking Ticket" + (displayedTicketIDs.length === 1 ? "" : "s") + "</span>";
        addAllButtonEle.addEventListener("click", addAllTicketsToBatch);
        convictableTicketsContainerEle.appendChild(addAllButtonEle);
        var tableEle = document.createElement("table");
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
    function renderCurrentBatch() {
        document.getElementById("batchSelector--batchID").innerText = "Batch #" + currentBatch.batchID;
    }
    function confirmCreateBatch() {
        var createFn = function () {
            cityssm.postJSON("/tickets/doCreateConvictionBatch", {}, function (responseJSON) {
                if (responseJSON.success) {
                    currentBatch = responseJSON.batch;
                    renderCurrentBatch();
                }
            });
        };
        cityssm.confirmModal("Create a New Batch", "Are you sure you want to create a new conviction batch?", "Yes, Create Batch", "info", createFn);
    }
    document.getElementById("is-select-batch-button").addEventListener("click", function (clickEvent) {
        clickEvent.preventDefault();
        var selectBatchCloseModalFn;
        var selectFn = function (clickEvent) {
            clickEvent.preventDefault();
            var batchID = clickEvent.currentTarget.getAttribute("data-batch-id");
            cityssm.postJSON("/tickets/doGetConvictionBatch", {
                batchID: batchID
            }, function (batchObj) {
                currentBatch = batchObj;
                renderCurrentBatch();
            });
            selectBatchCloseModalFn();
        };
        cityssm.openHtmlModal("mto-selectBatch", {
            onshow: function (modalEle) {
                if (canUpdate) {
                    var createButtonEle = modalEle.getElementsByClassName("is-create-batch-button")[0];
                    createButtonEle.classList.remove("is-hidden");
                    createButtonEle.addEventListener("click", function (clickEvent) {
                        clickEvent.preventDefault();
                        selectBatchCloseModalFn();
                        confirmCreateBatch();
                    });
                }
                cityssm.postJSON("/tickets/doGetRecentConvictionBatches", [], function (batchList) {
                    var resultsContainerEle = modalEle.getElementsByClassName("is-results-container")[0];
                    cityssm.clearElement(resultsContainerEle);
                    if (batchList.length === 0) {
                        resultsContainerEle.className = "message is-info";
                        resultsContainerEle.innerHTML = "<div class=\"message-body\">There are no recent conviction batches.</div>";
                        return;
                    }
                    resultsContainerEle.className = "list is-hoverable";
                    for (var index = 0; index < batchList.length; index += 1) {
                        var batch = batchList[index];
                        var batchListItemEle = document.createElement("a");
                        batchListItemEle.className = "list-item";
                        batchListItemEle.setAttribute("data-batch-id", batch.batchID.toString());
                        batchListItemEle.href = "#";
                        batchListItemEle.innerHTML = "<div class=\"columns\">" +
                            "<div class=\"column is-narrow\">#" + batch.batchID + "</div>" +
                            "<div class=\"column has-text-right\">" +
                            batch.batchDateString +
                            (batch.lockDate ?
                                "<br /><div class=\"tags justify-flex-end\">" +
                                    "<span class=\"tag\">" +
                                    "<span class=\"icon is-small\"><i class=\"fas fa-lock\" aria-hidden=\"true\"></i></span><span>Locked</span></span>" :
                                "") +
                            "</div>" +
                            "</div>";
                        batchListItemEle.addEventListener("click", selectFn);
                        resultsContainerEle.appendChild(batchListItemEle);
                    }
                });
            },
            onshown: function (_modalEle, closeModalFn) {
                selectBatchCloseModalFn = closeModalFn;
            }
        });
    });
    if (currentBatch) {
        renderCurrentBatch();
    }
}());
