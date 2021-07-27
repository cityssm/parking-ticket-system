"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const ticketID = document.querySelector("#ticket--ticketID").value;
    const isCreate = (ticketID === "");
    const formMessageElement = document.querySelector("#container--form-message");
    const setUnsavedChangesFunction = () => {
        cityssm.enableNavBlocker();
        formMessageElement.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
            "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
            " <span>Unsaved Changes</span>" +
            "</div>";
    };
    const inputElements = document.querySelectorAll(".input, .select, .textarea");
    for (const inputElement of inputElements) {
        inputElement.addEventListener("change", setUnsavedChangesFunction);
    }
    document.querySelector("#form--ticket").addEventListener("submit", (formEvent) => {
        formEvent.preventDefault();
        const ticketNumber = document.querySelector("#ticket--ticketNumber").value;
        formMessageElement.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
            "<span>Saving ticket... </span>" +
            " <span class=\"icon\"><i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i></span>" +
            "</div>";
        cityssm.postJSON((isCreate ? "/tickets/doCreateTicket" : "/tickets/doUpdateTicket"), formEvent.currentTarget, (responseJSON) => {
            if (responseJSON.success) {
                cityssm.disableNavBlocker();
                formMessageElement.innerHTML = "<span class=\"tag is-light is-success is-medium\">" +
                    "<span class=\"icon\"><i class=\"fas fa-check\" aria-hidden=\"true\"></i></span>" +
                    " <span>Saved Successfully</span>" +
                    "</div>";
            }
            else {
                setUnsavedChangesFunction();
                cityssm.alertModal("Ticket Not Saved", responseJSON.message, "OK", "danger");
            }
            if (responseJSON.success && isCreate) {
                cityssm.openHtmlModal("ticket-createSuccess", {
                    onshow() {
                        document.querySelector("#createSuccess--ticketNumber").textContent = ticketNumber;
                        document.querySelector("#createSuccess--editTicketButton").setAttribute("href", "/tickets/" + responseJSON.ticketID.toString() + "/edit");
                        document.querySelector("#createSuccess--newTicketButton").setAttribute("href", "/tickets/new/" + responseJSON.nextTicketNumber);
                    }
                });
            }
        });
    });
    if (!isCreate) {
        document.querySelector("#is-delete-ticket-button").addEventListener("click", (clickEvent) => {
            clickEvent.preventDefault();
            cityssm.confirmModal("Delete Ticket?", "Are you sure you want to delete this ticket record?", "Yes, Delete Ticket", "danger", () => {
                cityssm.postJSON("/tickets/doDeleteTicket", {
                    ticketID
                }, (responseJSON) => {
                    if (responseJSON.success) {
                        window.location.href = "/tickets";
                    }
                });
            });
        });
    }
    pts.getDefaultConfigProperty("locationClasses", () => {
        let locationLookupCloseModalFunction;
        let locationList = [];
        const clearLocationFunction = (clickEvent) => {
            clickEvent.preventDefault();
            document.querySelector("#ticket--locationKey").value = "";
            document.querySelector("#ticket--locationName").value = "";
            locationLookupCloseModalFunction();
            locationList = [];
        };
        const setLocationFunction = (clickEvent) => {
            clickEvent.preventDefault();
            const locationObject = locationList[Number.parseInt(clickEvent.currentTarget.dataset.index, 10)];
            document.querySelector("#ticket--locationKey").value = locationObject.locationKey;
            document.querySelector("#ticket--locationName").value = locationObject.locationName;
            locationLookupCloseModalFunction();
            locationList = [];
        };
        const populateLocationsFunction = () => {
            cityssm.postJSON("/offences/doGetAllLocations", {}, (locationListResponse) => {
                locationList = locationListResponse;
                const listElement = document.createElement("div");
                listElement.className = "panel mb-4";
                for (const [index, locationObject] of locationList.entries()) {
                    const locationClassObject = pts.getLocationClass(locationObject.locationClassKey);
                    const linkElement = document.createElement("a");
                    linkElement.className = "panel-block is-block";
                    linkElement.dataset.index = index.toString();
                    linkElement.setAttribute("href", "#");
                    linkElement.addEventListener("click", setLocationFunction);
                    linkElement.innerHTML =
                        "<div class=\"level\">" +
                            "<div class=\"level-left\">" + cityssm.escapeHTML(locationObject.locationName) + "</div>" +
                            (locationClassObject
                                ? "<div class=\"level-right\">" +
                                    "<span class=\"tag is-primary\">" + cityssm.escapeHTML(locationClassObject.locationClass) + "</span>" +
                                    "</div>"
                                : "") +
                            "</div>";
                    listElement.append(linkElement);
                }
                const containerElement = document.querySelector("#container--parkingLocations");
                cityssm.clearElement(containerElement);
                containerElement.append(listElement);
            });
        };
        const openLocationLookupModalFunction = (clickEvent) => {
            clickEvent.preventDefault();
            cityssm.openHtmlModal("ticket-setLocation", {
                onshown(_modalElement, closeModalFunction) {
                    locationLookupCloseModalFunction = closeModalFunction;
                    populateLocationsFunction();
                    document.querySelector("#is-clear-location-button").addEventListener("click", clearLocationFunction);
                },
                onremoved() {
                    document.querySelector("#is-location-lookup-button").focus();
                }
            });
        };
        document.querySelector("#is-location-lookup-button").addEventListener("click", openLocationLookupModalFunction);
        document.querySelector("#ticket--locationName").addEventListener("dblclick", openLocationLookupModalFunction);
    });
    {
        let bylawLookupCloseModalFunction;
        let offenceList = [];
        let listItemElements = [];
        const clearBylawOffenceFunction = (clickEvent) => {
            clickEvent.preventDefault();
            document.querySelector("#ticket--bylawNumber").value = "";
            const offenceAmountElement = document.querySelector("#ticket--offenceAmount");
            offenceAmountElement.classList.add("is-readonly");
            offenceAmountElement.setAttribute("readonly", "readonly");
            offenceAmountElement.closest(".field").querySelector(".is-unlock-field-button")
                .removeAttribute("disabled");
            offenceAmountElement.value = "";
            const discountOffenceAmountElement = document.querySelector("#ticket--discountOffenceAmount");
            discountOffenceAmountElement.classList.add("is-readonly");
            discountOffenceAmountElement.setAttribute("readonly", "readonly");
            discountOffenceAmountElement.closest(".field").querySelector(".is-unlock-field-button")
                .removeAttribute("disabled");
            discountOffenceAmountElement.value = "";
            const discountDaysElement = document.querySelector("#ticket--discountDays");
            discountDaysElement.classList.add("is-readonly");
            discountDaysElement.setAttribute("readonly", "readonly");
            discountDaysElement.closest(".field").querySelector(".is-unlock-field-button")
                .removeAttribute("disabled");
            discountDaysElement.value = "";
            document.querySelector("#ticket--parkingOffence").value = "";
            bylawLookupCloseModalFunction();
            offenceList = [];
        };
        const setBylawOffenceFunction = (clickEvent) => {
            clickEvent.preventDefault();
            const offenceObject = offenceList[Number.parseInt(clickEvent.currentTarget.getAttribute("data-index"), 10)];
            document.querySelector("#ticket--bylawNumber").value = offenceObject.bylawNumber;
            const offenceAmountElement = document.querySelector("#ticket--offenceAmount");
            offenceAmountElement.classList.add("is-readonly");
            offenceAmountElement.setAttribute("readonly", "readonly");
            offenceAmountElement.closest(".field").querySelector(".is-unlock-field-button").removeAttribute("disabled");
            offenceAmountElement.value = offenceObject.offenceAmount.toFixed(2);
            const discountOffenceAmountElement = document.querySelector("#ticket--discountOffenceAmount");
            discountOffenceAmountElement.classList.add("is-readonly");
            discountOffenceAmountElement.setAttribute("readonly", "readonly");
            discountOffenceAmountElement.closest(".field").querySelector(".is-unlock-field-button").removeAttribute("disabled");
            discountOffenceAmountElement.value = offenceObject.discountOffenceAmount.toFixed(2);
            const discountDaysElement = document.querySelector("#ticket--discountDays");
            discountDaysElement.classList.add("is-readonly");
            discountDaysElement.setAttribute("readonly", "readonly");
            discountDaysElement.closest(".field").querySelector(".is-unlock-field-button").removeAttribute("disabled");
            discountDaysElement.value = offenceObject.discountDays.toString();
            document.querySelector("#ticket--parkingOffence").value = offenceObject.bylawDescription;
            bylawLookupCloseModalFunction();
            offenceList = [];
        };
        const populateBylawsFunction = () => {
            const locationKey = document.querySelector("#ticket--locationKey").value;
            cityssm.postJSON("/offences/doGetOffencesByLocation", {
                locationKey
            }, (offenceListResponse) => {
                offenceList = offenceListResponse;
                listItemElements = [];
                const listElement = document.createElement("div");
                listElement.className = "panel mb-4";
                for (const [index, offenceObject] of offenceList.entries()) {
                    const linkElement = document.createElement("a");
                    linkElement.className = "panel-block is-block";
                    linkElement.dataset.index = index.toString();
                    linkElement.setAttribute("href", "#");
                    linkElement.addEventListener("click", setBylawOffenceFunction);
                    linkElement.innerHTML =
                        "<div class=\"columns\">" +
                            ("<div class=\"column\">" +
                                "<span class=\"has-text-weight-semibold\">" +
                                cityssm.escapeHTML(offenceObject.bylawNumber) +
                                "</span><br />" +
                                "<small>" + cityssm.escapeHTML(offenceObject.bylawDescription) + "</small>" +
                                "</div>") +
                            ("<div class=\"column is-narrow has-text-weight-semibold\">" +
                                "$" + offenceObject.offenceAmount.toFixed(2) +
                                "</div>") +
                            "</div>";
                    listElement.append(linkElement);
                    listItemElements.push(linkElement);
                }
                const containerElement = document.querySelector("#container--bylawNumbers");
                cityssm.clearElement(containerElement);
                containerElement.append(listElement);
            });
        };
        const filterBylawsFunction = (keyupEvent) => {
            const searchStringSplit = keyupEvent.currentTarget.value.trim().toLowerCase().split(" ");
            for (const [recordIndex, offenceRecord] of offenceList.entries()) {
                let displayRecord = true;
                for (const searchPiece of searchStringSplit) {
                    if (!offenceRecord.bylawNumber.toLowerCase().includes(searchPiece) &&
                        !offenceRecord.bylawDescription.toLowerCase().includes(searchPiece)) {
                        displayRecord = false;
                        break;
                    }
                }
                if (displayRecord) {
                    listItemElements[recordIndex].classList.remove("is-hidden");
                }
                else {
                    listItemElements[recordIndex].classList.add("is-hidden");
                }
            }
        };
        const openBylawLookupModalFunction = (clickEvent) => {
            clickEvent.preventDefault();
            cityssm.openHtmlModal("ticket-setBylawOffence", {
                onshown(_modalElement, closeModalFunction) {
                    bylawLookupCloseModalFunction = closeModalFunction;
                    populateBylawsFunction();
                    const searchStringElement = document.querySelector("#bylawLookup--searchStr");
                    searchStringElement.focus();
                    searchStringElement.addEventListener("keyup", filterBylawsFunction);
                    document.querySelector("#is-clear-bylaw-button").addEventListener("click", clearBylawOffenceFunction);
                },
                onremoved() {
                    document.querySelector("#is-bylaw-lookup-button").focus();
                }
            });
        };
        document.querySelector("#is-bylaw-lookup-button").addEventListener("click", openBylawLookupModalFunction);
        document.querySelector("#ticket--bylawNumber").addEventListener("dblclick", openBylawLookupModalFunction);
    }
    {
        const licencePlateIsMissingCheckboxElement = document.querySelector("#ticket--licencePlateIsMissing");
        licencePlateIsMissingCheckboxElement.addEventListener("change", () => {
            if (licencePlateIsMissingCheckboxElement.checked) {
                document.querySelector("#ticket--licencePlateCountry").removeAttribute("required");
                document.querySelector("#ticket--licencePlateProvince").removeAttribute("required");
                document.querySelector("#ticket--licencePlateNumber").removeAttribute("required");
            }
            else {
                document.querySelector("#ticket--licencePlateCountry").setAttribute("required", "required");
                document.querySelector("#ticket--licencePlateProvince").setAttribute("required", "required");
                document.querySelector("#ticket--licencePlateNumber").setAttribute("required", "required");
            }
        });
    }
    const populateLicencePlateProvinceDatalistFunction = () => {
        const datalistElement = document.querySelector("#datalist--licencePlateProvince");
        cityssm.clearElement(datalistElement);
        const countryString = document.querySelector("#ticket--licencePlateCountry").value;
        const countryProperties = pts.getLicencePlateCountryProperties(countryString);
        if (countryProperties === null || countryProperties === void 0 ? void 0 : countryProperties.provinces) {
            const provincesList = Object.values(countryProperties.provinces);
            for (const province of provincesList) {
                const optionElement = document.createElement("option");
                optionElement.setAttribute("value", province.provinceShortName);
                datalistElement.append(optionElement);
            }
        }
    };
    document.querySelector("#ticket--licencePlateCountry")
        .addEventListener("change", populateLicencePlateProvinceDatalistFunction);
    pts.loadDefaultConfigProperties(populateLicencePlateProvinceDatalistFunction);
    const unlockFieldFunction = (unlockButtonClickEvent) => {
        unlockButtonClickEvent.preventDefault();
        const unlockButtonElement = unlockButtonClickEvent.currentTarget;
        const inputTag = unlockButtonElement.getAttribute("data-unlock");
        const readOnlyElement = unlockButtonElement.closest(".field").querySelector(inputTag);
        readOnlyElement.removeAttribute("readonly");
        readOnlyElement.classList.remove("is-readonly");
        readOnlyElement.focus();
        unlockButtonElement.setAttribute("disabled", "disabled");
    };
    const unlockButtonElements = document.querySelectorAll(".is-unlock-field-button");
    for (const unlockButtonElement of unlockButtonElements) {
        unlockButtonElement.addEventListener("click", unlockFieldFunction);
    }
})();
