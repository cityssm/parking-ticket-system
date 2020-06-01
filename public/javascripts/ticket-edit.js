"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var ticketID = document.getElementById("ticket--ticketID").value;
    var isCreate = (ticketID === "");
    {
        var formMessageEle_1 = document.getElementById("container--form-message");
        var hasUnsavedChanges_1 = false;
        var setUnsavedChangesFn_1 = function () {
            cityssm.enableNavBlocker();
            hasUnsavedChanges_1 = true;
            formMessageEle_1.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
                "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
                " <span>Unsaved Changes</span>" +
                "</div>";
        };
        var inputEles = document.querySelectorAll(".input, .select, .textarea");
        for (var inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {
            inputEles[inputIndex].addEventListener("change", setUnsavedChangesFn_1);
        }
        document.getElementById("form--ticket").addEventListener("submit", function (formEvent) {
            formEvent.preventDefault();
            var ticketNumber = document.getElementById("ticket--ticketNumber").value;
            formMessageEle_1.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
                "<span>Saving ticket... </span>" +
                " <span class=\"icon\"><i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i></span>" +
                "</div>";
            cityssm.postJSON((isCreate ? "/tickets/doCreateTicket" : "/tickets/doUpdateTicket"), formEvent.currentTarget, function (responseJSON) {
                if (responseJSON.success) {
                    cityssm.disableNavBlocker();
                    hasUnsavedChanges_1 = false;
                    formMessageEle_1.innerHTML = "<span class=\"tag is-light is-success is-medium\">" +
                        "<span class=\"icon\"><i class=\"fas fa-check\" aria-hidden=\"true\"></i></span>" +
                        " <span>Saved Successfully</span>" +
                        "</div>";
                }
                else {
                    setUnsavedChangesFn_1();
                    cityssm.alertModal("Ticket Not Saved", responseJSON.message, "OK", "danger");
                }
                if (responseJSON.success && isCreate) {
                    cityssm.openHtmlModal("ticket-createSuccess", {
                        onshow: function () {
                            document.getElementById("createSuccess--ticketNumber").innerText = ticketNumber;
                            document.getElementById("createSuccess--editTicketButton").setAttribute("href", "/tickets/" + responseJSON.ticketID + "/edit");
                            document.getElementById("createSuccess--newTicketButton").setAttribute("href", "/tickets/new/" + responseJSON.nextTicketNumber);
                        }
                    });
                }
            });
        });
    }
    if (!isCreate) {
        document.getElementById("is-delete-ticket-button").addEventListener("click", function (clickEvent) {
            clickEvent.preventDefault();
            cityssm.confirmModal("Delete Ticket?", "Are you sure you want to delete this ticket record?", "Yes, Delete Ticket", "danger", function () {
                cityssm.postJSON("/tickets/doDeleteTicket", {
                    ticketID: ticketID
                }, function (responseJSON) {
                    if (responseJSON.success) {
                        window.location.href = "/tickets";
                    }
                });
            });
        });
    }
    pts.getDefaultConfigProperty("locationClasses", function (locationClassesList) {
        var locationLookupCloseModalFn;
        var locationClassMap = {};
        var locationList = [];
        for (var index = 0; index < locationClassesList.length; index += 1) {
            var locationClassObj = locationClassesList[index];
            locationClassMap[locationClassObj.locationClassKey] = locationClassObj;
        }
        var setLocationFn = function (clickEvent) {
            clickEvent.preventDefault();
            var locationObj = locationList[parseInt(clickEvent.currentTarget.getAttribute("data-index"))];
            document.getElementById("ticket--locationKey").value = locationObj.locationKey;
            document.getElementById("ticket--locationName").value = locationObj.locationName;
            locationLookupCloseModalFn();
            locationList = [];
        };
        var populateLocationsFn = function () {
            cityssm.postJSON("/offences/doGetAllLocations", {}, function (locationListRes) {
                locationList = locationListRes;
                var listEle = document.createElement("div");
                listEle.className = "list is-hoverable has-margin-bottom-20";
                for (var index = 0; index < locationList.length; index += 1) {
                    var locationObj = locationList[index];
                    var locationClassObj = locationClassMap[locationObj.locationClassKey];
                    var linkEle = document.createElement("a");
                    linkEle.className = "list-item";
                    linkEle.setAttribute("data-index", index.toString());
                    linkEle.setAttribute("href", "#");
                    linkEle.addEventListener("click", setLocationFn);
                    linkEle.innerHTML =
                        "<div class=\"level\">" +
                            "<div class=\"level-left\">" + cityssm.escapeHTML(locationObj.locationName) + "</div>" +
                            (locationClassObj ?
                                "<div class=\"level-right\">" +
                                    "<span class=\"tag is-primary\">" + cityssm.escapeHTML(locationClassObj.locationClass) + "</span>" +
                                    "</div>" :
                                "") +
                            "</div>";
                    listEle.insertAdjacentElement("beforeend", linkEle);
                }
                var containerEle = document.getElementById("container--parkingLocations");
                cityssm.clearElement(containerEle);
                containerEle.insertAdjacentElement("beforeend", listEle);
            });
        };
        var openLocationLookupModalFn = function (clickEvent) {
            clickEvent.preventDefault();
            cityssm.openHtmlModal("location-select", {
                onshown: function (_modalEle, closeModalFn) {
                    locationLookupCloseModalFn = closeModalFn;
                    populateLocationsFn();
                },
                onremoved: function () {
                    document.getElementById("is-location-lookup-button").focus();
                }
            });
        };
        document.getElementById("is-location-lookup-button").addEventListener("click", openLocationLookupModalFn);
        document.getElementById("ticket--locationName").addEventListener("dblclick", openLocationLookupModalFn);
    });
    {
        var bylawLookupCloseModalFn_1;
        var offenceList_1 = [];
        var listItemEles_1 = [];
        var setBylawOffenceFn_1 = function (clickEvent) {
            clickEvent.preventDefault();
            var offenceObj = offenceList_1[parseInt(clickEvent.currentTarget.getAttribute("data-index"))];
            document.getElementById("ticket--bylawNumber").value = offenceObj.bylawNumber;
            var offenceAmountEle = document.getElementById("ticket--offenceAmount");
            offenceAmountEle.classList.add("is-readonly");
            offenceAmountEle.setAttribute("readonly", "readonly");
            offenceAmountEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
                .removeAttribute("disabled");
            offenceAmountEle.value = offenceObj.offenceAmount.toFixed(2);
            document.getElementById("ticket--parkingOffence").value = offenceObj.bylawDescription;
            bylawLookupCloseModalFn_1();
            offenceList_1 = [];
        };
        var populateBylawsFn_1 = function () {
            var locationKey = document.getElementById("ticket--locationKey").value;
            cityssm.postJSON("/offences/doGetOffencesByLocation", {
                locationKey: locationKey
            }, function (offenceListRes) {
                offenceList_1 = offenceListRes;
                var listEle = document.createElement("div");
                listEle.className = "list is-hoverable has-margin-bottom-20";
                for (var index = 0; index < offenceList_1.length; index += 1) {
                    var offenceObj = offenceList_1[index];
                    var linkEle = document.createElement("a");
                    linkEle.className = "list-item";
                    linkEle.setAttribute("data-index", index.toString());
                    linkEle.setAttribute("href", "#");
                    linkEle.addEventListener("click", setBylawOffenceFn_1);
                    linkEle.innerHTML =
                        "<div class=\"columns\">" +
                            ("<div class=\"column\">" +
                                "<span class=\"has-text-weight-semibold\">" + cityssm.escapeHTML(offenceObj.bylawNumber) + "</span><br />" +
                                "<small>" + cityssm.escapeHTML(offenceObj.bylawDescription) + "</small>" +
                                "</div>") +
                            ("<div class=\"column is-narrow has-text-weight-semibold\">" +
                                "$" + offenceObj.offenceAmount.toFixed(2) +
                                "</div>") +
                            "</div>";
                    listEle.insertAdjacentElement("beforeend", linkEle);
                    listItemEles_1.push(linkEle);
                }
                var containerEle = document.getElementById("container--bylawNumbers");
                cityssm.clearElement(containerEle);
                containerEle.appendChild(listEle);
            });
        };
        var filterBylawsFn_1 = function (keyupEvent) {
            var searchStringSplit = keyupEvent.currentTarget.value.trim().toLowerCase().split(" ");
            for (var recordIndex = 0; recordIndex < offenceList_1.length; recordIndex += 1) {
                var displayRecord = true;
                var offenceRecord = offenceList_1[recordIndex];
                for (var searchIndex = 0; searchIndex < searchStringSplit.length; searchIndex += 1) {
                    var searchPiece = searchStringSplit[searchIndex];
                    if (offenceRecord.bylawNumber.toLowerCase().indexOf(searchPiece) === -1 && offenceRecord.bylawDescription.toLowerCase().indexOf(searchPiece) === -1) {
                        displayRecord = false;
                        break;
                    }
                }
                if (displayRecord) {
                    listItemEles_1[recordIndex].classList.remove("is-hidden");
                }
                else {
                    listItemEles_1[recordIndex].classList.add("is-hidden");
                }
            }
        };
        var openBylawLookupModalFn = function (clickEvent) {
            clickEvent.preventDefault();
            cityssm.openHtmlModal("ticket-setBylawOffence", {
                onshown: function (_modalEle, closeModalFn) {
                    bylawLookupCloseModalFn_1 = closeModalFn;
                    populateBylawsFn_1();
                    var searchStringEle = document.getElementById("bylawLookup--searchStr");
                    searchStringEle.focus();
                    searchStringEle.addEventListener("keyup", filterBylawsFn_1);
                },
                onremoved: function () {
                    document.getElementById("is-bylaw-lookup-button").focus();
                }
            });
        };
        document.getElementById("is-bylaw-lookup-button").addEventListener("click", openBylawLookupModalFn);
        document.getElementById("ticket--bylawNumber").addEventListener("dblclick", openBylawLookupModalFn);
    }
    {
        var licencePlateIsMissingCheckboxEle_1 = document.getElementById("ticket--licencePlateIsMissing");
        licencePlateIsMissingCheckboxEle_1.addEventListener("change", function () {
            if (licencePlateIsMissingCheckboxEle_1.checked) {
                document.getElementById("ticket--licencePlateCountry").removeAttribute("required");
                document.getElementById("ticket--licencePlateProvince").removeAttribute("required");
                document.getElementById("ticket--licencePlateNumber").removeAttribute("required");
            }
            else {
                document.getElementById("ticket--licencePlateCountry").setAttribute("required", "required");
                document.getElementById("ticket--licencePlateProvince").setAttribute("required", "required");
                document.getElementById("ticket--licencePlateNumber").setAttribute("required", "required");
            }
        });
    }
    {
        var populateLicencePlateProvinceDatalistFn = function () {
            var datalistEle = document.getElementById("datalist--licencePlateProvince");
            cityssm.clearElement(datalistEle);
            var countryProperties = pts.getLicencePlateCountryProperties(document.getElementById("ticket--licencePlateCountry").value);
            if (countryProperties && countryProperties.provinces) {
                var provincesList = Object.values(countryProperties.provinces);
                for (var index = 0; index < provincesList.length; index += 1) {
                    var optionEle = document.createElement("option");
                    optionEle.setAttribute("value", provincesList[index].provinceShortName);
                    datalistEle.appendChild(optionEle);
                }
            }
        };
        document.getElementById("ticket--licencePlateCountry")
            .addEventListener("change", populateLicencePlateProvinceDatalistFn);
        pts.loadDefaultConfigProperties(populateLicencePlateProvinceDatalistFn);
    }
    var clearPanelFn = function (panelEle) {
        var panelBlockEles = panelEle.getElementsByClassName("panel-block");
        while (panelBlockEles.length > 0) {
            panelBlockEles[0].remove();
        }
    };
    if (!isCreate) {
        var remarkPanelEle_1 = document.getElementById("is-remark-panel");
        var remarkList_1 = exports.ticketRemarks;
        delete exports.ticketRemarks;
        var confirmDeleteRemarkFn_1 = function (clickEvent) {
            var remarkIndex = clickEvent.currentTarget.getAttribute("data-remark-index");
            cityssm.confirmModal("Delete Remark?", "Are you sure you want to delete this remark?", "Yes, Delete", "warning", function () {
                cityssm.postJSON("/tickets/doDeleteRemark", {
                    ticketID: ticketID,
                    remarkIndex: remarkIndex
                }, function (resultJSON) {
                    if (resultJSON.success) {
                        getRemarksFn_1();
                    }
                });
            });
        };
        var openEditRemarkModalFn_1 = function (clickEvent) {
            clickEvent.preventDefault();
            var editRemarkCloseModalFn;
            var index = parseInt(clickEvent.currentTarget.getAttribute("data-index"));
            var remarkObj = remarkList_1[index];
            var submitFn = function (formEvent) {
                formEvent.preventDefault();
                cityssm.postJSON("/tickets/doUpdateRemark", formEvent.currentTarget, function (responseJSON) {
                    if (responseJSON.success) {
                        editRemarkCloseModalFn();
                        getRemarksFn_1();
                    }
                });
            };
            cityssm.openHtmlModal("ticket-editRemark", {
                onshow: function (modalEle) {
                    document.getElementById("editRemark--ticketID").value = ticketID;
                    document.getElementById("editRemark--remarkIndex").value = remarkObj.remarkIndex;
                    document.getElementById("editRemark--remark").value = remarkObj.remark;
                    document.getElementById("editRemark--remarkDateString").value = remarkObj.remarkDateString;
                    document.getElementById("editRemark--remarkTimeString").value = remarkObj.remarkTimeString;
                    modalEle.getElementsByTagName("form")[0].addEventListener("submit", submitFn);
                },
                onshown: function (_modalEle, closeModalFn) {
                    editRemarkCloseModalFn = closeModalFn;
                }
            });
        };
        var populateRemarksPanelFn_1 = function () {
            clearPanelFn(remarkPanelEle_1);
            if (remarkList_1.length === 0) {
                remarkPanelEle_1.insertAdjacentHTML("beforeend", "<div class=\"panel-block is-block\">" +
                    "<div class=\"message is-info\">" +
                    "<p class=\"message-body\">" +
                    "There are no remarks associated with this ticket." +
                    "</p>" +
                    "</div>" +
                    "</div>");
                return;
            }
            for (var index = 0; index < remarkList_1.length; index += 1) {
                var remarkObj = remarkList_1[index];
                var panelBlockEle = document.createElement("div");
                panelBlockEle.className = "panel-block is-block";
                panelBlockEle.innerHTML = "<div class=\"columns\">" +
                    ("<div class=\"column\">" +
                        "<p class=\"has-newline-chars\">" +
                        cityssm.escapeHTML(remarkObj.remark) +
                        "</p>" +
                        "<p class=\"is-size-7\">" +
                        (remarkObj.recordCreate_timeMillis === remarkObj.recordUpdate_timeMillis ?
                            "" :
                            "<i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i> ") +
                        remarkObj.recordUpdate_userName + " - " +
                        remarkObj.remarkDateString + " " + remarkObj.remarkTimeString +
                        "</p>" +
                        "</div>") +
                    (remarkObj.canUpdate ?
                        "<div class=\"column is-narrow\">" +
                            "<div class=\"buttons is-right has-addons\">" +
                            ("<button class=\"button is-small is-edit-remark-button\"" +
                                " data-tooltip=\"Edit Remark\" data-index=\"" + index + "\" type=\"button\">" +
                                "<span class=\"icon is-small\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                                " <span>Edit</span>" +
                                "</button>") +
                            ("<button class=\"button is-small has-text-danger is-delete-remark-button\"" +
                                " data-tooltip=\"Delete Remark\" data-remark-index=\"" + remarkObj.remarkIndex + "\" type=\"button\">" +
                                "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
                                "<span class=\"sr-only\">Delete</span>" +
                                "</button>") +
                            "</div>" +
                            "</div>" :
                        "") +
                    "</div>";
                if (remarkObj.canUpdate) {
                    panelBlockEle.getElementsByClassName("is-edit-remark-button")[0]
                        .addEventListener("click", openEditRemarkModalFn_1);
                    panelBlockEle.getElementsByClassName("is-delete-remark-button")[0]
                        .addEventListener("click", confirmDeleteRemarkFn_1);
                }
                remarkPanelEle_1.appendChild(panelBlockEle);
            }
        };
        var getRemarksFn_1 = function () {
            clearPanelFn(remarkPanelEle_1);
            remarkPanelEle_1.insertAdjacentHTML("beforeend", "<div class=\"panel-block is-block\">" +
                "<p class=\"has-text-centered has-text-grey-lighter\">" +
                "<i class=\"fas fa-2x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
                "<em>Loading remarks..." +
                "</p>" +
                "</div>");
            cityssm.postJSON("/tickets/doGetRemarks", {
                ticketID: ticketID
            }, function (resultList) {
                remarkList_1 = resultList;
                populateRemarksPanelFn_1();
            });
        };
        document.getElementById("is-add-remark-button").addEventListener("click", function (clickEvent) {
            clickEvent.preventDefault();
            var addRemarkCloseModalFn;
            var submitFn = function (formEvent) {
                formEvent.preventDefault();
                cityssm.postJSON("/tickets/doAddRemark", formEvent.currentTarget, function (responseJSON) {
                    if (responseJSON.success) {
                        addRemarkCloseModalFn();
                        getRemarksFn_1();
                    }
                });
            };
            cityssm.openHtmlModal("ticket-addRemark", {
                onshow: function (modalEle) {
                    document.getElementById("addRemark--ticketID").value = ticketID;
                    modalEle.getElementsByTagName("form")[0].addEventListener("submit", submitFn);
                },
                onshown: function (_modalEle, closeModalFn) {
                    addRemarkCloseModalFn = closeModalFn;
                }
            });
        });
        populateRemarksPanelFn_1();
    }
    if (!isCreate) {
        var statusPanelEle_1 = document.getElementById("is-status-panel");
        var statusList_1 = exports.ticketStatusLog;
        delete exports.ticketStatusLog;
        var confirmResolveTicketFn_1 = function (clickEvent) {
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
        var confirmDeleteStatusFn_1 = function (clickEvent) {
            var statusIndex = clickEvent.currentTarget.getAttribute("data-status-index");
            cityssm.confirmModal("Delete Remark?", "Are you sure you want to delete this status?", "Yes, Delete", "warning", function () {
                cityssm.postJSON("/tickets/doDeleteStatus", {
                    ticketID: ticketID,
                    statusIndex: statusIndex
                }, function (resultJSON) {
                    if (resultJSON.success) {
                        getStatusesFn_1();
                    }
                });
            });
        };
        var openEditStatusModalFn_1 = function (clickEvent) {
            clickEvent.preventDefault();
            var editStatusCloseModalFn;
            var index = parseInt(clickEvent.currentTarget.getAttribute("data-index"));
            var statusObj = statusList_1[index];
            var submitFn = function (formEvent) {
                formEvent.preventDefault();
                cityssm.postJSON("/tickets/doUpdateStatus", formEvent.currentTarget, function (responseJSON) {
                    if (responseJSON.success) {
                        editStatusCloseModalFn();
                        getStatusesFn_1();
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
            };
            cityssm.openHtmlModal("ticket-editStatus", {
                onshow: function (modalEle) {
                    document.getElementById("editStatus--ticketID").value = ticketID;
                    document.getElementById("editStatus--statusIndex").value = statusObj.statusIndex;
                    document.getElementById("editStatus--statusField").value = statusObj.statusField;
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
        var populateStatusesPanelFn_1 = function () {
            clearPanelFn(statusPanelEle_1);
            if (statusList_1.length === 0) {
                statusPanelEle_1.insertAdjacentHTML("beforeend", "<div class=\"panel-block is-block\">" +
                    "<div class=\"message is-info\">" +
                    "<p class=\"message-body\">" +
                    "There are no statuses associated with this ticket." +
                    "</p>" +
                    "</div>" +
                    "</div>");
                return;
            }
            for (var index = 0; index < statusList_1.length; index += 1) {
                var statusObj = statusList_1[index];
                var statusDefinitionObj = pts.getTicketStatus(statusObj.statusKey);
                if (index === 0 && statusDefinitionObj && statusDefinitionObj.isFinalStatus) {
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
                    finalizePanelBlockEle.getElementsByTagName("button")[0].addEventListener("click", confirmResolveTicketFn_1);
                    statusPanelEle_1.appendChild(finalizePanelBlockEle);
                }
                var panelBlockEle = document.createElement("div");
                panelBlockEle.className = "panel-block is-block";
                panelBlockEle.innerHTML = "<div class=\"columns\">" +
                    ("<div class=\"column\">" +
                        ("<div class=\"level has-margin-bottom-5\">" +
                            "<div class=\"level-left\">" +
                            "<strong>" + (statusDefinitionObj ? statusDefinitionObj.status : statusObj.statusKey) + "</strong>" +
                            "</div>" +
                            "<div class=\"level-right\">" + statusObj.statusDateString + "</div>" +
                            "</div>") +
                        (statusObj.statusField === "" ?
                            "" :
                            "<p class=\"is-size-7\">" +
                                "<strong>" +
                                (statusDefinitionObj && statusDefinitionObj.statusField ?
                                    statusDefinitionObj.statusField.fieldLabel :
                                    "") +
                                ":</strong> " +
                                statusObj.statusField +
                                "</p>") +
                        "<p class=\"has-newline-chars is-size-7\">" + statusObj.statusNote + "</p>" +
                        "</div>") +
                    (statusObj.canUpdate && index === 0 ?
                        "<div class=\"column is-narrow\">" +
                            "<div class=\"buttons is-right has-addons\">" +
                            "<button class=\"button is-small is-edit-status-button\" data-tooltip=\"Edit Status\" data-index=\"" + index + "\" type=\"button\">" +
                            "<span class=\"icon is-small\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                            " <span>Edit</span>" +
                            "</button>" +
                            "<button class=\"button is-small has-text-danger is-delete-status-button\" data-tooltip=\"Delete Status\" data-status-index=\"" + statusObj.statusIndex + "\" type=\"button\">" +
                            "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
                            "<span class=\"sr-only\">Delete</span>" +
                            "</button>" +
                            "</div>" +
                            "</div>" :
                        "") +
                    "</div>";
                if (statusObj.canUpdate && index === 0) {
                    panelBlockEle.getElementsByClassName("is-edit-status-button")[0]
                        .addEventListener("click", openEditStatusModalFn_1);
                    panelBlockEle.getElementsByClassName("is-delete-status-button")[0]
                        .addEventListener("click", confirmDeleteStatusFn_1);
                }
                statusPanelEle_1.appendChild(panelBlockEle);
            }
        };
        var getStatusesFn_1 = function () {
            clearPanelFn(statusPanelEle_1);
            statusPanelEle_1.insertAdjacentHTML("beforeend", "<div class=\"panel-block is-block\">" +
                "<p class=\"has-text-centered has-text-grey-lighter\">" +
                "<i class=\"fas fa-2x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
                "<em>Loading statuses..." +
                "</p>" +
                "</div>");
            cityssm.postJSON("/tickets/doGetStatuses", {
                ticketID: ticketID
            }, function (resultList) {
                statusList_1 = resultList;
                populateStatusesPanelFn_1();
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
                            getStatusesFn_1();
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
        pts.loadDefaultConfigProperties(populateStatusesPanelFn_1);
    }
    {
        var unlockFieldFn = function (unlockBtnClickEvent) {
            unlockBtnClickEvent.preventDefault();
            var unlockBtnEle = unlockBtnClickEvent.currentTarget;
            var inputTag = unlockBtnEle.getAttribute("data-unlock");
            var readOnlyEle = unlockBtnEle.closest(".field").getElementsByTagName(inputTag)[0];
            readOnlyEle.removeAttribute("readonly");
            readOnlyEle.classList.remove("is-readonly");
            readOnlyEle.focus();
            unlockBtnEle.setAttribute("disabled", "disabled");
        };
        var unlockBtnEles = document.getElementsByClassName("is-unlock-field-button");
        for (var buttonIndex = 0; buttonIndex < unlockBtnEles.length; buttonIndex += 1) {
            unlockBtnEles[buttonIndex].addEventListener("click", unlockFieldFn);
        }
    }
}());
