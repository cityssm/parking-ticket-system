"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const canUpdate = document.getElementsByTagName("main")[0].getAttribute("data-can-update") === "true";
    let currentBatch = exports.currentBatch;
    delete exports.currentBatch;
    let convictableTickets = exports.convictableTickets;
    delete exports.convictableTickets;
    const ticketFilterEle = document.getElementById("filter--parkingTicket");
    const convictableTicketsContainerEle = document.getElementById("convictable-tickets-container");
    let displayedTicketIDs = [];
    const addTicketToBatchByIndexFn = (clickEvent) => {
        clickEvent.preventDefault();
        const buttonEle = clickEvent.currentTarget;
        buttonEle.setAttribute("disabled", "disabled");
        const index = parseInt(buttonEle.getAttribute("data-index"), 10);
        const ticketID = convictableTickets[index].ticketID;
        cityssm.postJSON("/tickets/doAddTicketToConvictionBatch", {
            batchID: currentBatch.batchID,
            ticketID
        }, (resultJSON) => {
            if (resultJSON.success) {
                currentBatch = resultJSON.batch;
                renderCurrentBatchFn();
                convictableTickets.splice(index, 1);
                renderConvictableTicketsFn();
            }
            else {
                buttonEle.removeAttribute("disabled");
                cityssm.alertModal("Ticket Not Added", resultJSON.message, "OK", "danger");
            }
        });
    };
    const addAllTicketsToBatchFn = (clickEvent) => {
        clickEvent.preventDefault();
        let loadingCloseModalFn;
        const addFn = () => {
            cityssm.postJSON("/tickets-ontario/doAddAllTicketsToConvictionBatch", {
                batchID: currentBatch.batchID,
                ticketIDs: displayedTicketIDs
            }, (responseJSON) => {
                loadingCloseModalFn();
                if (responseJSON.batch) {
                    currentBatch = responseJSON.batch;
                    renderCurrentBatchFn();
                }
                if (responseJSON.tickets) {
                    convictableTickets = responseJSON.tickets;
                    renderConvictableTicketsFn();
                }
                if (responseJSON.successCount === 0) {
                    cityssm.alertModal("Results", responseJSON.message ? responseJSON.message : "No tickets were added to the batch.", "OK", "warning");
                }
            });
        };
        cityssm.openHtmlModal("loading", {
            onshow() {
                document.getElementById("is-loading-modal-message").innerText =
                    "Adding " +
                        displayedTicketIDs.length +
                        " ticket" + (displayedTicketIDs.length === 1 ? "" : "s") + "...";
            },
            onshown(_modalEle, closeModalFn) {
                loadingCloseModalFn = closeModalFn;
                addFn();
            }
        });
    };
    const renderConvictableTicketsFn = () => {
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
        const ticketFilter = ticketFilterEle.value.trim().toLowerCase();
        const tbodyEle = document.createElement("tbody");
        convictableTickets.forEach((ticket, index) => {
            if (ticket.ticketNumber.toLowerCase().indexOf(ticketFilter) === -1 &&
                ticket.licencePlateNumber.toLowerCase().indexOf(ticketFilter) === -1) {
                return;
            }
            displayedTicketIDs.push(ticket.ticketID);
            const trEle = document.createElement("tr");
            trEle.innerHTML =
                ("<td>" +
                    "<a data-tooltip=\"View Ticket (Opens in New Window)\"" +
                    " href=\"/tickets/" + ticket.ticketID + "\" target=\"_blank\">" +
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
            trEle.getElementsByTagName("button")[0].addEventListener("click", addTicketToBatchByIndexFn);
            tbodyEle.appendChild(trEle);
        });
        if (displayedTicketIDs.length === 0) {
            convictableTicketsContainerEle.innerHTML = "<div class=\"message is-info\">" +
                "<div class=\"message-body\">There are no parking tickets that meet the search criteria.</div>" +
                "</div>";
            return;
        }
        const addAllButtonEle = document.createElement("button");
        addAllButtonEle.className = "button is-fullwidth mb-3";
        addAllButtonEle.innerHTML =
            "<span class=\"icon is-small\"><i class=\"fas fa-plus\" aria-hidden=\"true\"></i></span>" +
                "<span>" +
                "Add " + displayedTicketIDs.length + " Parking Ticket" + (displayedTicketIDs.length === 1 ? "" : "s") +
                "</span>";
        addAllButtonEle.addEventListener("click", addAllTicketsToBatchFn);
        convictableTicketsContainerEle.appendChild(addAllButtonEle);
        const tableEle = document.createElement("table");
        tableEle.className = "table is-striped is-hoverable is-fullwidth";
        tableEle.innerHTML = "<thead><tr>" +
            "<th>Ticket Number</th>" +
            "<th>Issue Date</th>" +
            "<th>Licence Plate</th>" +
            "<th></th>" +
            "</tr></thead>";
        tableEle.appendChild(tbodyEle);
        convictableTicketsContainerEle.appendChild(tableEle);
    };
    ticketFilterEle.addEventListener("keyup", renderConvictableTicketsFn);
    const batchEntriesContainerEle = document.getElementById("batch-entries-container");
    const removeTicketFromBatchByIndexFn = (clickEvent) => {
        clickEvent.preventDefault();
        const buttonEle = clickEvent.currentTarget;
        buttonEle.setAttribute("disabled", "disabled");
        const index = parseInt(buttonEle.getAttribute("data-index"), 10);
        const ticketID = currentBatch.batchEntries[index].ticketID;
        cityssm.postJSON("/tickets-ontario/doRemoveTicketFromConvictionBatch", {
            batchID: currentBatch.batchID,
            ticketID
        }, (resultJSON) => {
            if (resultJSON.success) {
                currentBatch.batchEntries.splice(index, 1);
                renderCurrentBatchFn();
                convictableTickets = resultJSON.tickets;
                renderConvictableTicketsFn();
            }
            else {
                buttonEle.removeAttribute("disabled");
            }
        });
    };
    const clearBatchFn = (clickEvent) => {
        clickEvent.preventDefault();
        const clearFn = () => {
            cityssm.postJSON("/tickets-ontario/doClearConvictionBatch", {
                batchID: currentBatch.batchID
            }, (responseJSON) => {
                if (!responseJSON.success) {
                    cityssm.alertModal("Batch Not Cleared", responseJSON.message, "OK", "danger");
                }
                if (responseJSON.batch) {
                    currentBatch = responseJSON.batch;
                    renderCurrentBatchFn();
                }
                if (responseJSON.tickets) {
                    convictableTickets = responseJSON.tickets;
                    renderConvictableTicketsFn();
                }
            });
        };
        cityssm.confirmModal("Clear Batch", "Are you sure you want to remove all the parking tickets from the batch?", "Yes, Clear the Batch", "warning", clearFn);
    };
    const lockBatchFn = (clickEvent) => {
        clickEvent.preventDefault();
        const lockFn = () => {
            cityssm.postJSON("/tickets/doLockConvictionBatch", {
                batchID: currentBatch.batchID
            }, (responseJSON) => {
                if (responseJSON.success) {
                    currentBatch.lockDate = responseJSON.lockDate;
                    currentBatch.lockDateString = responseJSON.lockDateString;
                    renderCurrentBatchFn();
                    renderConvictableTicketsFn();
                }
            });
        };
        cityssm.confirmModal("Lock Batch?", "<strong>Are you sure you want to lock this batch?</strong><br />" +
            "Once locked, no further changes to the batch will be allowed." +
            " The option to download the batch will become available.", "Yes, Lock the Batch", "warning", lockFn);
    };
    const unlockBatchFn = (clickEvent) => {
        clickEvent.preventDefault();
        const lockFn = () => {
            cityssm.postJSON("/tickets/doUnlockConvictionBatch", {
                batchID: currentBatch.batchID
            }, (responseJSON) => {
                if (responseJSON.success) {
                    currentBatch.lockDate = null;
                    currentBatch.lockDateString = null;
                    renderCurrentBatchFn();
                    renderConvictableTicketsFn();
                }
            });
        };
        cityssm.confirmModal("Lock Batch?", "<strong>Are you sure you want to unlock this batch?</strong><br />" +
            "Once unlocked, changes to the batch will be allowed.", "Yes, Unlock the Batch", "warning", lockFn);
    };
    const downloadBatchFn = (clickEvent) => {
        clickEvent.preventDefault();
        const downloadFn = () => {
            window.open("/tickets-ontario/convict/" + currentBatch.batchID);
        };
        if (!currentBatch.sentDate) {
            cityssm.confirmModal("Download Batch", "<strong>You are about to download the batch for the first time.</strong><br />" +
                "Once downloaded, the date will be tracked, and the batch will no longer be able to be unlocked.", "Yes, Download the Batch", "warning", () => {
                downloadFn();
                const rightNow = new Date();
                currentBatch.sentDateString = cityssm.dateToString(rightNow);
                currentBatch.sentDate = parseInt(currentBatch.sentDateString.replace(/-/g, ""), 10);
                renderCurrentBatchFn();
            });
        }
        else {
            downloadFn();
        }
    };
    const renderCurrentBatchFn = () => {
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
        const tbodyEle = document.createElement("tbody");
        const canRemove = canUpdate && !currentBatch.lockDate;
        currentBatch.batchEntries.forEach((batchEntry, index) => {
            const trEle = document.createElement("tr");
            trEle.innerHTML = ("<td>" +
                "<a href=\"/tickets/" + batchEntry.ticketID + "\" target=\"_blank\">" +
                batchEntry.ticketNumber +
                "</a>" +
                "</td>") +
                "<td>" + batchEntry.issueDateString + "</td>" +
                ("<td>" +
                    "<span class=\"licence-plate-number is-size-6\">" +
                    cityssm.escapeHTML(batchEntry.licencePlateNumber) +
                    "</span>" +
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
                trEle.getElementsByTagName("button")[0].addEventListener("click", removeTicketFromBatchByIndexFn);
            }
            tbodyEle.appendChild(trEle);
        });
        const tableEle = document.createElement("table");
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
            const lockButtonEle = document.createElement("button");
            lockButtonEle.className = "button is-fullwidth mb-3";
            lockButtonEle.innerHTML =
                "<span class=\"icon is-small\"><i class=\"fas fa-lock\" aria-hidden=\"true\"></i></span>" +
                    "<span>Lock Batch</span>";
            lockButtonEle.addEventListener("click", lockBatchFn);
            batchEntriesContainerEle.insertAdjacentElement("afterbegin", lockButtonEle);
            const clearButtonEle = document.createElement("button");
            clearButtonEle.className = "button is-fullwidth mb-3";
            clearButtonEle.innerHTML =
                "<span class=\"icon is-small\"><i class=\"fas fa-broom\" aria-hidden=\"true\"></i></span>" +
                    "<span>Clear Batch</span>";
            clearButtonEle.addEventListener("click", clearBatchFn);
            tableEle.insertAdjacentElement("beforebegin", clearButtonEle);
        }
        if (canUpdate && currentBatch.lockDate && !currentBatch.sentDate) {
            const unlockButtonEle = document.createElement("button");
            unlockButtonEle.className = "button is-fullwidth mb-3";
            unlockButtonEle.innerHTML =
                "<span class=\"icon is-small\"><i class=\"fas fa-unlock\" aria-hidden=\"true\"></i></span>" +
                    "<span>Unlock Batch</span>";
            unlockButtonEle.addEventListener("click", unlockBatchFn);
            batchEntriesContainerEle.insertAdjacentElement("afterbegin", unlockButtonEle);
        }
        if (currentBatch.lockDate) {
            const downloadButtonEle = document.createElement("button");
            downloadButtonEle.className = "button is-fullwidth mb-3";
            downloadButtonEle.innerHTML =
                "<span class=\"icon is-small\"><i class=\"fas fa-download\" aria-hidden=\"true\"></i></span>" +
                    "<span>Download File for MTO</span>";
            downloadButtonEle.addEventListener("click", downloadBatchFn);
            tableEle.insertAdjacentElement("beforebegin", downloadButtonEle);
            tableEle.insertAdjacentHTML("beforebegin", "<a class=\"button is-fullwidth mb-3\"" +
                " href=\"https://www.apps.rus.mto.gov.on.ca/edtW/login/login.jsp\" target=\"_blank\" rel=\"noreferrer\">" +
                "<span class=\"icon is-small\"><i class=\"fas fa-building\" aria-hidden=\"true\"></i></span>" +
                "<span>MTO ARIS Login</span>" +
                "</a>");
        }
    };
    const confirmCreateBatchFn = () => {
        const createFn = () => {
            cityssm.postJSON("/tickets/doCreateConvictionBatch", {}, (responseJSON) => {
                if (responseJSON.success) {
                    currentBatch = responseJSON.batch;
                    renderCurrentBatchFn();
                    renderConvictableTicketsFn();
                }
            });
        };
        cityssm.confirmModal("Create a New Batch", "Are you sure you want to create a new conviction batch?", "Yes, Create Batch", "info", createFn);
    };
    document.getElementById("is-select-batch-button").addEventListener("click", (clickEvent) => {
        clickEvent.preventDefault();
        let selectBatchCloseModalFn;
        const selectFn = (clickEvent) => {
            clickEvent.preventDefault();
            const batchID = clickEvent.currentTarget.getAttribute("data-batch-id");
            cityssm.postJSON("/tickets/doGetConvictionBatch", {
                batchID
            }, (batchObj) => {
                currentBatch = batchObj;
                renderCurrentBatchFn();
                renderConvictableTicketsFn();
            });
            selectBatchCloseModalFn();
        };
        cityssm.openHtmlModal("mto-selectBatch", {
            onshow(modalEle) {
                if (canUpdate) {
                    const createButtonEle = modalEle.getElementsByClassName("is-create-batch-button")[0];
                    createButtonEle.classList.remove("is-hidden");
                    createButtonEle.addEventListener("click", (clickEvent) => {
                        clickEvent.preventDefault();
                        selectBatchCloseModalFn();
                        confirmCreateBatchFn();
                    });
                }
                cityssm.postJSON("/tickets/doGetRecentConvictionBatches", [], (batchList) => {
                    const resultsContainerEle = modalEle.getElementsByClassName("is-results-container")[0];
                    cityssm.clearElement(resultsContainerEle);
                    if (batchList.length === 0) {
                        resultsContainerEle.className = "message is-info";
                        resultsContainerEle.innerHTML =
                            "<div class=\"message-body\">There are no recent conviction batches.</div>";
                        return;
                    }
                    resultsContainerEle.className = "list is-hoverable";
                    for (const batch of batchList) {
                        const batchListItemEle = document.createElement("a");
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
                                    "<span class=\"icon is-small\"><i class=\"fas fa-lock\" aria-hidden=\"true\"></i></span>" +
                                    "<span>Locked</span>" +
                                    "</span>" :
                                "") +
                            "</div>" +
                            "</div>";
                        batchListItemEle.addEventListener("click", selectFn);
                        resultsContainerEle.appendChild(batchListItemEle);
                    }
                });
            },
            onshown(_modalEle, closeModalFn) {
                selectBatchCloseModalFn = closeModalFn;
            }
        });
    });
    if (currentBatch) {
        renderCurrentBatchFn();
    }
    renderConvictableTicketsFn();
})();
