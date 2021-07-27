"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const ticketID = document.querySelector("#ticket--ticketID").value;
    const statusPanelElement = document.querySelector("#is-status-panel");
    let statusList = exports.ticketStatusLog;
    delete exports.ticketStatusLog;
    const clearStatusPanelFunction = () => {
        const panelBlockElements = statusPanelElement.querySelectorAll(".panel-block");
        for (const panelBlockElement of panelBlockElements) {
            panelBlockElement.remove();
        }
    };
    const confirmResolveTicketFunction = (clickEvent) => {
        clickEvent.preventDefault();
        cityssm.confirmModal("Mark Ticket as Resolved?", "Once resolved, you will no longer be able to make changes to the ticket.", "Yes, Resolve Ticket", "info", () => {
            cityssm.postJSON("/tickets/doResolveTicket", {
                ticketID
            }, (responseJSON) => {
                if (responseJSON.success) {
                    window.location.href = "/tickets/" + ticketID;
                }
            });
        });
    };
    const confirmDeleteStatusFunction = (clickEvent) => {
        const statusIndex = clickEvent.currentTarget.dataset.statusIndex;
        cityssm.confirmModal("Delete Remark?", "Are you sure you want to delete this status?", "Yes, Delete", "warning", () => {
            cityssm.postJSON("/tickets/doDeleteStatus", {
                ticketID,
                statusIndex
            }, (responseJSON) => {
                if (responseJSON.success) {
                    getStatusesFunction();
                }
            });
        });
    };
    const openEditStatusModalFunction = (clickEvent) => {
        clickEvent.preventDefault();
        let editStatusCloseModalFunction;
        const index = Number.parseInt(clickEvent.currentTarget.dataset.index, 10);
        const statusObject = statusList[index];
        const submitFunction = (formEvent) => {
            formEvent.preventDefault();
            cityssm.postJSON("/tickets/doUpdateStatus", formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    editStatusCloseModalFunction();
                    getStatusesFunction();
                }
            });
        };
        const statusKeyChangeFunction = (changeEvent) => {
            const statusKeyObject = pts.getTicketStatus(changeEvent.currentTarget.value);
            const statusFieldElement = document.querySelector("#editStatus--statusField");
            statusFieldElement.value = "";
            if (statusKeyObject === null || statusKeyObject === void 0 ? void 0 : statusKeyObject.statusField) {
                const fieldElement = statusFieldElement.closest(".field");
                fieldElement.querySelector("label").textContent = statusKeyObject.statusField.fieldLabel;
                fieldElement.classList.remove("is-hidden");
            }
            else {
                statusFieldElement.closest(".field").classList.add("is-hidden");
            }
            const statusField2Element = document.querySelector("#editStatus--statusField2");
            statusField2Element.value = "";
            if (statusKeyObject === null || statusKeyObject === void 0 ? void 0 : statusKeyObject.statusField2) {
                const fieldElement = statusField2Element.closest(".field");
                fieldElement.querySelector("label").textContent = statusKeyObject.statusField2.fieldLabel;
                fieldElement.classList.remove("is-hidden");
            }
            else {
                statusFieldElement.closest(".field").classList.add("is-hidden");
            }
        };
        cityssm.openHtmlModal("ticket-editStatus", {
            onshow(modalElement) {
                document.querySelector("#editStatus--ticketID").value = ticketID;
                document.querySelector("#editStatus--statusIndex").value =
                    statusObject.statusIndex.toString();
                document.querySelector("#editStatus--statusField").value = statusObject.statusField;
                document.querySelector("#editStatus--statusField2").value = statusObject.statusField2;
                document.querySelector("#editStatus--statusNote").value = statusObject.statusNote;
                const statusDateElement = document.querySelector("#editStatus--statusDateString");
                statusDateElement.value = statusObject.statusDateString;
                statusDateElement.setAttribute("max", cityssm.dateToString(new Date()));
                document.querySelector("#editStatus--statusTimeString").value =
                    statusObject.statusTimeString;
                pts.getDefaultConfigProperty("parkingTicketStatuses", (parkingTicketStatuses) => {
                    let statusKeyFound = false;
                    const statusKeyElement = document.querySelector("#editStatus--statusKey");
                    for (const statusKeyObject of parkingTicketStatuses) {
                        if (statusKeyObject.isUserSettable || statusKeyObject.statusKey === statusObject.statusKey) {
                            statusKeyElement.insertAdjacentHTML("beforeend", "<option value=\"" + statusKeyObject.statusKey + "\">" +
                                statusKeyObject.status +
                                "</option>");
                            if (statusKeyObject.statusKey === statusObject.statusKey) {
                                statusKeyFound = true;
                                if (statusKeyObject.statusField) {
                                    const fieldElement = document.querySelector("#editStatus--statusField").closest(".field");
                                    fieldElement.querySelector("label").textContent = statusKeyObject.statusField.fieldLabel;
                                    fieldElement.classList.remove("is-hidden");
                                }
                                if (statusKeyObject.statusField2) {
                                    const fieldElement = document.querySelector("#editStatus--statusField2").closest(".field");
                                    fieldElement.querySelector("label").textContent = statusKeyObject.statusField2.fieldLabel;
                                    fieldElement.classList.remove("is-hidden");
                                }
                            }
                        }
                    }
                    if (!statusKeyFound) {
                        statusKeyElement.insertAdjacentHTML("beforeend", "<option value=\"" + statusObject.statusKey + "\">" +
                            statusObject.statusKey +
                            "</option>");
                    }
                    statusKeyElement.value = statusObject.statusKey;
                    statusKeyElement.addEventListener("change", statusKeyChangeFunction);
                });
                modalElement.querySelector("form").addEventListener("submit", submitFunction);
            },
            onshown(_modalElement, closeModalFunction) {
                editStatusCloseModalFunction = closeModalFunction;
            }
        });
    };
    const populateStatusesPanelFunction = () => {
        clearStatusPanelFunction();
        if (statusList.length === 0) {
            statusPanelElement.insertAdjacentHTML("beforeend", "<div class=\"panel-block is-block\">" +
                "<div class=\"message is-info\">" +
                "<p class=\"message-body\">" +
                "There are no statuses associated with this ticket." +
                "</p>" +
                "</div>" +
                "</div>");
            return;
        }
        for (const statusObject of statusList) {
            const statusDefinitionObject = pts.getTicketStatus(statusObject.statusKey);
            const panelBlockElement = document.createElement("div");
            panelBlockElement.className = "panel-block is-block";
            panelBlockElement.innerHTML = "<div class=\"columns\">" +
                ("<div class=\"column\">" +
                    ("<div class=\"level mb-1\">" +
                        "<div class=\"level-left\">" +
                        "<strong>" + (statusDefinitionObject ? statusDefinitionObject.status : statusObject.statusKey) + "</strong>" +
                        "</div>" +
                        "<div class=\"level-right\">" + statusObject.statusDateString + "</div>" +
                        "</div>") +
                    (!statusObject.statusField || statusObject.statusField === ""
                        ? ""
                        : "<p class=\"is-size-7\">" +
                            "<strong>" +
                            ((statusDefinitionObject === null || statusDefinitionObject === void 0 ? void 0 : statusDefinitionObject.statusField)
                                ? statusDefinitionObject.statusField.fieldLabel
                                : "") +
                            ":</strong> " +
                            statusObject.statusField +
                            "</p>") +
                    (!statusObject.statusField2 || statusObject.statusField2 === ""
                        ? ""
                        : "<p class=\"is-size-7\">" +
                            "<strong>" +
                            ((statusDefinitionObject === null || statusDefinitionObject === void 0 ? void 0 : statusDefinitionObject.statusField2)
                                ? statusDefinitionObject.statusField2.fieldLabel
                                : "") +
                            ":</strong> " +
                            statusObject.statusField2 +
                            "</p>") +
                    "<p class=\"has-newline-chars is-size-7\">" + statusObject.statusNote + "</p>" +
                    "</div>") +
                "</div>";
            statusPanelElement.append(panelBlockElement);
        }
        const firstStatusObject = statusList[0];
        if (firstStatusObject.canUpdate) {
            const firstStatusColumnsElement = statusPanelElement.querySelector(".panel-block").querySelector(".columns");
            firstStatusColumnsElement.insertAdjacentHTML("beforeend", "<div class=\"column is-narrow\">" +
                "<div class=\"buttons is-right has-addons\">" +
                ("<button class=\"button is-small is-edit-status-button\"" +
                    " data-tooltip=\"Edit Status\" data-index=\"0\" type=\"button\">" +
                    "<span class=\"icon is-small\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                    " <span>Edit</span>" +
                    "</button>") +
                ("<button class=\"button is-small has-text-danger is-delete-status-button\" data-tooltip=\"Delete Status\"" +
                    " data-status-index=\"" + firstStatusObject.statusIndex.toString() + "\" type=\"button\">" +
                    "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
                    "<span class=\"sr-only\">Delete</span>" +
                    "</button>") +
                "</div>" +
                "</div>");
            firstStatusColumnsElement.querySelector(".is-edit-status-button")
                .addEventListener("click", openEditStatusModalFunction);
            firstStatusColumnsElement.querySelector(".is-delete-status-button")
                .addEventListener("click", confirmDeleteStatusFunction);
        }
        const firstStatusDefinitionObject = pts.getTicketStatus(firstStatusObject.statusKey);
        if (firstStatusDefinitionObject === null || firstStatusDefinitionObject === void 0 ? void 0 : firstStatusDefinitionObject.isFinalStatus) {
            const finalizePanelBlockElement = document.createElement("div");
            finalizePanelBlockElement.className = "panel-block is-block";
            finalizePanelBlockElement.innerHTML = "<div class=\"message is-info is-clearfix\">" +
                "<div class=\"message-body\">" +
                "<div class=\"columns\">" +
                "<div class=\"column\">" +
                "<strong>This ticket is able to be marked as resolved.</strong>" +
                "</div>" +
                "<div class=\"column is-narrow has-text-right align-self-flex-end\">" +
                "<button class=\"button is-info\" type=\"button\">" +
                "<span class=\"icon is-small\"><i class=\"fas fa-check\" aria-hidden=\"true\"></i></span>" +
                "<span>Resolve Ticket</span>" +
                "</button>" +
                "</div>" +
                "</div>" +
                "</div>" +
                "</div>";
            finalizePanelBlockElement.querySelector("button").addEventListener("click", confirmResolveTicketFunction);
            statusPanelElement.prepend(finalizePanelBlockElement);
        }
    };
    const getStatusesFunction = () => {
        clearStatusPanelFunction();
        statusPanelElement.insertAdjacentHTML("beforeend", "<div class=\"panel-block is-block\">" +
            "<p class=\"has-text-centered has-text-grey-lighter\">" +
            "<i class=\"fas fa-2x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
            "<em>Loading statuses..." +
            "</p>" +
            "</div>");
        cityssm.postJSON("/tickets/doGetStatuses", {
            ticketID
        }, (responseStatusList) => {
            statusList = responseStatusList;
            populateStatusesPanelFunction();
        });
    };
    document.querySelector("#is-add-status-button").addEventListener("click", (clickEvent) => {
        clickEvent.preventDefault();
        let addStatusCloseModalFunction;
        const submitFunction = (formEvent) => {
            formEvent.preventDefault();
            const resolveTicket = document.querySelector("#addStatus--resolveTicket").checked;
            cityssm.postJSON("/tickets/doAddStatus", formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    addStatusCloseModalFunction();
                    if (resolveTicket) {
                        window.location.href = "/tickets/" + ticketID;
                    }
                    else {
                        getStatusesFunction();
                    }
                }
            });
        };
        const statusKeyChangeFunction = (changeEvent) => {
            const statusObject = pts.getTicketStatus(changeEvent.currentTarget.value);
            const statusFieldElement = document.querySelector("#addStatus--statusField");
            statusFieldElement.value = "";
            if (statusObject === null || statusObject === void 0 ? void 0 : statusObject.statusField) {
                const fieldElement = statusFieldElement.closest(".field");
                fieldElement.querySelector("label").textContent = statusObject.statusField.fieldLabel;
                fieldElement.classList.remove("is-hidden");
            }
            else {
                statusFieldElement.closest(".field").classList.add("is-hidden");
            }
            const statusField2Element = document.querySelector("#addStatus--statusField2");
            statusField2Element.value = "";
            if (statusObject === null || statusObject === void 0 ? void 0 : statusObject.statusField2) {
                const fieldElement = statusField2Element.closest(".field");
                fieldElement.querySelector("label").textContent = statusObject.statusField2.fieldLabel;
                fieldElement.classList.remove("is-hidden");
            }
            else {
                statusField2Element.closest(".field").classList.add("is-hidden");
            }
            const resolveTicketElement = document.querySelector("#addStatus--resolveTicket");
            resolveTicketElement.checked = false;
            if (statusObject === null || statusObject === void 0 ? void 0 : statusObject.isFinalStatus) {
                resolveTicketElement.closest(".field").classList.remove("is-hidden");
            }
            else {
                resolveTicketElement.closest(".field").classList.add("is-hidden");
            }
        };
        cityssm.openHtmlModal("ticket-addStatus", {
            onshow(modalElement) {
                document.querySelector("#addStatus--ticketID").value = ticketID;
                pts.getDefaultConfigProperty("parkingTicketStatuses", (parkingTicketStatuses) => {
                    const statusKeyElement = document.querySelector("#addStatus--statusKey");
                    for (const statusObject of parkingTicketStatuses) {
                        if (statusObject.isUserSettable) {
                            statusKeyElement.insertAdjacentHTML("beforeend", "<option value=\"" + statusObject.statusKey + "\">" +
                                statusObject.status +
                                "</option>");
                        }
                    }
                    statusKeyElement.addEventListener("change", statusKeyChangeFunction);
                });
                modalElement.querySelector("form").addEventListener("submit", submitFunction);
            },
            onshown(_modalElement, closeModalFunction) {
                addStatusCloseModalFunction = closeModalFunction;
            }
        });
    });
    document.querySelector("#is-add-paid-status-button").addEventListener("click", (clickEvent) => {
        clickEvent.preventDefault();
        let addPaidStatusCloseModalFunction;
        const submitFunction = (formEvent) => {
            formEvent.preventDefault();
            const resolveTicket = document.querySelector("#addPaidStatus--resolveTicket").checked;
            cityssm.postJSON("/tickets/doAddStatus", formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    addPaidStatusCloseModalFunction();
                    if (resolveTicket) {
                        window.location.href = "/tickets/" + ticketID;
                    }
                    else {
                        getStatusesFunction();
                    }
                }
            });
        };
        cityssm.openHtmlModal("ticket-addStatusPaid", {
            onshow(modalElement) {
                document.querySelector("#addPaidStatus--ticketID").value = ticketID;
                const statusFieldElement = document.querySelector("#addPaidStatus--statusField");
                const offenceAmount = document.querySelector("#ticket--offenceAmount").value;
                const issueDateString = document.querySelector("#ticket--issueDateString").value;
                const discountDays = document.querySelector("#ticket--discountDays").value;
                if (issueDateString === "" || discountDays === "") {
                    statusFieldElement.value = offenceAmount;
                }
                else {
                    const currentDateString = cityssm.dateToString(new Date());
                    const dateDifference = cityssm.dateStringDifferenceInDays(issueDateString, currentDateString);
                    statusFieldElement.value = dateDifference <= Number.parseInt(discountDays, 10)
                        ? document.querySelector("#ticket--discountOffenceAmount").value
                        : offenceAmount;
                }
                modalElement.querySelector("form").addEventListener("submit", submitFunction);
            },
            onshown(_modalElement, closeModalFunction) {
                addPaidStatusCloseModalFunction = closeModalFunction;
            }
        });
    });
    pts.loadDefaultConfigProperties(populateStatusesPanelFunction);
})();
