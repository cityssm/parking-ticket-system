"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var ticketID = document.getElementById("ticket--ticketID").value;
    var statusPanelEle = document.getElementById("is-status-panel");
    var statusList = exports.ticketStatusLog;
    delete exports.ticketStatusLog;
    var clearStatusPanelFn = function () {
        var panelBlockEles = statusPanelEle.getElementsByClassName("panel-block");
        while (panelBlockEles.length > 0) {
            panelBlockEles[0].remove();
        }
    };
    var confirmResolveTicketFn = function (clickEvent) {
        clickEvent.preventDefault();
        cityssm.confirmModal("Mark Ticket as Resolved?", "Once resolved, you will no longer be able to make changes to the ticket.", "Yes, Resolve Ticket", "info", function () {
            cityssm.postJSON("/tickets/doResolveTicket", {
                ticketID: ticketID
            }, function (responseJSON) {
                if (responseJSON.success) {
                    window.location.href = "/tickets/" + ticketID;
                }
            });
        });
    };
    var confirmDeleteStatusFn = function (clickEvent) {
        var statusIndex = clickEvent.currentTarget.getAttribute("data-status-index");
        cityssm.confirmModal("Delete Remark?", "Are you sure you want to delete this status?", "Yes, Delete", "warning", function () {
            cityssm.postJSON("/tickets/doDeleteStatus", {
                ticketID: ticketID,
                statusIndex: statusIndex
            }, function (resultJSON) {
                if (resultJSON.success) {
                    getStatusesFn();
                }
            });
        });
    };
    var openEditStatusModalFn = function (clickEvent) {
        clickEvent.preventDefault();
        var editStatusCloseModalFn;
        var index = parseInt(clickEvent.currentTarget.getAttribute("data-index"), 10);
        var statusObj = statusList[index];
        var submitFn = function (formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON("/tickets/doUpdateStatus", formEvent.currentTarget, function (responseJSON) {
                if (responseJSON.success) {
                    editStatusCloseModalFn();
                    getStatusesFn();
                }
            });
        };
        var statusKeyChangeFn = function (changeEvent) {
            var statusKeyObj = pts.getTicketStatus(changeEvent.currentTarget.value);
            var statusFieldEle = document.getElementById("editStatus--statusField");
            statusFieldEle.value = "";
            if (statusKeyObj && statusKeyObj.statusField) {
                var fieldEle = statusFieldEle.closest(".field");
                fieldEle.getElementsByTagName("label")[0].innerText = statusKeyObj.statusField.fieldLabel;
                fieldEle.classList.remove("is-hidden");
            }
            else {
                statusFieldEle.closest(".field").classList.add("is-hidden");
            }
            var statusField2Ele = document.getElementById("editStatus--statusField2");
            statusField2Ele.value = "";
            if (statusKeyObj && statusKeyObj.statusField2) {
                var fieldEle = statusField2Ele.closest(".field");
                fieldEle.getElementsByTagName("label")[0].innerText = statusKeyObj.statusField2.fieldLabel;
                fieldEle.classList.remove("is-hidden");
            }
            else {
                statusFieldEle.closest(".field").classList.add("is-hidden");
            }
        };
        cityssm.openHtmlModal("ticket-editStatus", {
            onshow: function (modalEle) {
                document.getElementById("editStatus--ticketID").value = ticketID;
                document.getElementById("editStatus--statusIndex").value = statusObj.statusIndex;
                document.getElementById("editStatus--statusField").value = statusObj.statusField;
                document.getElementById("editStatus--statusField2").value = statusObj.statusField2;
                document.getElementById("editStatus--statusNote").value = statusObj.statusNote;
                var statusDateEle = document.getElementById("editStatus--statusDateString");
                statusDateEle.value = statusObj.statusDateString;
                statusDateEle.setAttribute("max", cityssm.dateToString(new Date()));
                document.getElementById("editStatus--statusTimeString").value = statusObj.statusTimeString;
                pts.getDefaultConfigProperty("parkingTicketStatuses", function (parkingTicketStatuses) {
                    var statusKeyFound = false;
                    var statusKeyEle = document.getElementById("editStatus--statusKey");
                    for (var statusKeyIndex = 0; statusKeyIndex < parkingTicketStatuses.length; statusKeyIndex += 1) {
                        var statusKeyObj = parkingTicketStatuses[statusKeyIndex];
                        if (statusKeyObj.isUserSettable || statusKeyObj.statusKey === statusObj.statusKey) {
                            statusKeyEle.insertAdjacentHTML("beforeend", "<option value=\"" + statusKeyObj.statusKey + "\">" +
                                statusKeyObj.status +
                                "</option>");
                            if (statusKeyObj.statusKey === statusObj.statusKey) {
                                statusKeyFound = true;
                                if (statusKeyObj.statusField) {
                                    var fieldEle = document.getElementById("editStatus--statusField").closest(".field");
                                    fieldEle.getElementsByTagName("label")[0].innerText = statusKeyObj.statusField.fieldLabel;
                                    fieldEle.classList.remove("is-hidden");
                                }
                                if (statusKeyObj.statusField2) {
                                    var fieldEle = document.getElementById("editStatus--statusField2").closest(".field");
                                    fieldEle.getElementsByTagName("label")[0].innerText = statusKeyObj.statusField2.fieldLabel;
                                    fieldEle.classList.remove("is-hidden");
                                }
                            }
                        }
                    }
                    if (!statusKeyFound) {
                        statusKeyEle.insertAdjacentHTML("beforeend", "<option value=\"" + statusObj.statusKey + "\">" +
                            statusObj.statusKey +
                            "</option>");
                    }
                    statusKeyEle.value = statusObj.statusKey;
                    statusKeyEle.addEventListener("change", statusKeyChangeFn);
                });
                modalEle.getElementsByTagName("form")[0].addEventListener("submit", submitFn);
            },
            onshown: function (_modalEle, closeModalFn) {
                editStatusCloseModalFn = closeModalFn;
            }
        });
    };
    var populateStatusesPanelFn = function () {
        clearStatusPanelFn();
        if (statusList.length === 0) {
            statusPanelEle.insertAdjacentHTML("beforeend", "<div class=\"panel-block is-block\">" +
                "<div class=\"message is-info\">" +
                "<p class=\"message-body\">" +
                "There are no statuses associated with this ticket." +
                "</p>" +
                "</div>" +
                "</div>");
            return;
        }
        for (var index = 0; index < statusList.length; index += 1) {
            var statusObj = statusList[index];
            var statusDefinitionObj = pts.getTicketStatus(statusObj.statusKey);
            var panelBlockEle = document.createElement("div");
            panelBlockEle.className = "panel-block is-block";
            panelBlockEle.innerHTML = "<div class=\"columns\">" +
                ("<div class=\"column\">" +
                    ("<div class=\"level mb-1\">" +
                        "<div class=\"level-left\">" +
                        "<strong>" + (statusDefinitionObj ? statusDefinitionObj.status : statusObj.statusKey) + "</strong>" +
                        "</div>" +
                        "<div class=\"level-right\">" + statusObj.statusDateString + "</div>" +
                        "</div>") +
                    (!statusObj.statusField || statusObj.statusField === "" ?
                        "" :
                        "<p class=\"is-size-7\">" +
                            "<strong>" +
                            (statusDefinitionObj && statusDefinitionObj.statusField ?
                                statusDefinitionObj.statusField.fieldLabel :
                                "") +
                            ":</strong> " +
                            statusObj.statusField +
                            "</p>") +
                    (!statusObj.statusField2 || statusObj.statusField2 === "" ?
                        "" :
                        "<p class=\"is-size-7\">" +
                            "<strong>" +
                            (statusDefinitionObj && statusDefinitionObj.statusField2 ?
                                statusDefinitionObj.statusField2.fieldLabel :
                                "") +
                            ":</strong> " +
                            statusObj.statusField2 +
                            "</p>") +
                    "<p class=\"has-newline-chars is-size-7\">" + statusObj.statusNote + "</p>" +
                    "</div>") +
                "</div>";
            statusPanelEle.appendChild(panelBlockEle);
        }
        var firstStatusObj = statusList[0];
        if (firstStatusObj.canUpdate) {
            var firstStatusColumnsEle = statusPanelEle.getElementsByClassName("panel-block")[0].getElementsByClassName("columns")[0];
            firstStatusColumnsEle.insertAdjacentHTML("beforeend", "<div class=\"column is-narrow\">" +
                "<div class=\"buttons is-right has-addons\">" +
                "<button class=\"button is-small is-edit-status-button\" data-tooltip=\"Edit Status\" data-index=\"0\" type=\"button\">" +
                "<span class=\"icon is-small\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                " <span>Edit</span>" +
                "</button>" +
                "<button class=\"button is-small has-text-danger is-delete-status-button\" data-tooltip=\"Delete Status\" data-status-index=\"" + firstStatusObj.statusIndex + "\" type=\"button\">" +
                "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
                "<span class=\"sr-only\">Delete</span>" +
                "</button>" +
                "</div>" +
                "</div>");
            firstStatusColumnsEle.getElementsByClassName("is-edit-status-button")[0]
                .addEventListener("click", openEditStatusModalFn);
            firstStatusColumnsEle.getElementsByClassName("is-delete-status-button")[0]
                .addEventListener("click", confirmDeleteStatusFn);
        }
        var firstStatusDefinitionObj = pts.getTicketStatus(firstStatusObj.statusKey);
        if (firstStatusDefinitionObj && firstStatusDefinitionObj.isFinalStatus) {
            var finalizePanelBlockEle = document.createElement("div");
            finalizePanelBlockEle.className = "panel-block is-block";
            finalizePanelBlockEle.innerHTML = "<div class=\"message is-info is-clearfix\">" +
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
            finalizePanelBlockEle.getElementsByTagName("button")[0].addEventListener("click", confirmResolveTicketFn);
            statusPanelEle.insertAdjacentElement("afterbegin", finalizePanelBlockEle);
        }
    };
    var getStatusesFn = function () {
        clearStatusPanelFn();
        statusPanelEle.insertAdjacentHTML("beforeend", "<div class=\"panel-block is-block\">" +
            "<p class=\"has-text-centered has-text-grey-lighter\">" +
            "<i class=\"fas fa-2x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
            "<em>Loading statuses..." +
            "</p>" +
            "</div>");
        cityssm.postJSON("/tickets/doGetStatuses", {
            ticketID: ticketID
        }, function (resultList) {
            statusList = resultList;
            populateStatusesPanelFn();
        });
    };
    document.getElementById("is-add-status-button").addEventListener("click", function (clickEvent) {
        clickEvent.preventDefault();
        var addStatusCloseModalFn;
        var submitFn = function (formEvent) {
            formEvent.preventDefault();
            var resolveTicket = document.getElementById("addStatus--resolveTicket").checked;
            cityssm.postJSON("/tickets/doAddStatus", formEvent.currentTarget, function (responseJSON) {
                if (responseJSON.success) {
                    addStatusCloseModalFn();
                    if (resolveTicket) {
                        window.location.href = "/tickets/" + ticketID;
                    }
                    else {
                        getStatusesFn();
                    }
                }
            });
        };
        var statusKeyChangeFn = function (changeEvent) {
            var statusObj = pts.getTicketStatus(changeEvent.currentTarget.value);
            var statusFieldEle = document.getElementById("addStatus--statusField");
            statusFieldEle.value = "";
            if (statusObj && statusObj.statusField) {
                var fieldEle = statusFieldEle.closest(".field");
                fieldEle.getElementsByTagName("label")[0].innerText = statusObj.statusField.fieldLabel;
                fieldEle.classList.remove("is-hidden");
            }
            else {
                statusFieldEle.closest(".field").classList.add("is-hidden");
            }
            var statusField2Ele = document.getElementById("addStatus--statusField2");
            statusField2Ele.value = "";
            if (statusObj && statusObj.statusField2) {
                var fieldEle = statusField2Ele.closest(".field");
                fieldEle.getElementsByTagName("label")[0].innerText = statusObj.statusField2.fieldLabel;
                fieldEle.classList.remove("is-hidden");
            }
            else {
                statusField2Ele.closest(".field").classList.add("is-hidden");
            }
            var resolveTicketEle = document.getElementById("addStatus--resolveTicket");
            resolveTicketEle.checked = false;
            if (statusObj && statusObj.isFinalStatus) {
                resolveTicketEle.closest(".field").classList.remove("is-hidden");
            }
            else {
                resolveTicketEle.closest(".field").classList.add("is-hidden");
            }
        };
        cityssm.openHtmlModal("ticket-addStatus", {
            onshow: function (modalEle) {
                document.getElementById("addStatus--ticketID").value = ticketID;
                pts.getDefaultConfigProperty("parkingTicketStatuses", function (parkingTicketStatuses) {
                    var statusKeyEle = document.getElementById("addStatus--statusKey");
                    for (var index = 0; index < parkingTicketStatuses.length; index += 1) {
                        var statusObj = parkingTicketStatuses[index];
                        if (statusObj.isUserSettable) {
                            statusKeyEle.insertAdjacentHTML("beforeend", "<option value=\"" + statusObj.statusKey + "\">" +
                                statusObj.status +
                                "</option>");
                        }
                    }
                    statusKeyEle.addEventListener("change", statusKeyChangeFn);
                });
                modalEle.getElementsByTagName("form")[0].addEventListener("submit", submitFn);
            },
            onshown: function (_modalEle, closeModalFn) {
                addStatusCloseModalFn = closeModalFn;
            }
        });
    });
    document.getElementById("is-add-paid-status-button").addEventListener("click", function (clickEvent) {
        clickEvent.preventDefault();
        var addPaidStatusCloseModalFn;
        var submitFn = function (formEvent) {
            formEvent.preventDefault();
            var resolveTicket = document.getElementById("addPaidStatus--resolveTicket").checked;
            cityssm.postJSON("/tickets/doAddStatus", formEvent.currentTarget, function (responseJSON) {
                if (responseJSON.success) {
                    addPaidStatusCloseModalFn();
                    if (resolveTicket) {
                        window.location.href = "/tickets/" + ticketID;
                    }
                    else {
                        getStatusesFn();
                    }
                }
            });
        };
        cityssm.openHtmlModal("ticket-addStatusPaid", {
            onshow: function (modalEle) {
                document.getElementById("addPaidStatus--ticketID").value = ticketID;
                var statusFieldEle = document.getElementById("addPaidStatus--statusField");
                var offenceAmount = document.getElementById("ticket--offenceAmount").value;
                var issueDateString = document.getElementById("ticket--issueDateString").value;
                var discountDays = document.getElementById("ticket--discountDays").value;
                if (issueDateString === "" || discountDays === "") {
                    statusFieldEle.value = offenceAmount;
                }
                else {
                    var currentDateString = cityssm.dateToString(new Date());
                    var dateDifference = cityssm.dateStringDifferenceInDays(issueDateString, currentDateString);
                    if (dateDifference <= parseInt(discountDays, 10)) {
                        statusFieldEle.value = document.getElementById("ticket--discountOffenceAmount").value;
                    }
                    else {
                        statusFieldEle.value = offenceAmount;
                    }
                }
                modalEle.getElementsByTagName("form")[0].addEventListener("submit", submitFn);
            },
            onshown: function (_modalEle, closeModalFn) {
                addPaidStatusCloseModalFn = closeModalFn;
            }
        });
    });
    pts.loadDefaultConfigProperties(populateStatusesPanelFn);
}());
