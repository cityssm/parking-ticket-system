"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const offenceMap = new Map();
    const offenceAccountNumberPatternString = exports.accountNumberPattern;
    delete exports.accountNumberPattern;
    const locationMap = new Map();
    const limitResultsCheckboxElement = document.querySelector("#offenceFilter--limitResults");
    const resultsElement = document.querySelector("#offenceResults");
    const locationInputElement = document.querySelector("#offenceFilter--location");
    const locationTextElement = document.querySelector("#offenceFilter--locationText");
    let locationKeyFilterIsSet = false;
    let locationKeyFilter = "";
    const bylawMap = new Map();
    const bylawInputElement = document.querySelector("#offenceFilter--bylaw");
    const bylawTextElement = document.querySelector("#offenceFilter--bylawText");
    let bylawNumberFilterIsSet = false;
    let bylawNumberFilter = "";
    const getOffenceMapKeyFunction = (bylawNumber, locationKey) => {
        return bylawNumber + "::::" + locationKey;
    };
    const loadOffenceMapFunction = (offenceList) => {
        offenceMap.clear();
        for (const offence of offenceList) {
            const offenceMapKey = getOffenceMapKeyFunction(offence.bylawNumber, offence.locationKey);
            offenceMap.set(offenceMapKey, offence);
        }
    };
    const openEditOffenceModalFunction = (clickEvent) => {
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        const offenceMapKey = getOffenceMapKeyFunction(buttonElement.dataset.bylawNumber, buttonElement.dataset.locationKey);
        const offence = offenceMap.get(offenceMapKey);
        const location = locationMap.get(offence.locationKey);
        const bylaw = bylawMap.get(offence.bylawNumber);
        let editOffenceModalCloseFunction;
        const deleteFunction = () => {
            cityssm.postJSON("/admin/doDeleteOffence", {
                bylawNumber: offence.bylawNumber,
                locationKey: offence.locationKey
            }, (responseJSON) => {
                if (responseJSON.success) {
                    loadOffenceMapFunction(responseJSON.offences);
                    editOffenceModalCloseFunction();
                    renderOffencesFunction();
                }
            });
        };
        const confirmDeleteFunction = (deleteClickEvent) => {
            deleteClickEvent.preventDefault();
            cityssm.confirmModal("Remove Offence?", "Are you sure you want to remove this offence?", "Yes, Remove Offence", "warning", deleteFunction);
        };
        const submitFunction = (formEvent) => {
            formEvent.preventDefault();
            cityssm.postJSON("/admin/doUpdateOffence", formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    loadOffenceMapFunction(responseJSON.offences);
                    editOffenceModalCloseFunction();
                    renderOffencesFunction();
                }
            });
        };
        cityssm.openHtmlModal("offence-edit", {
            onshow() {
                document.querySelector("#offenceEdit--locationKey").value = offence.locationKey;
                document.querySelector("#offenceEdit--bylawNumber").value = offence.bylawNumber;
                document.querySelector("#offenceEdit--locationName").textContent = location.locationName;
                document.querySelector("#offenceEdit--locationClass").textContent =
                    pts.getLocationClass(location.locationClassKey).locationClass;
                document.querySelector("#offenceEdit--bylawNumberSpan").textContent = bylaw.bylawNumber;
                document.querySelector("#offenceEdit--bylawDescription").textContent = bylaw.bylawDescription;
                document.querySelector("#offenceEdit--parkingOffence").value = offence.parkingOffence;
                document.querySelector("#offenceEdit--offenceAmount").value =
                    offence.offenceAmount.toFixed(2);
                document.querySelector("#offenceEdit--discountOffenceAmount").value =
                    offence.discountOffenceAmount.toFixed(2);
                document.querySelector("#offenceEdit--discountDays").value =
                    offence.discountDays.toString();
                const accountNumberElement = document.querySelector("#offenceEdit--accountNumber");
                accountNumberElement.value = offence.accountNumber;
                accountNumberElement.setAttribute("pattern", offenceAccountNumberPatternString);
            },
            onshown(modalElement, closeModalFunction) {
                editOffenceModalCloseFunction = closeModalFunction;
                document.querySelector("#form--offenceEdit").addEventListener("submit", submitFunction);
                modalElement.querySelector(".is-delete-button").addEventListener("click", confirmDeleteFunction);
            }
        });
    };
    const addOffenceFunction = (bylawNumber, locationKey, returnAndRenderOffences, callbackFunction) => {
        cityssm.postJSON("/admin/doAddOffence", {
            bylawNumber,
            locationKey,
            returnOffences: returnAndRenderOffences
        }, (responseJSON) => {
            if (responseJSON.success && responseJSON.offences && returnAndRenderOffences) {
                loadOffenceMapFunction(responseJSON.offences);
                renderOffencesFunction();
            }
            if (callbackFunction) {
                callbackFunction(responseJSON);
            }
        });
    };
    const openAddOffenceFromListModalFunction = () => {
        let doRefreshOnClose = false;
        const addFunction = (clickEvent) => {
            clickEvent.preventDefault();
            const linkElement = clickEvent.currentTarget;
            const bylawNumber = linkElement.dataset.bylawNumber;
            const locationKey = linkElement.dataset.locationKey;
            addOffenceFunction(bylawNumber, locationKey, false, (responseJSON) => {
                if (responseJSON.success) {
                    linkElement.remove();
                    doRefreshOnClose = true;
                }
            });
        };
        cityssm.openHtmlModal("offence-addFromList", {
            onshow(modalElement) {
                let titleHTML = "";
                let selectedHTML = "";
                if (locationKeyFilterIsSet) {
                    titleHTML = "Select By-Laws";
                    const location = locationMap.get(locationKeyFilter);
                    const locationClass = pts.getLocationClass(location.locationClassKey);
                    selectedHTML = cityssm.escapeHTML(location.locationName) + "<br />" +
                        "<span class=\"is-size-7\">" +
                        cityssm.escapeHTML(locationClass.locationClass) +
                        "</span>";
                }
                else {
                    titleHTML = "Select Locations";
                    const bylaw = bylawMap.get(bylawNumberFilter);
                    selectedHTML = cityssm.escapeHTML(bylaw.bylawNumber) + "<br />" +
                        "<span class=\"is-size-7\">" + bylaw.bylawDescription + "</span>";
                }
                modalElement.querySelector(".modal-card-title").innerHTML = titleHTML;
                document.querySelector("#addContainer--selected").innerHTML = selectedHTML;
            },
            onshown() {
                const listElement = document.createElement("div");
                listElement.className = "panel";
                let displayCount = 0;
                if (locationKeyFilterIsSet) {
                    for (const bylaw of bylawMap.values()) {
                        const offenceMapKey = getOffenceMapKeyFunction(bylaw.bylawNumber, locationKeyFilter);
                        if (offenceMap.has(offenceMapKey)) {
                            continue;
                        }
                        displayCount += 1;
                        const linkElement = document.createElement("a");
                        linkElement.className = "panel-block";
                        linkElement.dataset.bylawNumber = bylaw.bylawNumber;
                        linkElement.dataset.locationKey = locationKeyFilter;
                        linkElement.innerHTML = cityssm.escapeHTML(bylaw.bylawNumber) + "<br />" +
                            "<span class=\"is-size-7\">" + cityssm.escapeHTML(bylaw.bylawDescription) + "</span>";
                        linkElement.addEventListener("click", addFunction);
                        listElement.append(linkElement);
                    }
                }
                else {
                    for (const location of locationMap.values()) {
                        const offenceMapKey = getOffenceMapKeyFunction(bylawNumberFilter, location.locationKey);
                        if (offenceMap.has(offenceMapKey)) {
                            continue;
                        }
                        displayCount += 1;
                        const linkElement = document.createElement("a");
                        linkElement.className = "panel-block";
                        linkElement.dataset.bylawNumber = bylawNumberFilter;
                        linkElement.dataset.locationKey = location.locationKey;
                        linkElement.innerHTML = cityssm.escapeHTML(location.locationName) + "<br />" +
                            "<span class=\"is-size-7\">" +
                            cityssm.escapeHTML(pts.getLocationClass(location.locationClassKey).locationClass) +
                            "</span>";
                        linkElement.addEventListener("click", addFunction);
                        listElement.append(linkElement);
                    }
                }
                const addResultsElement = document.querySelector("#addContainer--results");
                cityssm.clearElement(addResultsElement);
                if (displayCount === 0) {
                    addResultsElement.innerHTML = "<div class=\"message is-info\">" +
                        "<div class=\"message-body\">There are no offence records available for creation.</div>" +
                        "</div>";
                }
                else {
                    addResultsElement.append(listElement);
                }
            },
            onremoved() {
                if (doRefreshOnClose) {
                    cityssm.postJSON("/offences/doGetAllOffences", {}, (offenceList) => {
                        loadOffenceMapFunction(offenceList);
                        renderOffencesFunction();
                    });
                }
            }
        });
    };
    const renderOffencesFunction = () => {
        const tbodyElement = document.createElement("tbody");
        let matchCount = 0;
        const displayLimit = (limitResultsCheckboxElement.checked
            ? Number.parseInt(limitResultsCheckboxElement.value, 10)
            : offenceMap.size);
        for (const offence of offenceMap.values()) {
            if (matchCount >= displayLimit) {
                continue;
            }
            if ((locationKeyFilterIsSet && locationKeyFilter !== offence.locationKey) ||
                (bylawNumberFilterIsSet && bylawNumberFilter !== offence.bylawNumber)) {
                continue;
            }
            const location = locationMap.get(offence.locationKey);
            if (!location) {
                continue;
            }
            const bylaw = bylawMap.get(offence.bylawNumber);
            if (!bylaw) {
                continue;
            }
            matchCount += 1;
            if (matchCount > displayLimit) {
                continue;
            }
            const trElement = document.createElement("tr");
            trElement.innerHTML =
                ("<td class=\"has-border-right-width-2\">" +
                    cityssm.escapeHTML(location.locationName) + "<br />" +
                    "<span class=\"is-size-7\">" +
                    cityssm.escapeHTML(pts.getLocationClass(location.locationClassKey).locationClass) +
                    "</span>" +
                    "</td>") +
                    ("<td class=\"has-border-right-width-2\">" +
                        "<strong>" + cityssm.escapeHTML(bylaw.bylawNumber) + "</strong><br />" +
                        "<span class=\"is-size-7\">" + cityssm.escapeHTML(bylaw.bylawDescription) + "</span>" +
                        "</td>") +
                    ("<td class=\"has-text-right has-tooltip-bottom\" data-tooltip=\"Set Rate\">" +
                        "$" + offence.offenceAmount.toFixed(2) + "<br />" +
                        "<span class=\"is-size-7\">" + offence.accountNumber + "</span>" +
                        "</td>") +
                    ("<td class=\"has-text-right has-tooltip-bottom\" data-tooltip=\"Discount Rate\">" +
                        "$" + offence.discountOffenceAmount.toFixed(2) + "<br />" +
                        "<span class=\"is-size-7\">" +
                        offence.discountDays.toString() + " day" + (offence.discountDays === 1 ? "" : "s") +
                        "</span>" +
                        "</td>") +
                    ("<td class=\"has-border-right-width-2\">" +
                        "<div class=\"is-size-7\">" +
                        cityssm.escapeHTML(offence.parkingOffence) +
                        "</div>" +
                        "</td>") +
                    ("<td class=\"has-text-right\">" +
                        "<button class=\"button is-small\"" +
                        " data-bylaw-number=\"" + offence.bylawNumber + "\"" +
                        " data-location-key=\"" + offence.locationKey + "\"" +
                        " type=\"button\">" +
                        "<span class=\"icon is-small\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                        "<span>Edit</span>" +
                        "</button>" +
                        "</td>");
            trElement.querySelector("button").addEventListener("click", openEditOffenceModalFunction);
            tbodyElement.append(trElement);
        }
        cityssm.clearElement(resultsElement);
        if (matchCount === 0) {
            resultsElement.innerHTML = "<div class=\"message is-info\">" +
                "<div class=\"message-body\">" +
                "<p>There are no offences that match the given criteria.</p>" +
                "</div>" +
                "</div>";
            return;
        }
        resultsElement.innerHTML = "<table class=\"table is-striped is-hoverable is-fullwidth\">" +
            "<thead>" +
            "<tr>" +
            "<th class=\"has-border-right-width-2\">Location</th>" +
            "<th class=\"has-border-right-width-2\">By-Law</th>" +
            "<th class=\"has-border-right-width-2\" colspan=\"3\">Offence</th>" +
            "<th class=\"has-width-50\"></th>" +
            "</tr>" +
            "</thead>" +
            "</table>";
        resultsElement.querySelector("table").append(tbodyElement);
        if (matchCount > displayLimit) {
            resultsElement.insertAdjacentHTML("afterbegin", "<div class=\"message is-warning\">" +
                "<div class=\"message-body has-text-centered\">Limit Reached</div>" +
                "</div>");
        }
    };
    document.querySelector("#is-add-offence-button").addEventListener("click", (clickEvent) => {
        clickEvent.preventDefault();
        if (locationKeyFilterIsSet && bylawNumberFilterIsSet) {
            const bylaw = bylawMap.get(bylawNumberFilter);
            const location = locationMap.get(locationKeyFilter);
            cityssm.confirmModal("Create Offence?", "<p class=\"has-text-centered\">Are you sure you want to create the offence record below?</p>" +
                "<div class=\"columns my-4\">" +
                ("<div class=\"column has-text-centered\">" +
                    cityssm.escapeHTML(location.locationName) + "<br />" +
                    "<span class=\"is-size-7\">" +
                    cityssm.escapeHTML(pts.getLocationClass(location.locationClassKey).locationClass) +
                    "</span>" +
                    "</div>") +
                ("<div class=\"column has-text-centered\">" +
                    cityssm.escapeHTML(bylaw.bylawNumber) + "<br />" +
                    "<span class=\"is-size-7\">" +
                    cityssm.escapeHTML(bylaw.bylawDescription) +
                    "</span>" +
                    "</div>") +
                "</div>", "Yes, Create Offence", "info", () => {
                addOffenceFunction(bylawNumberFilter, locationKeyFilter, true, (responseJSON) => {
                    if (!responseJSON.success) {
                        cityssm.alertModal("Offence Not Added", responseJSON.message, "OK", "danger");
                    }
                    else if (responseJSON.message) {
                        cityssm.alertModal("Offence Added Successfully", responseJSON.message, "OK", "warning");
                    }
                });
            });
        }
        else if (locationKeyFilterIsSet || bylawNumberFilterIsSet) {
            openAddOffenceFromListModalFunction();
        }
        else {
            cityssm.alertModal("How to Create a New Offence", "To add an offence, use the main filters to select either a location, a by-law, or both.", "OK", "info");
        }
    });
    const clearLocationFilterFunction = () => {
        locationInputElement.value = "";
        cityssm.clearElement(locationTextElement);
        locationKeyFilter = "";
        locationKeyFilterIsSet = false;
    };
    const openSelectLocationFilterModalFunction = () => {
        let selectLocationCloseModalFunction;
        const selectFunction = (clickEvent) => {
            clickEvent.preventDefault();
            const location = locationMap.get(clickEvent.currentTarget.dataset.locationKey);
            locationKeyFilterIsSet = true;
            locationKeyFilter = location.locationKey;
            locationInputElement.value = location.locationName;
            selectLocationCloseModalFunction();
            renderOffencesFunction();
        };
        cityssm.openHtmlModal("location-select", {
            onshow() {
                const listElement = document.createElement("div");
                listElement.className = "panel mb-4";
                for (const location of locationMap.values()) {
                    const linkElement = document.createElement("a");
                    linkElement.className = "panel-block is-block";
                    linkElement.dataset.locationKey = location.locationKey;
                    linkElement.setAttribute("href", "#");
                    linkElement.innerHTML = "<div class=\"level\">" +
                        ("<div class=\"level-left\">" +
                            cityssm.escapeHTML(location.locationName) +
                            "</div>") +
                        "<div class=\"level-right\">" +
                        cityssm.escapeHTML(pts.getLocationClass(location.locationClassKey).locationClass) +
                        "</div>" +
                        "</div>";
                    linkElement.addEventListener("click", selectFunction);
                    listElement.append(linkElement);
                }
                const listContainerElement = document.querySelector("#container--parkingLocations");
                cityssm.clearElement(listContainerElement);
                listContainerElement.append(listElement);
            },
            onshown(_modalElement, closeModalFunction) {
                selectLocationCloseModalFunction = closeModalFunction;
            }
        });
    };
    locationInputElement.addEventListener("dblclick", openSelectLocationFilterModalFunction);
    document.querySelector("#is-select-location-filter-button")
        .addEventListener("click", openSelectLocationFilterModalFunction);
    document.querySelector("#is-clear-location-filter-button").addEventListener("click", () => {
        clearLocationFilterFunction();
        renderOffencesFunction();
    });
    if (!locationKeyFilterIsSet) {
        clearLocationFilterFunction();
    }
    const clearBylawFilterFunction = () => {
        bylawInputElement.value = "";
        cityssm.clearElement(bylawTextElement);
        bylawNumberFilter = "";
        bylawNumberFilterIsSet = false;
    };
    const openSelectBylawFilterModalFunction = () => {
        let selectBylawCloseModalFunction;
        const selectFunction = (clickEvent) => {
            clickEvent.preventDefault();
            const bylaw = bylawMap.get(clickEvent.currentTarget.dataset.bylawNumber);
            bylawNumberFilterIsSet = true;
            bylawNumberFilter = bylaw.bylawNumber;
            bylawInputElement.value = bylaw.bylawNumber;
            bylawTextElement.textContent = bylaw.bylawDescription;
            selectBylawCloseModalFunction();
            renderOffencesFunction();
        };
        cityssm.openHtmlModal("bylaw-select", {
            onshow() {
                const listElement = document.createElement("div");
                listElement.className = "panel mb-4";
                for (const bylaw of bylawMap.values()) {
                    const linkElement = document.createElement("a");
                    linkElement.className = "panel-block is-block";
                    linkElement.dataset.bylawNumber = bylaw.bylawNumber;
                    linkElement.setAttribute("href", "#");
                    linkElement.innerHTML = cityssm.escapeHTML(bylaw.bylawNumber) + "<br />" +
                        "<span class=\"is-size-7\">" + cityssm.escapeHTML(bylaw.bylawDescription) + "</span>";
                    linkElement.addEventListener("click", selectFunction);
                    listElement.append(linkElement);
                }
                const listContainerElement = document.querySelector("#container--parkingBylaws");
                cityssm.clearElement(listContainerElement);
                listContainerElement.append(listElement);
            },
            onshown(_modalElement, closeModalFunction) {
                selectBylawCloseModalFunction = closeModalFunction;
            }
        });
    };
    bylawInputElement.addEventListener("dblclick", openSelectBylawFilterModalFunction);
    document.querySelector("#is-select-bylaw-filter-button")
        .addEventListener("click", openSelectBylawFilterModalFunction);
    document.querySelector("#is-clear-bylaw-filter-button").addEventListener("click", () => {
        clearBylawFilterFunction();
        renderOffencesFunction();
    });
    if (!bylawNumberFilterIsSet) {
        clearBylawFilterFunction();
    }
    limitResultsCheckboxElement.addEventListener("change", renderOffencesFunction);
    for (const location of exports.locations) {
        locationMap.set(location.locationKey, location);
    }
    delete exports.locations;
    for (const bylaw of exports.bylaws) {
        bylawMap.set(bylaw.bylawNumber, bylaw);
    }
    delete exports.bylaws;
    loadOffenceMapFunction(exports.offences);
    delete exports.offences;
    pts.getDefaultConfigProperty("locationClasses", renderOffencesFunction);
})();