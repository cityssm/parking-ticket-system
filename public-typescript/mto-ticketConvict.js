"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const canUpdate = document.querySelectorAll("main")[0].getAttribute("data-can-update") === "true";
    let currentBatch = exports.currentBatch;
    delete exports.currentBatch;
    let convictableTickets = exports.convictableTickets;
    delete exports.convictableTickets;
    const ticketFilterElement = document.querySelector("#filter--parkingTicket");
    const convictableTicketsContainerElement = document.querySelector("#convictable-tickets-container");
    let displayedTicketIDs = [];
    const addTicketToBatchByIndexFunction = (clickEvent) => {
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        buttonElement.setAttribute("disabled", "disabled");
        const index = Number.parseInt(buttonElement.getAttribute("data-index"), 10);
        const ticketID = convictableTickets[index].ticketID;
        cityssm.postJSON("/tickets/doAddTicketToConvictionBatch", {
            batchID: currentBatch.batchID,
            ticketID
        }, (resultJSON) => {
            if (resultJSON.success) {
                currentBatch = resultJSON.batch;
                renderCurrentBatchFunction();
                convictableTickets.splice(index, 1);
                renderConvictableTicketsFunction();
            }
            else {
                buttonElement.removeAttribute("disabled");
                cityssm.alertModal("Ticket Not Added", resultJSON.message, "OK", "danger");
            }
        });
    };
    const addAllTicketsToBatchFunction = (clickEvent) => {
        clickEvent.preventDefault();
        let loadingCloseModalFunction;
        const addFunction = () => {
            cityssm.postJSON("/tickets-ontario/doAddAllTicketsToConvictionBatch", {
                batchID: currentBatch.batchID,
                ticketIDs: displayedTicketIDs
            }, (responseJSON) => {
                loadingCloseModalFunction();
                if (responseJSON.batch) {
                    currentBatch = responseJSON.batch;
                    renderCurrentBatchFunction();
                }
                if (responseJSON.tickets) {
                    convictableTickets = responseJSON.tickets;
                    renderConvictableTicketsFunction();
                }
                if (responseJSON.successCount === 0) {
                    cityssm.alertModal("Results", responseJSON.message
                        ? responseJSON.message
                        : "No tickets were added to the batch.", "OK", "warning");
                }
            });
        };
        cityssm.openHtmlModal("loading", {
            onshow() {
                document.querySelector("#is-loading-modal-message").textContent =
                    "Adding " +
                        displayedTicketIDs.length.toString() +
                        " ticket" +
                        (displayedTicketIDs.length === 1 ? "" : "s") +
                        "...";
            },
            onshown(_modalElement, closeModalFunction) {
                loadingCloseModalFunction = closeModalFunction;
                addFunction();
            }
        });
    };
    const renderConvictableTicketsFunction = () => {
        cityssm.clearElement(convictableTicketsContainerElement);
        displayedTicketIDs = [];
        if (!currentBatch) {
            convictableTicketsContainerElement.innerHTML =
                "<div class=\"message is-warning\">" +
                    "<div class=\"message-body\">Select a target batch to get started.</div>" +
                    "</div>";
            return;
        }
        if (!canUpdate) {
            convictableTicketsContainerElement.innerHTML =
                "<div class=\"message is-warning\">" +
                    "<div class=\"message-body\">Parking tickets can only be added by users with update permissions.</div>" +
                    "</div>";
            return;
        }
        if (currentBatch.lockDate) {
            convictableTicketsContainerElement.innerHTML =
                "<div class=\"message is-warning\">" +
                    "<div class=\"message-body\">The target batch is locked and cannot accept additional tickets.</div>" +
                    "</div>";
            return;
        }
        if (convictableTickets.length === 0) {
            convictableTicketsContainerElement.innerHTML =
                "<div class=\"message is-info\">" +
                    "<div class=\"message-body\">There are no parking tickets currently eligible for conviction.</div>" +
                    "</div>";
            return;
        }
        const ticketFilter = ticketFilterElement.value.trim().toLowerCase();
        const tbodyElement = document.createElement("tbody");
        for (const [index, ticket] of convictableTickets.entries()) {
            if (!ticket.ticketNumber.toLowerCase().includes(ticketFilter) &&
                !ticket.licencePlateNumber.toLowerCase().includes(ticketFilter)) {
                continue;
            }
            displayedTicketIDs.push(ticket.ticketID);
            const trElement = document.createElement("tr");
            trElement.innerHTML =
                "<td>" +
                    "<a data-tooltip=\"View Ticket (Opens in New Window)\"" +
                    " href=\"/tickets/" +
                    ticket.ticketID.toString() +
                    "\" target=\"_blank\">" +
                    cityssm.escapeHTML(ticket.ticketNumber) +
                    "</a>" +
                    "</td>" +
                    "<td>" +
                    ticket.issueDateString +
                    "</td>" +
                    ("<td>" +
                        "<span class=\"licence-plate-number is-size-6\">" +
                        cityssm.escapeHTML(ticket.licencePlateNumber) +
                        "</span><br />" +
                        "<span class=\"has-tooltip-right is-size-7\" data-tooltip=\"Primary Owner\">" +
                        cityssm.escapeHTML(ticket.licencePlateOwner_ownerName1) +
                        "</span>" +
                        "</td>") +
                    ("<td class=\"has-text-right\">" +
                        "<button class=\"button is-small\" data-index=\"" +
                        index.toString() +
                        "\" type=\"button\">" +
                        "<span class=\"icon is-small\"><i class=\"fas fa-plus\" aria-hidden=\"true\"></i></span>" +
                        "<span>Add</span>" +
                        "</button>" +
                        "</td>");
            trElement.querySelector("button").addEventListener("click", addTicketToBatchByIndexFunction);
            tbodyElement.append(trElement);
        }
        if (displayedTicketIDs.length === 0) {
            convictableTicketsContainerElement.innerHTML =
                "<div class=\"message is-info\">" +
                    "<div class=\"message-body\">There are no parking tickets that meet the search criteria.</div>" +
                    "</div>";
            return;
        }
        const addAllButtonElement = document.createElement("button");
        addAllButtonElement.className = "button is-fullwidth mb-3";
        addAllButtonElement.innerHTML =
            "<span class=\"icon is-small\"><i class=\"fas fa-plus\" aria-hidden=\"true\"></i></span>" +
                "<span>" +
                "Add " +
                displayedTicketIDs.length.toString() +
                " Parking Ticket" +
                (displayedTicketIDs.length === 1 ? "" : "s") +
                "</span>";
        addAllButtonElement.addEventListener("click", addAllTicketsToBatchFunction);
        convictableTicketsContainerElement.append(addAllButtonElement);
        const tableElement = document.createElement("table");
        tableElement.className = "table is-striped is-hoverable is-fullwidth";
        tableElement.innerHTML =
            "<thead><tr>" +
                "<th>Ticket Number</th>" +
                "<th>Issue Date</th>" +
                "<th>Licence Plate</th>" +
                "<th></th>" +
                "</tr></thead>";
        tableElement.append(tbodyElement);
        convictableTicketsContainerElement.append(tableElement);
    };
    ticketFilterElement.addEventListener("keyup", renderConvictableTicketsFunction);
    const batchEntriesContainerElement = document.querySelector("#batch-entries-container");
    const removeTicketFromBatchByIndexFunction = (clickEvent) => {
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        buttonElement.setAttribute("disabled", "disabled");
        const index = Number.parseInt(buttonElement.getAttribute("data-index"), 10);
        const ticketID = currentBatch.batchEntries[index].ticketID;
        cityssm.postJSON("/tickets-ontario/doRemoveTicketFromConvictionBatch", {
            batchID: currentBatch.batchID,
            ticketID
        }, (resultJSON) => {
            if (resultJSON.success) {
                currentBatch.batchEntries.splice(index, 1);
                renderCurrentBatchFunction();
                convictableTickets = resultJSON.tickets;
                renderConvictableTicketsFunction();
            }
            else {
                buttonElement.removeAttribute("disabled");
            }
        });
    };
    const clearBatchFunction = (clickEvent) => {
        clickEvent.preventDefault();
        const clearFunction = () => {
            cityssm.postJSON("/tickets-ontario/doClearConvictionBatch", {
                batchID: currentBatch.batchID
            }, (responseJSON) => {
                if (!responseJSON.success) {
                    cityssm.alertModal("Batch Not Cleared", responseJSON.message, "OK", "danger");
                }
                if (responseJSON.batch) {
                    currentBatch = responseJSON.batch;
                    renderCurrentBatchFunction();
                }
                if (responseJSON.tickets) {
                    convictableTickets = responseJSON.tickets;
                    renderConvictableTicketsFunction();
                }
            });
        };
        cityssm.confirmModal("Clear Batch", "Are you sure you want to remove all the parking tickets from the batch?", "Yes, Clear the Batch", "warning", clearFunction);
    };
    const lockBatchFunction = (clickEvent) => {
        clickEvent.preventDefault();
        const lockFunction = () => {
            cityssm.postJSON("/tickets/doLockConvictionBatch", {
                batchID: currentBatch.batchID
            }, (responseJSON) => {
                if (responseJSON.success) {
                    currentBatch.lockDate = responseJSON.lockDate;
                    currentBatch.lockDateString = responseJSON.lockDateString;
                    renderCurrentBatchFunction();
                    renderConvictableTicketsFunction();
                }
            });
        };
        cityssm.confirmModal("Lock Batch?", "<strong>Are you sure you want to lock this batch?</strong><br />" +
            "Once locked, no further changes to the batch will be allowed." +
            " The option to download the batch will become available.", "Yes, Lock the Batch", "warning", lockFunction);
    };
    const unlockBatchFunction = (clickEvent) => {
        clickEvent.preventDefault();
        const lockFunction = () => {
            cityssm.postJSON("/tickets/doUnlockConvictionBatch", {
                batchID: currentBatch.batchID
            }, (responseJSON) => {
                if (responseJSON.success) {
                    currentBatch.lockDate = undefined;
                    currentBatch.lockDateString = undefined;
                    renderCurrentBatchFunction();
                    renderConvictableTicketsFunction();
                }
            });
        };
        cityssm.confirmModal("Lock Batch?", "<strong>Are you sure you want to unlock this batch?</strong><br />" +
            "Once unlocked, changes to the batch will be allowed.", "Yes, Unlock the Batch", "warning", lockFunction);
    };
    const downloadBatchFunction = (clickEvent) => {
        clickEvent.preventDefault();
        const downloadFunction = () => {
            window.open("/tickets-ontario/convict/" + currentBatch.batchID.toString());
        };
        if (!currentBatch.sentDate) {
            cityssm.confirmModal("Download Batch", "<strong>You are about to download the batch for the first time.</strong><br />" +
                "Once downloaded, the date will be tracked, and the batch will no longer be able to be unlocked.", "Yes, Download the Batch", "warning", () => {
                downloadFunction();
                const rightNow = new Date();
                currentBatch.sentDateString = cityssm.dateToString(rightNow);
                currentBatch.sentDate = Number.parseInt(currentBatch.sentDateString.replace(/-/g, ""), 10);
                renderCurrentBatchFunction();
            });
        }
        else {
            downloadFunction();
        }
    };
    const renderCurrentBatchFunction = () => {
        document.querySelector("#batchSelector--batchID").textContent =
            "Batch #" + currentBatch.batchID.toString();
        document.querySelector("#batchSelector--batchDetails").innerHTML =
            "<span class=\"has-tooltip-left\" data-tooltip=\"Batch Date\">" +
                "<span class=\"icon\"><i class=\"fas fa-star\" aria-hidden=\"true\"></i></span> " +
                currentBatch.batchDateString +
                "</span>" +
                (currentBatch.lockDate
                    ? "<br /><span class=\"has-tooltip-left\" data-tooltip=\"Lock Date\">" +
                        "<span class=\"icon\"><i class=\"fas fa-lock\" aria-hidden=\"true\"></i></span> " +
                        currentBatch.lockDateString +
                        "</span>"
                    : "");
        cityssm.clearElement(batchEntriesContainerElement);
        if (currentBatch.batchEntries.length === 0) {
            batchEntriesContainerElement.innerHTML =
                "<div class=\"message is-info\">" +
                    "<div class=\"message-body\">There are no parking tickets in this batch.</div>" +
                    "</div>";
            return;
        }
        const tbodyElement = document.createElement("tbody");
        const canRemove = canUpdate && !currentBatch.lockDate;
        for (const [index, batchEntry] of currentBatch.batchEntries.entries()) {
            const trElement = document.createElement("tr");
            trElement.innerHTML =
                "<td>" +
                    "<a href=\"/tickets/" + batchEntry.ticketID.toString() + "\" target=\"_blank\">" +
                    batchEntry.ticketNumber +
                    "</a>" +
                    "</td>" +
                    "<td>" +
                    batchEntry.issueDateString +
                    "</td>" +
                    ("<td>" +
                        "<span class=\"licence-plate-number is-size-6\">" +
                        cityssm.escapeHTML(batchEntry.licencePlateNumber) +
                        "</span>" +
                        "</td>") +
                    (canRemove
                        ? "<td class=\"has-text-right\">" +
                            "<button class=\"button is-small\" data-index=\"" +
                            index.toString() +
                            "\" type=\"button\">" +
                            "<span class=\"icon is-small\"><i class=\"fas fa-minus\" aria-hidden=\"true\"></i></span>" +
                            "<span>Remove</span>" +
                            "</button>" +
                            "</td>"
                        : "");
            if (canRemove) {
                trElement.querySelector("button").addEventListener("click", removeTicketFromBatchByIndexFunction);
            }
            tbodyElement.append(trElement);
        }
        const tableElement = document.createElement("table");
        tableElement.className = "table is-fullwidth is-striped is-hoverable";
        tableElement.innerHTML =
            "<thead><tr>" +
                "<th>Ticket Number</th>" +
                "<th>Issue Date</th>" +
                "<th>Licence Plate</th>" +
                (canRemove ? "<th></th>" : "") +
                "</tr></thead>";
        tableElement.append(tbodyElement);
        batchEntriesContainerElement.append(tableElement);
        if (canUpdate && !currentBatch.lockDate) {
            const lockButtonElement = document.createElement("button");
            lockButtonElement.className = "button is-fullwidth mb-3";
            lockButtonElement.innerHTML =
                "<span class=\"icon is-small\"><i class=\"fas fa-lock\" aria-hidden=\"true\"></i></span>" +
                    "<span>Lock Batch</span>";
            lockButtonElement.addEventListener("click", lockBatchFunction);
            batchEntriesContainerElement.prepend(lockButtonElement);
            const clearButtonElement = document.createElement("button");
            clearButtonElement.className = "button is-fullwidth mb-3";
            clearButtonElement.innerHTML =
                "<span class=\"icon is-small\"><i class=\"fas fa-broom\" aria-hidden=\"true\"></i></span>" +
                    "<span>Clear Batch</span>";
            clearButtonElement.addEventListener("click", clearBatchFunction);
            tableElement.before(clearButtonElement);
        }
        if (canUpdate && currentBatch.lockDate && !currentBatch.sentDate) {
            const unlockButtonElement = document.createElement("button");
            unlockButtonElement.className = "button is-fullwidth mb-3";
            unlockButtonElement.innerHTML =
                "<span class=\"icon is-small\"><i class=\"fas fa-unlock\" aria-hidden=\"true\"></i></span>" +
                    "<span>Unlock Batch</span>";
            unlockButtonElement.addEventListener("click", unlockBatchFunction);
            batchEntriesContainerElement.prepend(unlockButtonElement);
        }
        if (currentBatch.lockDate) {
            const downloadButtonElement = document.createElement("button");
            downloadButtonElement.className = "button is-fullwidth mb-3";
            downloadButtonElement.innerHTML =
                "<span class=\"icon is-small\"><i class=\"fas fa-download\" aria-hidden=\"true\"></i></span>" +
                    "<span>Download File for MTO</span>";
            downloadButtonElement.addEventListener("click", downloadBatchFunction);
            tableElement.before(downloadButtonElement);
            tableElement.insertAdjacentHTML("beforebegin", "<a class=\"button is-fullwidth mb-3\"" +
                " href=\"https://www.apps.rus.mto.gov.on.ca/edtW/login/login.jsp\" target=\"_blank\" rel=\"noreferrer\">" +
                "<span class=\"icon is-small\"><i class=\"fas fa-building\" aria-hidden=\"true\"></i></span>" +
                "<span>MTO ARIS Login</span>" +
                "</a>");
        }
    };
    const confirmCreateBatchFunction = () => {
        const createFunction = () => {
            cityssm.postJSON("/tickets/doCreateConvictionBatch", {}, (responseJSON) => {
                if (responseJSON.success) {
                    currentBatch = responseJSON.batch;
                    renderCurrentBatchFunction();
                    renderConvictableTicketsFunction();
                }
            });
        };
        cityssm.confirmModal("Create a New Batch", "Are you sure you want to create a new conviction batch?", "Yes, Create Batch", "info", createFunction);
    };
    document.querySelector("#is-select-batch-button")
        .addEventListener("click", (clickEvent) => {
        clickEvent.preventDefault();
        let selectBatchCloseModalFunction;
        const selectFunction = (clickEvent) => {
            clickEvent.preventDefault();
            const batchID = clickEvent.currentTarget.dataset.batchId;
            cityssm.postJSON("/tickets/doGetConvictionBatch", {
                batchID
            }, (batchObject) => {
                currentBatch = batchObject;
                renderCurrentBatchFunction();
                renderConvictableTicketsFunction();
            });
            selectBatchCloseModalFunction();
        };
        cityssm.openHtmlModal("mto-selectBatch", {
            onshow(modalElement) {
                if (canUpdate) {
                    const createButtonElement = modalElement.querySelector(".is-create-batch-button");
                    createButtonElement.classList.remove("is-hidden");
                    createButtonElement.addEventListener("click", (clickEvent) => {
                        clickEvent.preventDefault();
                        selectBatchCloseModalFunction();
                        confirmCreateBatchFunction();
                    });
                }
                cityssm.postJSON("/tickets/doGetRecentConvictionBatches", [], (batchList) => {
                    const resultsContainerElement = modalElement.querySelector(".is-results-container");
                    cityssm.clearElement(resultsContainerElement);
                    if (batchList.length === 0) {
                        resultsContainerElement.className = "message is-info";
                        resultsContainerElement.innerHTML =
                            "<div class=\"message-body\">There are no recent conviction batches.</div>";
                        return;
                    }
                    resultsContainerElement.className = "list is-hoverable";
                    for (const batch of batchList) {
                        const batchListItemElement = document.createElement("a");
                        batchListItemElement.className = "list-item";
                        batchListItemElement.dataset.batchId = batch.batchID.toString();
                        batchListItemElement.href = "#";
                        batchListItemElement.innerHTML =
                            "<div class=\"columns\">" +
                                "<div class=\"column is-narrow\">#" +
                                batch.batchID.toString() +
                                "</div>" +
                                "<div class=\"column has-text-right\">" +
                                batch.batchDateString +
                                (batch.lockDate
                                    ? "<br /><div class=\"tags justify-flex-end\">" +
                                        "<span class=\"tag\">" +
                                        "<span class=\"icon is-small\"><i class=\"fas fa-lock\" aria-hidden=\"true\"></i></span>" +
                                        "<span>Locked</span>" +
                                        "</span>"
                                    : "") +
                                "</div>" +
                                "</div>";
                        batchListItemElement.addEventListener("click", selectFunction);
                        resultsContainerElement.append(batchListItemElement);
                    }
                });
            },
            onshown(_modalElement, closeModalFunction) {
                selectBatchCloseModalFunction = closeModalFunction;
            }
        });
    });
    if (currentBatch) {
        renderCurrentBatchFunction();
    }
    renderConvictableTicketsFunction();
})();
