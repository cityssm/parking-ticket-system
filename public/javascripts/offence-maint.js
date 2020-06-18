"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    const locationClassMap = new Map();
    const offenceMap = new Map();
    const offenceAccountNumberPatternString = exports.accountNumberPattern;
    delete exports.accountNumberPattern;
    const locationMap = new Map();
    const limitResultsCheckboxEle = document.getElementById("offenceFilter--limitResults");
    const resultsEle = document.getElementById("offenceResults");
    const locationInputEle = document.getElementById("offenceFilter--location");
    const locationTextEle = document.getElementById("offenceFilter--locationText");
    let locationKeyFilterIsSet = false;
    let locationKeyFilter = "";
    const bylawMap = new Map();
    const bylawInputEle = document.getElementById("offenceFilter--bylaw");
    const bylawTextEle = document.getElementById("offenceFilter--bylawText");
    let bylawNumberFilterIsSet = false;
    let bylawNumberFilter = "";
    function getOffenceMapKey(bylawNumber, locationKey) {
        return bylawNumber + "::::" + locationKey;
    }
    function loadOffenceMap(offenceList) {
        offenceMap.clear();
        for (let index = 0; index < offenceList.length; index += 1) {
            const offence = offenceList[index];
            const offenceMapKey = getOffenceMapKey(offence.bylawNumber, offence.locationKey);
            offenceMap.set(offenceMapKey, offence);
        }
    }
    function openEditOffenceModal(clickEvent) {
        clickEvent.preventDefault();
        const buttonEle = clickEvent.currentTarget;
        const offenceMapKey = getOffenceMapKey(buttonEle.getAttribute("data-bylaw-number"), buttonEle.getAttribute("data-location-key"));
        const offence = offenceMap.get(offenceMapKey);
        const location = locationMap.get(offence.locationKey);
        const bylaw = bylawMap.get(offence.bylawNumber);
        let editOffenceModalCloseFn;
        const deleteFn = function () {
            cityssm.postJSON("/admin/doDeleteOffence", {
                bylawNumber: offence.bylawNumber,
                locationKey: offence.locationKey
            }, function (responseJSON) {
                if (responseJSON.success) {
                    loadOffenceMap(responseJSON.offences);
                    editOffenceModalCloseFn();
                    renderOffences();
                }
            });
        };
        const confirmDeleteFn = function (deleteClickEvent) {
            deleteClickEvent.preventDefault();
            cityssm.confirmModal("Remove Offence?", "Are you sure you want to remove this offence?", "Yes, Remove Offence", "warning", deleteFn);
        };
        const submitFn = function (formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON("/admin/doUpdateOffence", formEvent.currentTarget, function (responseJSON) {
                if (responseJSON.success) {
                    loadOffenceMap(responseJSON.offences);
                    editOffenceModalCloseFn();
                    renderOffences();
                }
            });
        };
        cityssm.openHtmlModal("offence-edit", {
            onshow() {
                document.getElementById("offenceEdit--locationKey").value = offence.locationKey;
                document.getElementById("offenceEdit--bylawNumber").value = offence.bylawNumber;
                document.getElementById("offenceEdit--locationName").innerText = location.locationName;
                document.getElementById("offenceEdit--locationClass").innerText =
                    (locationClassMap.has(location.locationClassKey) ?
                        locationClassMap.get(location.locationClassKey).locationClass :
                        location.locationClassKey);
                document.getElementById("offenceEdit--bylawNumberSpan").innerText = bylaw.bylawNumber;
                document.getElementById("offenceEdit--bylawDescription").innerText = bylaw.bylawDescription;
                document.getElementById("offenceEdit--parkingOffence").value = offence.parkingOffence;
                document.getElementById("offenceEdit--offenceAmount").value = offence.offenceAmount;
                document.getElementById("offenceEdit--discountOffenceAmount").value = offence.discountOffenceAmount;
                document.getElementById("offenceEdit--discountDays").value = offence.discountDays;
                const accountNumberEle = document.getElementById("offenceEdit--accountNumber");
                accountNumberEle.value = offence.accountNumber;
                accountNumberEle.setAttribute("pattern", offenceAccountNumberPatternString);
            },
            onshown(modalEle, closeModalFn) {
                editOffenceModalCloseFn = closeModalFn;
                document.getElementById("form--offenceEdit").addEventListener("submit", submitFn);
                modalEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", confirmDeleteFn);
            }
        });
    }
    function addOffence(bylawNumber, locationKey, returnAndRenderOffences, callbackFn) {
        cityssm.postJSON("/admin/doAddOffence", {
            bylawNumber,
            locationKey,
            returnOffences: returnAndRenderOffences
        }, function (responseJSON) {
            if (responseJSON.success && responseJSON.offences && returnAndRenderOffences) {
                loadOffenceMap(responseJSON.offences);
                renderOffences();
            }
            if (callbackFn) {
                callbackFn(responseJSON);
            }
        });
    }
    function openAddOffenceFromListModal() {
        let doRefreshOnClose = false;
        const addFn = function (clickEvent) {
            clickEvent.preventDefault();
            const linkEle = clickEvent.currentTarget;
            const bylawNumber = linkEle.getAttribute("data-bylaw-number");
            const locationKey = linkEle.getAttribute("data-location-key");
            addOffence(bylawNumber, locationKey, false, function (responseJSON) {
                if (responseJSON.success) {
                    linkEle.remove();
                    doRefreshOnClose = true;
                }
            });
        };
        cityssm.openHtmlModal("offence-addFromList", {
            onshow(modalEle) {
                let titleHTML = "";
                let selectedHTML = "";
                if (locationKeyFilterIsSet) {
                    titleHTML = "Select By-Laws";
                    const location = locationMap.get(locationKeyFilter);
                    const locationClass = locationClassMap.get(location.locationClassKey);
                    selectedHTML = cityssm.escapeHTML(location.locationName) + "<br />" +
                        "<span class=\"is-size-7\">" +
                        cityssm.escapeHTML(locationClass ? locationClass.locationClass : location.locationClassKey) +
                        "</span>";
                }
                else {
                    titleHTML = "Select Locations";
                    const bylaw = bylawMap.get(bylawNumberFilter);
                    selectedHTML = cityssm.escapeHTML(bylaw.bylawNumber) + "<br />" +
                        "<span class=\"is-size-7\">" + bylaw.bylawDescription + "</span>";
                }
                modalEle.getElementsByClassName("modal-card-title")[0].innerHTML = titleHTML;
                document.getElementById("addContainer--selected").innerHTML = selectedHTML;
            },
            onshown() {
                const listEle = document.createElement("div");
                listEle.className = "panel";
                let displayCount = 0;
                if (locationKeyFilterIsSet) {
                    bylawMap.forEach(function (bylaw) {
                        const offenceMapKey = getOffenceMapKey(bylaw.bylawNumber, locationKeyFilter);
                        if (offenceMap.has(offenceMapKey)) {
                            return;
                        }
                        displayCount += 1;
                        const linkEle = document.createElement("a");
                        linkEle.className = "panel-block";
                        linkEle.setAttribute("data-bylaw-number", bylaw.bylawNumber);
                        linkEle.setAttribute("data-location-key", locationKeyFilter);
                        linkEle.innerHTML = cityssm.escapeHTML(bylaw.bylawNumber) + "<br />" +
                            "<span class=\"is-size-7\">" + cityssm.escapeHTML(bylaw.bylawDescription) + "</span>";
                        linkEle.addEventListener("click", addFn);
                        listEle.appendChild(linkEle);
                    });
                }
                else {
                    locationMap.forEach(function (location) {
                        const offenceMapKey = getOffenceMapKey(bylawNumberFilter, location.locationKey);
                        if (offenceMap.has(offenceMapKey)) {
                            return;
                        }
                        displayCount += 1;
                        const linkEle = document.createElement("a");
                        linkEle.className = "panel-block";
                        linkEle.setAttribute("data-bylaw-number", bylawNumberFilter);
                        linkEle.setAttribute("data-location-key", location.locationKey);
                        linkEle.innerHTML = cityssm.escapeHTML(location.locationName) + "<br />" +
                            "<span class=\"is-size-7\">" +
                            (locationClassMap.has(location.locationClassKey) ?
                                cityssm.escapeHTML(locationClassMap.get(location.locationClassKey).locationClass) :
                                location.locationClassKey) +
                            "</span>";
                        linkEle.addEventListener("click", addFn);
                        listEle.appendChild(linkEle);
                    });
                }
                const addResultsEle = document.getElementById("addContainer--results");
                cityssm.clearElement(addResultsEle);
                if (displayCount === 0) {
                    addResultsEle.innerHTML = "<div class=\"message is-info\">" +
                        "<div class=\"message-body\">There are no offence records available for creation.</div>" +
                        "</div>";
                }
                else {
                    addResultsEle.appendChild(listEle);
                }
            },
            onremoved() {
                if (doRefreshOnClose) {
                    cityssm.postJSON("/offences/doGetAllOffences", {}, function (offenceList) {
                        loadOffenceMap(offenceList);
                        renderOffences();
                    });
                }
            }
        });
    }
    function renderOffences() {
        const tbodyEle = document.createElement("tbody");
        let matchCount = 0;
        const displayLimit = (limitResultsCheckboxEle.checked ?
            parseInt(limitResultsCheckboxEle.value, 10) :
            offenceMap.size);
        offenceMap.forEach(function (offence) {
            if (matchCount >= displayLimit) {
                return;
            }
            if ((locationKeyFilterIsSet && locationKeyFilter !== offence.locationKey) ||
                (bylawNumberFilterIsSet && bylawNumberFilter !== offence.bylawNumber)) {
                return;
            }
            const location = locationMap.get(offence.locationKey);
            if (!location) {
                return;
            }
            const bylaw = bylawMap.get(offence.bylawNumber);
            if (!bylaw) {
                return;
            }
            matchCount += 1;
            if (matchCount > displayLimit) {
                return;
            }
            const trEle = document.createElement("tr");
            trEle.innerHTML =
                ("<td class=\"has-border-right-width-2\">" +
                    cityssm.escapeHTML(location.locationName) + "<br />" +
                    "<span class=\"is-size-7\">" +
                    (locationClassMap.has(location.locationClassKey) ?
                        locationClassMap.get(location.locationClassKey).locationClass :
                        location.locationClassKey) +
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
                        "<span class=\"is-size-7\">" + offence.discountDays + " day" + (offence.discountDays === 1 ? "" : "s") + "</span>" +
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
            trEle.getElementsByTagName("button")[0].addEventListener("click", openEditOffenceModal);
            tbodyEle.appendChild(trEle);
        });
        cityssm.clearElement(resultsEle);
        if (matchCount === 0) {
            resultsEle.innerHTML = "<div class=\"message is-info\">" +
                "<div class=\"message-body\">" +
                "<p>There are no offences that match the given criteria.</p>" +
                "</div>" +
                "</div>";
            return;
        }
        resultsEle.innerHTML = "<table class=\"table is-striped is-hoverable is-fullwidth\">" +
            "<thead>" +
            "<tr>" +
            "<th class=\"has-border-right-width-2\">Location</th>" +
            "<th class=\"has-border-right-width-2\">By-Law</th>" +
            "<th class=\"has-border-right-width-2\" colspan=\"3\">Offence</th>" +
            "<th class=\"has-width-50\"></th>" +
            "</tr>" +
            "</thead>" +
            "</table>";
        resultsEle.getElementsByTagName("table")[0].appendChild(tbodyEle);
        if (matchCount > displayLimit) {
            resultsEle.insertAdjacentHTML("afterbegin", "<div class=\"message is-warning\">" +
                "<div class=\"message-body has-text-centered\">Limit Reached</div>" +
                "</div>");
        }
    }
    document.getElementById("is-add-offence-button").addEventListener("click", function (clickEvent) {
        clickEvent.preventDefault();
        if (locationKeyFilterIsSet && bylawNumberFilterIsSet) {
            const bylaw = bylawMap.get(bylawNumberFilter);
            const location = locationMap.get(locationKeyFilter);
            cityssm.confirmModal("Create Offence?", "<p class=\"has-text-centered\">Are you sure you want to create the offence record below?</p>" +
                "<div class=\"columns my-4\">" +
                ("<div class=\"column has-text-centered\">" +
                    cityssm.escapeHTML(location.locationName) + "<br />" +
                    "<span class=\"is-size-7\">" +
                    (locationClassMap.has(location.locationClassKey) ?
                        locationClassMap.get(location.locationClassKey).locationClass :
                        location.locationClassKey) +
                    "</span>" +
                    "</div>") +
                ("<div class=\"column has-text-centered\">" +
                    cityssm.escapeHTML(bylaw.bylawNumber) + "<br />" +
                    "<span class=\"is-size-7\">" +
                    cityssm.escapeHTML(bylaw.bylawDescription) +
                    "</span>" +
                    "</div>") +
                "</div>", "Yes, Create Offence", "info", function () {
                addOffence(bylawNumberFilter, locationKeyFilter, true, function (responseJSON) {
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
            openAddOffenceFromListModal();
        }
        else {
            cityssm.alertModal("How to Create a New Offence", "To add an offence, use the main filters to select either a location, a by-law, or both.", "OK", "info");
        }
    });
    function clearLocationFilter() {
        locationInputEle.value = "";
        cityssm.clearElement(locationTextEle);
        locationKeyFilter = "";
        locationKeyFilterIsSet = false;
    }
    function openSelectLocationFilterModal() {
        let selectLocationCloseModalFn;
        const selectFn = function (clickEvent) {
            clickEvent.preventDefault();
            const location = locationMap.get(clickEvent.currentTarget.getAttribute("data-location-key"));
            locationKeyFilterIsSet = true;
            locationKeyFilter = location.locationKey;
            locationInputEle.value = location.locationName;
            selectLocationCloseModalFn();
            renderOffences();
        };
        cityssm.openHtmlModal("location-select", {
            onshow: function () {
                const listEle = document.createElement("div");
                listEle.className = "panel mb-4";
                locationMap.forEach(function (location) {
                    const linkEle = document.createElement("a");
                    linkEle.className = "panel-block is-block";
                    linkEle.setAttribute("data-location-key", location.locationKey);
                    linkEle.setAttribute("href", "#");
                    linkEle.innerHTML = "<div class=\"level\">" +
                        ("<div class=\"level-left\">" +
                            cityssm.escapeHTML(location.locationName) +
                            "</div>") +
                        "<div class=\"level-right\">" +
                        cityssm.escapeHTML(locationClassMap.has(location.locationClassKey) ?
                            locationClassMap.get(location.locationClassKey).locationClass :
                            location.locationClassKey) +
                        "</div>" +
                        "</div>";
                    linkEle.addEventListener("click", selectFn);
                    listEle.appendChild(linkEle);
                });
                const listContainerEle = document.getElementById("container--parkingLocations");
                cityssm.clearElement(listContainerEle);
                listContainerEle.appendChild(listEle);
            },
            onshown: function (_modalEle, closeModalFn) {
                selectLocationCloseModalFn = closeModalFn;
            }
        });
    }
    locationInputEle.addEventListener("dblclick", openSelectLocationFilterModal);
    document.getElementById("is-select-location-filter-button").addEventListener("click", openSelectLocationFilterModal);
    document.getElementById("is-clear-location-filter-button").addEventListener("click", function () {
        clearLocationFilter();
        renderOffences();
    });
    if (!locationKeyFilterIsSet) {
        clearLocationFilter();
    }
    function clearBylawFilter() {
        bylawInputEle.value = "";
        cityssm.clearElement(bylawTextEle);
        bylawNumberFilter = "";
        bylawNumberFilterIsSet = false;
    }
    function openSelectBylawFilterModal() {
        let selectBylawCloseModalFn;
        const selectFn = function (clickEvent) {
            clickEvent.preventDefault();
            const bylaw = bylawMap.get(clickEvent.currentTarget.getAttribute("data-bylaw-number"));
            bylawNumberFilterIsSet = true;
            bylawNumberFilter = bylaw.bylawNumber;
            bylawInputEle.value = bylaw.bylawNumber;
            bylawTextEle.innerText = bylaw.bylawDescription;
            selectBylawCloseModalFn();
            renderOffences();
        };
        cityssm.openHtmlModal("bylaw-select", {
            onshow: function () {
                const listEle = document.createElement("div");
                listEle.className = "panel mb-4";
                bylawMap.forEach(function (bylaw) {
                    const linkEle = document.createElement("a");
                    linkEle.className = "panel-block is-block";
                    linkEle.setAttribute("data-bylaw-number", bylaw.bylawNumber);
                    linkEle.setAttribute("href", "#");
                    linkEle.innerHTML = cityssm.escapeHTML(bylaw.bylawNumber) + "<br />" +
                        "<span class=\"is-size-7\">" + cityssm.escapeHTML(bylaw.bylawDescription) + "</span>";
                    linkEle.addEventListener("click", selectFn);
                    listEle.appendChild(linkEle);
                });
                const listContainerEle = document.getElementById("container--parkingBylaws");
                cityssm.clearElement(listContainerEle);
                listContainerEle.appendChild(listEle);
            },
            onshown: function (_modalEle, closeModalFn) {
                selectBylawCloseModalFn = closeModalFn;
            }
        });
    }
    bylawInputEle.addEventListener("dblclick", openSelectBylawFilterModal);
    document.getElementById("is-select-bylaw-filter-button").addEventListener("click", openSelectBylawFilterModal);
    document.getElementById("is-clear-bylaw-filter-button").addEventListener("click", function () {
        clearBylawFilter();
        renderOffences();
    });
    if (!bylawNumberFilterIsSet) {
        clearBylawFilter();
    }
    limitResultsCheckboxEle.addEventListener("change", renderOffences);
    for (let index = 0; index < exports.locations.length; index += 1) {
        const location = exports.locations[index];
        locationMap.set(location.locationKey, location);
    }
    delete exports.locations;
    for (let index = 0; index < exports.bylaws.length; index += 1) {
        const bylaw = exports.bylaws[index];
        bylawMap.set(bylaw.bylawNumber, bylaw);
    }
    delete exports.bylaws;
    loadOffenceMap(exports.offences);
    delete exports.offences;
    pts.getDefaultConfigProperty("locationClasses", function (locationClassList) {
        for (let index = 0; index < locationClassList.length; index += 1) {
            const locationClass = locationClassList[index];
            locationClassMap.set(locationClass.locationClassKey, locationClass);
        }
        renderOffences();
    });
}());
