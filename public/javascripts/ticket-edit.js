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
        var clearLocationFn = function (clickEvent) {
            clickEvent.preventDefault();
            document.getElementById("ticket--locationKey").value = "";
            document.getElementById("ticket--locationName").value = "";
            locationLookupCloseModalFn();
            locationList = [];
        };
        var setLocationFn = function (clickEvent) {
            clickEvent.preventDefault();
            var locationObj = locationList[parseInt(clickEvent.currentTarget.getAttribute("data-index"), 10)];
            document.getElementById("ticket--locationKey").value = locationObj.locationKey;
            document.getElementById("ticket--locationName").value = locationObj.locationName;
            locationLookupCloseModalFn();
            locationList = [];
        };
        var populateLocationsFn = function () {
            cityssm.postJSON("/offences/doGetAllLocations", {}, function (locationListRes) {
                locationList = locationListRes;
                var listEle = document.createElement("div");
                listEle.className = "panel mb-4";
                for (var index = 0; index < locationList.length; index += 1) {
                    var locationObj = locationList[index];
                    var locationClassObj = locationClassMap[locationObj.locationClassKey];
                    var linkEle = document.createElement("a");
                    linkEle.className = "panel-block is-block";
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
            cityssm.openHtmlModal("ticket-setLocation", {
                onshown: function (_modalEle, closeModalFn) {
                    locationLookupCloseModalFn = closeModalFn;
                    populateLocationsFn();
                    document.getElementById("is-clear-location-button").addEventListener("click", clearLocationFn);
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
        var clearBylawOffenceFn_1 = function (clickEvent) {
            clickEvent.preventDefault();
            document.getElementById("ticket--bylawNumber").value = "";
            var offenceAmountEle = document.getElementById("ticket--offenceAmount");
            offenceAmountEle.classList.add("is-readonly");
            offenceAmountEle.setAttribute("readonly", "readonly");
            offenceAmountEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
                .removeAttribute("disabled");
            offenceAmountEle.value = "";
            var discountOffenceAmountEle = document.getElementById("ticket--discountOffenceAmount");
            discountOffenceAmountEle.classList.add("is-readonly");
            discountOffenceAmountEle.setAttribute("readonly", "readonly");
            discountOffenceAmountEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
                .removeAttribute("disabled");
            discountOffenceAmountEle.value = "";
            var discountDaysEle = document.getElementById("ticket--discountDays");
            discountDaysEle.classList.add("is-readonly");
            discountDaysEle.setAttribute("readonly", "readonly");
            discountDaysEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
                .removeAttribute("disabled");
            discountDaysEle.value = "";
            document.getElementById("ticket--parkingOffence").value = "";
            bylawLookupCloseModalFn_1();
            offenceList_1 = [];
        };
        var setBylawOffenceFn_1 = function (clickEvent) {
            clickEvent.preventDefault();
            var offenceObj = offenceList_1[parseInt(clickEvent.currentTarget.getAttribute("data-index"), 10)];
            document.getElementById("ticket--bylawNumber").value = offenceObj.bylawNumber;
            var offenceAmountEle = document.getElementById("ticket--offenceAmount");
            offenceAmountEle.classList.add("is-readonly");
            offenceAmountEle.setAttribute("readonly", "readonly");
            offenceAmountEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
                .removeAttribute("disabled");
            offenceAmountEle.value = offenceObj.offenceAmount.toFixed(2);
            var discountOffenceAmountEle = document.getElementById("ticket--discountOffenceAmount");
            discountOffenceAmountEle.classList.add("is-readonly");
            discountOffenceAmountEle.setAttribute("readonly", "readonly");
            discountOffenceAmountEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
                .removeAttribute("disabled");
            discountOffenceAmountEle.value = offenceObj.discountOffenceAmount.toFixed(2);
            var discountDaysEle = document.getElementById("ticket--discountDays");
            discountDaysEle.classList.add("is-readonly");
            discountDaysEle.setAttribute("readonly", "readonly");
            discountDaysEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
                .removeAttribute("disabled");
            discountDaysEle.value = offenceObj.discountDays.toString();
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
                listEle.className = "panel mb-4";
                for (var index = 0; index < offenceList_1.length; index += 1) {
                    var offenceObj = offenceList_1[index];
                    var linkEle = document.createElement("a");
                    linkEle.className = "panel-block is-block";
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
                    document.getElementById("is-clear-bylaw-button").addEventListener("click", clearBylawOffenceFn_1);
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
