"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var canUpdate = document.getElementsByTagName("main")[0].getAttribute("data-can-update") === "true";
    var currentBatch = exports.currentBatch;
    delete exports.currentBatch;
    var convictableTickets = exports.convictableTickets;
    delete exports.convictableTickets;
    var ticketFilterEle = document.getElementById("filter--parkingTicket");
    var convictableTicketsContainerEle = document.getElementById("convictable-tickets-container");
    var displayedTicketIDs = [];
    function addTicketToBatchByIndex(clickEvent) {
        clickEvent.preventDefault();
        var buttonEle = clickEvent.currentTarget;
        buttonEle.setAttribute("disabled", "disabled");
        var index = parseInt(buttonEle.getAttribute("data-index"));
        var ticketID = convictableTickets[index].ticketID;
        cityssm.postJSON("/tickets/doAddTicketToConvictionBatch", {
            batchID: currentBatch.batchID,
            ticketID: ticketID
        }, function (resultJSON) {
            if (resultJSON.success) {
                currentBatch = resultJSON.batch;
                renderCurrentBatch();
                convictableTickets.splice(index, 1);
                renderConvictableTickets();
            }
            else {
                buttonEle.removeAttribute("disabled");
            }
        });
    }
    function addAllTicketsToBatch(clickEvent) {
        clickEvent.preventDefault();
        var loadingCloseModalFn;
        var addFn = function () {
            cityssm.postJSON("/tickets-ontario/doAddAllTicketsToConvictionBatch", {
                batchID: currentBatch.batchID,
                ticketIDs: displayedTicketIDs
            }, function (responseJSON) {
                loadingCloseModalFn();
                if (responseJSON.batch) {
                    currentBatch = responseJSON.batch;
                    renderCurrentBatch();
                }
                if (responseJSON.tickets) {
                    convictableTickets = responseJSON.tickets;
                    renderConvictableTickets();
                }
                if (responseJSON.successCount === 0) {
                    cityssm.alertModal("Results", responseJSON.message ? responseJSON.message : "No tickets were added to the batch.", "OK", "warning");
                }
            });
        };
        cityssm.openHtmlModal("loading", {
            onshow: function () {
                document.getElementById("is-loading-modal-message").innerText =
                    "Adding " +
                        displayedTicketIDs.length +
                        " ticket" + (displayedTicketIDs.length === 1 ? "" : "s") + "...";
            },
            onshown: function (_modalEle, closeModalFn) {
                loadingCloseModalFn = closeModalFn;
                addFn();
            }
        });
    }
    function renderConvictableTickets() {
        cityssm.clearElement(convictableTicketsContainerEle);
        displayedTicketIDs = [];
        if (!currentBatch) {
            convictableTicketsContainerEle.innerHTML = "<div class=\"message is-warning\">" +
                "<div class=\"message-body\">Select a target batch to get started.</div>" +
                "</div>";
            return;
        }
        if (!canUpdate) {
            convictableTicketsContainerEle.innerHTML = "<div class=\"message is-warning\">" +
                "<div class=\"message-body\">Parking tickets can only be added by users with update permissions.</div>" +
                "</div>";
            return;
        }
        if (currentBatch.lockDate) {
            convictableTicketsContainerEle.innerHTML = "<div class=\"message is-warning\">" +
                "<div class=\"message-body\">The target batch is locked and cannot accept additional tickets.</div>" +
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
                    "<td>" + ticket.issueDateString + "</td>" +
                    ("<td>" +
                        "<span class=\"licence-plate-number is-size-6\">" +
                        cityssm.escapeHTML(ticket.licencePlateNumber) +
                        "</span><br />" +
                        "<span class=\"has-tooltip-right is-size-7\" data-tooltip=\"Primary Owner\">" +
                        cityssm.escapeHTML(ticket.licencePlateOwner_ownerName1) +
                        "</span>" +
                        "</td>") +
                    ("<td class=\"has-text-right\">" +
                        "<button class=\"button is-small\" data-index=\"" + index + "\" type=\"button\">" +
                        "<span class=\"icon is-small\"><i class=\"fas fa-plus\" aria-hidden=\"true\"></i></span>" +
                        "<span>Add</span>" +
                        "</button>" +
                        "</td>");
            trEle.getElementsByTagName("button")[0].addEventListener("click", addTicketToBatchByIndex);
            tbodyEle.appendChild(trEle);
        }
        if (displayedTicketIDs.length === 0) {
            convictableTicketsContainerEle.innerHTML = "<div class=\"message is-info\">" +
                "<div class=\"message-body\">There are no parking tickets that meet the search criteria.</div>" +
                "</div>";
            return;
        }
        var addAllButtonEle = document.createElement("button");
        addAllButtonEle.className = "button is-fullwidth mb-3";
        addAllButtonEle.innerHTML = "<span class=\"icon is-small\"><i class=\"fas fa-plus\" aria-hidden=\"true\"></i></span>" +
            "<span>Add " + displayedTicketIDs.length + " Parking Ticket" + (displayedTicketIDs.length === 1 ? "" : "s") + "</span>";
        addAllButtonEle.addEventListener("click", addAllTicketsToBatch);
        convictableTicketsContainerEle.appendChild(addAllButtonEle);
        var tableEle = document.createElement("table");
        tableEle.className = "table is-striped is-hoverable is-fullwidth";
        tableEle.innerHTML = "<thead><tr>" +
            "<th>Ticket Number</th>" +
            "<th>Issue Date</th>" +
            "<th>Licence Plate</th>" +
            "<th></th>" +
            "</tr></thead>";
        tableEle.appendChild(tbodyEle);
        convictableTicketsContainerEle.appendChild(tableEle);
    }
    ticketFilterEle.addEventListener("keyup", renderConvictableTickets);
    var batchEntriesContainerEle = document.getElementById("batch-entries-container");
    function removeTicketFromBatchByIndex(clickEvent) {
        clickEvent.preventDefault();
        var buttonEle = clickEvent.currentTarget;
        buttonEle.setAttribute("disabled", "disabled");
        var index = parseInt(buttonEle.getAttribute("data-index"));
        var ticketID = currentBatch.batchEntries[index].ticketID;
        cityssm.postJSON("/tickets-ontario/doRemoveTicketFromConvictionBatch", {
            batchID: currentBatch.batchID,
            ticketID: ticketID
        }, function (resultJSON) {
            if (resultJSON.success) {
                currentBatch.batchEntries.splice(index, 1);
                renderCurrentBatch();
                convictableTickets = resultJSON.tickets;
                renderConvictableTickets();
            }
            else {
                buttonEle.removeAttribute("disabled");
            }
        });
    }
    function clearBatch(clickEvent) {
        clickEvent.preventDefault();
        var clearFn = function () {
            cityssm.postJSON("/tickets-ontario/doClearConvictionBatch", {
                batchID: currentBatch.batchID
            }, function (responseJSON) {
                if (!responseJSON.success) {
                    cityssm.alertModal("Batch Not Cleared", responseJSON.message, "OK", "danger");
                }
                if (responseJSON.batch) {
                    currentBatch = responseJSON.batch;
                    renderCurrentBatch();
                }
                if (responseJSON.tickets) {
                    convictableTickets = responseJSON.tickets;
                    renderConvictableTickets();
                }
            });
        };
        cityssm.confirmModal("Clear Batch", "Are you sure you want to remove all the parking tickets from the batch?", "Yes, Clear the Batch", "warning", clearFn);
    }
    function lockBatch(clickEvent) {
        clickEvent.preventDefault();
        var lockFn = function () {
            cityssm.postJSON("/tickets/doLockConvictionBatch", {
                batchID: currentBatch.batchID
            }, function (responseJSON) {
                if (responseJSON.success) {
                    currentBatch.lockDate = responseJSON.lockDate;
                    currentBatch.lockDateString = responseJSON.lockDateString;
                    renderCurrentBatch();
                    renderConvictableTickets();
                }
            });
        };
        cityssm.confirmModal("Lock Batch?", "<strong>Are you sure you want to lock this batch?</strong><br />" +
            "Once locked, no further changes to the batch will be allowed.  The option to download the batch will become available.", "Yes, Lock the Batch", "warning", lockFn);
    }
    function unlockBatch(clickEvent) {
        clickEvent.preventDefault();
        var lockFn = function () {
            cityssm.postJSON("/tickets/doUnlockConvictionBatch", {
                batchID: currentBatch.batchID
            }, function (responseJSON) {
                if (responseJSON.success) {
                    currentBatch.lockDate = null;
                    currentBatch.lockDateString = null;
                    renderCurrentBatch();
                    renderConvictableTickets();
                }
            });
        };
        cityssm.confirmModal("Lock Batch?", "<strong>Are you sure you want to unlock this batch?</strong><br />" +
            "Once unlocked, changes to the batch will be allowed.", "Yes, Unlock the Batch", "warning", lockFn);
    }
    function downloadBatch(clickEvent) {
        clickEvent.preventDefault();
        var downloadFn = function () {
            window.open("/tickets-ontario/convict/" + currentBatch.batchID);
        };
        if (!currentBatch.sentDate) {
            cityssm.confirmModal("Download Batch", "<strong>You are about to download the batch for the first time.</strong><br />" +
                "Once downloaded, the date will be tracked, and the batch will no longer be able to be unlocked.", "Yes, Download the Batch", "warning", function () {
                downloadFn();
                var rightNow = new Date();
                currentBatch.sentDateString = cityssm.dateToString(rightNow);
                currentBatch.sentDate = parseInt(currentBatch.sentDateString.replace(/-/g, ""));
                renderCurrentBatch();
            });
        }
        else {
            downloadFn();
        }
    }
    function renderCurrentBatch() {
        document.getElementById("batchSelector--batchID").innerText = "Batch #" + currentBatch.batchID;
        document.getElementById("batchSelector--batchDetails").innerHTML =
            ("<span class=\"has-tooltip-left\" data-tooltip=\"Batch Date\">" +
                "<span class=\"icon\"><i class=\"fas fa-star\" aria-hidden=\"true\"></i></span> " +
                currentBatch.batchDateString +
                "</span>") +
                (currentBatch.lockDate ?
                    "<br /><span class=\"has-tooltip-left\" data-tooltip=\"Lock Date\">" +
                        "<span class=\"icon\"><i class=\"fas fa-lock\" aria-hidden=\"true\"></i></span> " +
                        currentBatch.lockDateString +
                        "</span>" : "");
        cityssm.clearElement(batchEntriesContainerEle);
        if (currentBatch.batchEntries.length === 0) {
            batchEntriesContainerEle.innerHTML = "<div class=\"message is-info\">" +
                "<div class=\"message-body\">There are no parking tickets in this batch.</div>" +
                "</div>";
            return;
        }
        var tbodyEle = document.createElement("tbody");
        var canRemove = canUpdate && !currentBatch.lockDate;
        for (var index = 0; index < currentBatch.batchEntries.length; index += 1) {
            var batchEntry = currentBatch.batchEntries[index];
            var trEle = document.createElement("tr");
            trEle.innerHTML = ("<td>" +
                "<a href=\"/tickets/" + batchEntry.ticketID + "\" target=\"_blank\">" +
                batchEntry.ticketNumber +
                "</a>" +
                "</td>") +
                "<td>" + batchEntry.issueDateString + "</td>" +
                ("<td>" +
                    "<span class=\"licence-plate-number is-size-6\">" + cityssm.escapeHTML(batchEntry.licencePlateNumber) + "</span>" +
                    "</td>") +
                (canRemove ?
                    "<td class=\"has-text-right\">" +
                        "<button class=\"button is-small\" data-index=\"" + index + "\" type=\"button\">" +
                        "<span class=\"icon is-small\"><i class=\"fas fa-minus\" aria-hidden=\"true\"></i></span>" +
                        "<span>Remove</span>" +
                        "</button>" +
                        "</td>" :
                    "");
            if (canRemove) {
                trEle.getElementsByTagName("button")[0].addEventListener("click", removeTicketFromBatchByIndex);
            }
            tbodyEle.appendChild(trEle);
        }
        var tableEle = document.createElement("table");
        tableEle.className = "table is-fullwidth is-striped is-hoverable";
        tableEle.innerHTML = "<thead><tr>" +
            "<th>Ticket Number</th>" +
            "<th>Issue Date</th>" +
            "<th>Licence Plate</th>" +
            (canRemove ?
                "<th></th>" :
                "") +
            "</tr></thead>";
        tableEle.appendChild(tbodyEle);
        batchEntriesContainerEle.appendChild(tableEle);
        if (canUpdate && !currentBatch.lockDate) {
            var lockButtonEle = document.createElement("button");
            lockButtonEle.className = "button is-fullwidth mb-3";
            lockButtonEle.innerHTML = "<span class=\"icon is-small\"><i class=\"fas fa-lock\" aria-hidden=\"true\"></i></span>" +
                "<span>Lock Batch</span>";
            lockButtonEle.addEventListener("click", lockBatch);
            batchEntriesContainerEle.insertAdjacentElement("afterbegin", lockButtonEle);
            var clearButtonEle = document.createElement("button");
            clearButtonEle.className = "button is-fullwidth mb-3";
            clearButtonEle.innerHTML = "<span class=\"icon is-small\"><i class=\"fas fa-broom\" aria-hidden=\"true\"></i></span>" +
                "<span>Clear Batch</span>";
            clearButtonEle.addEventListener("click", clearBatch);
            tableEle.insertAdjacentElement("beforebegin", clearButtonEle);
        }
        if (canUpdate && currentBatch.lockDate && !currentBatch.sentDate) {
            var unlockButtonEle = document.createElement("button");
            unlockButtonEle.className = "button is-fullwidth mb-3";
            unlockButtonEle.innerHTML = "<span class=\"icon is-small\"><i class=\"fas fa-unlock\" aria-hidden=\"true\"></i></span>" +
                "<span>Unlock Batch</span>";
            unlockButtonEle.addEventListener("click", unlockBatch);
            batchEntriesContainerEle.insertAdjacentElement("afterbegin", unlockButtonEle);
        }
        if (currentBatch.lockDate) {
            var downloadButtonEle = document.createElement("button");
            downloadButtonEle.className = "button is-fullwidth mb-3";
            downloadButtonEle.innerHTML = "<span class=\"icon is-small\"><i class=\"fas fa-download\" aria-hidden=\"true\"></i></span>" +
                "<span>Download File for MTO</span>";
            downloadButtonEle.addEventListener("click", downloadBatch);
            tableEle.insertAdjacentElement("beforebegin", downloadButtonEle);
            tableEle.insertAdjacentHTML("beforebegin", "<a class=\"button is-fullwidth mb-3\"" +
                " href=\"https://www.apps.rus.mto.gov.on.ca/edtW/login/login.jsp\" target=\"_blank\" rel=\"noreferrer\">" +
                "<span class=\"icon is-small\"><i class=\"fas fa-building\" aria-hidden=\"true\"></i></span>" +
                "<span>MTO ARIS Login</span>" +
                "</a>");
        }
    }
    function confirmCreateBatch() {
        var createFn = function () {
            cityssm.postJSON("/tickets/doCreateConvictionBatch", {}, function (responseJSON) {
                if (responseJSON.success) {
                    currentBatch = responseJSON.batch;
                    renderCurrentBatch();
                    renderConvictableTickets();
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
                renderConvictableTickets();
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
    renderConvictableTickets();
}());
