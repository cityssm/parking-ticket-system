"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    const ticketID = document.getElementById("ticket--ticketID").value;
    const isCreate = (ticketID === "");
    {
        const formMessageEle = document.getElementById("container--form-message");
        let hasUnsavedChanges = false;
        const setUnsavedChangesFn = function () {
            cityssm.enableNavBlocker();
            hasUnsavedChanges = true;
            formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
                "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
                " <span>Unsaved Changes</span>" +
                "</div>";
        };
        const inputEles = document.querySelectorAll(".input, .select, .textarea");
        for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {
            inputEles[inputIndex].addEventListener("change", setUnsavedChangesFn);
        }
        document.getElementById("form--ticket").addEventListener("submit", function (formEvent) {
            formEvent.preventDefault();
            const ticketNumber = document.getElementById("ticket--ticketNumber").value;
            formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
                "<span>Saving ticket... </span>" +
                " <span class=\"icon\"><i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i></span>" +
                "</div>";
            cityssm.postJSON((isCreate ? "/tickets/doCreateTicket" : "/tickets/doUpdateTicket"), formEvent.currentTarget, function (responseJSON) {
                if (responseJSON.success) {
                    cityssm.disableNavBlocker();
                    hasUnsavedChanges = false;
                    formMessageEle.innerHTML = "<span class=\"tag is-light is-success is-medium\">" +
                        "<span class=\"icon\"><i class=\"fas fa-check\" aria-hidden=\"true\"></i></span>" +
                        " <span>Saved Successfully</span>" +
                        "</div>";
                }
                else {
                    setUnsavedChangesFn();
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
        let locationLookupCloseModalFn;
        const locationClassMap = {};
        let locationList = [];
        for (let index = 0; index < locationClassesList.length; index += 1) {
            const locationClassObj = locationClassesList[index];
            locationClassMap[locationClassObj.locationClassKey] = locationClassObj;
        }
        const clearLocationFn = function (clickEvent) {
            clickEvent.preventDefault();
            document.getElementById("ticket--locationKey").value = "";
            document.getElementById("ticket--locationName").value = "";
            locationLookupCloseModalFn();
            locationList = [];
        };
        const setLocationFn = function (clickEvent) {
            clickEvent.preventDefault();
            const locationObj = locationList[parseInt(clickEvent.currentTarget.getAttribute("data-index"), 10)];
            document.getElementById("ticket--locationKey").value = locationObj.locationKey;
            document.getElementById("ticket--locationName").value = locationObj.locationName;
            locationLookupCloseModalFn();
            locationList = [];
        };
        const populateLocationsFn = function () {
            cityssm.postJSON("/offences/doGetAllLocations", {}, function (locationListRes) {
                locationList = locationListRes;
                const listEle = document.createElement("div");
                listEle.className = "panel mb-4";
                for (let index = 0; index < locationList.length; index += 1) {
                    const locationObj = locationList[index];
                    const locationClassObj = locationClassMap[locationObj.locationClassKey];
                    const linkEle = document.createElement("a");
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
                const containerEle = document.getElementById("container--parkingLocations");
                cityssm.clearElement(containerEle);
                containerEle.insertAdjacentElement("beforeend", listEle);
            });
        };
        const openLocationLookupModalFn = function (clickEvent) {
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
        let bylawLookupCloseModalFn;
        let offenceList = [];
        let listItemEles = [];
        const clearBylawOffenceFn = function (clickEvent) {
            clickEvent.preventDefault();
            document.getElementById("ticket--bylawNumber").value = "";
            const offenceAmountEle = document.getElementById("ticket--offenceAmount");
            offenceAmountEle.classList.add("is-readonly");
            offenceAmountEle.setAttribute("readonly", "readonly");
            offenceAmountEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
                .removeAttribute("disabled");
            offenceAmountEle.value = "";
            const discountOffenceAmountEle = document.getElementById("ticket--discountOffenceAmount");
            discountOffenceAmountEle.classList.add("is-readonly");
            discountOffenceAmountEle.setAttribute("readonly", "readonly");
            discountOffenceAmountEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
                .removeAttribute("disabled");
            discountOffenceAmountEle.value = "";
            const discountDaysEle = document.getElementById("ticket--discountDays");
            discountDaysEle.classList.add("is-readonly");
            discountDaysEle.setAttribute("readonly", "readonly");
            discountDaysEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
                .removeAttribute("disabled");
            discountDaysEle.value = "";
            document.getElementById("ticket--parkingOffence").value = "";
            bylawLookupCloseModalFn();
            offenceList = [];
        };
        const setBylawOffenceFn = function (clickEvent) {
            clickEvent.preventDefault();
            const offenceObj = offenceList[parseInt(clickEvent.currentTarget.getAttribute("data-index"), 10)];
            document.getElementById("ticket--bylawNumber").value = offenceObj.bylawNumber;
            const offenceAmountEle = document.getElementById("ticket--offenceAmount");
            offenceAmountEle.classList.add("is-readonly");
            offenceAmountEle.setAttribute("readonly", "readonly");
            offenceAmountEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
                .removeAttribute("disabled");
            offenceAmountEle.value = offenceObj.offenceAmount.toFixed(2);
            const discountOffenceAmountEle = document.getElementById("ticket--discountOffenceAmount");
            discountOffenceAmountEle.classList.add("is-readonly");
            discountOffenceAmountEle.setAttribute("readonly", "readonly");
            discountOffenceAmountEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
                .removeAttribute("disabled");
            discountOffenceAmountEle.value = offenceObj.discountOffenceAmount.toFixed(2);
            const discountDaysEle = document.getElementById("ticket--discountDays");
            discountDaysEle.classList.add("is-readonly");
            discountDaysEle.setAttribute("readonly", "readonly");
            discountDaysEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
                .removeAttribute("disabled");
            discountDaysEle.value = offenceObj.discountDays.toString();
            document.getElementById("ticket--parkingOffence").value = offenceObj.bylawDescription;
            bylawLookupCloseModalFn();
            offenceList = [];
        };
        const populateBylawsFn = function () {
            const locationKey = document.getElementById("ticket--locationKey").value;
            cityssm.postJSON("/offences/doGetOffencesByLocation", {
                locationKey: locationKey
            }, function (offenceListRes) {
                offenceList = offenceListRes;
                const listEle = document.createElement("div");
                listEle.className = "panel mb-4";
                for (let index = 0; index < offenceList.length; index += 1) {
                    const offenceObj = offenceList[index];
                    const linkEle = document.createElement("a");
                    linkEle.className = "panel-block is-block";
                    linkEle.setAttribute("data-index", index.toString());
                    linkEle.setAttribute("href", "#");
                    linkEle.addEventListener("click", setBylawOffenceFn);
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
                    listItemEles.push(linkEle);
                }
                const containerEle = document.getElementById("container--bylawNumbers");
                cityssm.clearElement(containerEle);
                containerEle.appendChild(listEle);
            });
        };
        const filterBylawsFn = function (keyupEvent) {
            const searchStringSplit = keyupEvent.currentTarget.value.trim().toLowerCase().split(" ");
            for (let recordIndex = 0; recordIndex < offenceList.length; recordIndex += 1) {
                let displayRecord = true;
                const offenceRecord = offenceList[recordIndex];
                for (let searchIndex = 0; searchIndex < searchStringSplit.length; searchIndex += 1) {
                    const searchPiece = searchStringSplit[searchIndex];
                    if (offenceRecord.bylawNumber.toLowerCase().indexOf(searchPiece) === -1 && offenceRecord.bylawDescription.toLowerCase().indexOf(searchPiece) === -1) {
                        displayRecord = false;
                        break;
                    }
                }
                if (displayRecord) {
                    listItemEles[recordIndex].classList.remove("is-hidden");
                }
                else {
                    listItemEles[recordIndex].classList.add("is-hidden");
                }
            }
        };
        const openBylawLookupModalFn = function (clickEvent) {
            clickEvent.preventDefault();
            cityssm.openHtmlModal("ticket-setBylawOffence", {
                onshown: function (_modalEle, closeModalFn) {
                    bylawLookupCloseModalFn = closeModalFn;
                    populateBylawsFn();
                    const searchStringEle = document.getElementById("bylawLookup--searchStr");
                    searchStringEle.focus();
                    searchStringEle.addEventListener("keyup", filterBylawsFn);
                    document.getElementById("is-clear-bylaw-button").addEventListener("click", clearBylawOffenceFn);
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
        const licencePlateIsMissingCheckboxEle = document.getElementById("ticket--licencePlateIsMissing");
        licencePlateIsMissingCheckboxEle.addEventListener("change", function () {
            if (licencePlateIsMissingCheckboxEle.checked) {
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
        const populateLicencePlateProvinceDatalistFn = function () {
            const datalistEle = document.getElementById("datalist--licencePlateProvince");
            cityssm.clearElement(datalistEle);
            const countryProperties = pts.getLicencePlateCountryProperties(document.getElementById("ticket--licencePlateCountry").value);
            if (countryProperties && countryProperties.provinces) {
                const provincesList = Object.values(countryProperties.provinces);
                for (let index = 0; index < provincesList.length; index += 1) {
                    const optionEle = document.createElement("option");
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
        const unlockFieldFn = function (unlockBtnClickEvent) {
            unlockBtnClickEvent.preventDefault();
            const unlockBtnEle = unlockBtnClickEvent.currentTarget;
            const inputTag = unlockBtnEle.getAttribute("data-unlock");
            const readOnlyEle = unlockBtnEle.closest(".field").getElementsByTagName(inputTag)[0];
            readOnlyEle.removeAttribute("readonly");
            readOnlyEle.classList.remove("is-readonly");
            readOnlyEle.focus();
            unlockBtnEle.setAttribute("disabled", "disabled");
        };
        const unlockBtnEles = document.getElementsByClassName("is-unlock-field-button");
        for (let buttonIndex = 0; buttonIndex < unlockBtnEles.length; buttonIndex += 1) {
            unlockBtnEles[buttonIndex].addEventListener("click", unlockFieldFn);
        }
    }
}());
