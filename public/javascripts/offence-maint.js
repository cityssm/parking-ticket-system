"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var locationClassMap = new Map();
    var offenceMap = new Map();
    var offenceAccountNumberPatternString = exports.accountNumberPattern;
    delete exports.accountNumberPattern;
    var locationMap = new Map();
    var limitResultsCheckboxEle = document.getElementById("offenceFilter--limitResults");
    var resultsEle = document.getElementById("offenceResults");
    var locationInputEle = document.getElementById("offenceFilter--location");
    var locationTextEle = document.getElementById("offenceFilter--locationText");
    var locationKeyFilterIsSet = false;
    var locationKeyFilter = "";
    var bylawMap = new Map();
    var bylawInputEle = document.getElementById("offenceFilter--bylaw");
    var bylawTextEle = document.getElementById("offenceFilter--bylawText");
    var bylawNumberFilterIsSet = false;
    var bylawNumberFilter = "";
    function getOffenceMapKey(bylawNumber, locationKey) {
        return bylawNumber + "::::" + locationKey;
    }
    function loadOffenceMap(offenceList) {
        offenceMap.clear();
        for (var index = 0; index < offenceList.length; index += 1) {
            var offence = offenceList[index];
            var offenceMapKey = getOffenceMapKey(offence.bylawNumber, offence.locationKey);
            offenceMap.set(offenceMapKey, offence);
        }
    }
    function openEditOffenceModal(clickEvent) {
        clickEvent.preventDefault();
        var buttonEle = clickEvent.currentTarget;
        var offenceMapKey = getOffenceMapKey(buttonEle.getAttribute("data-bylaw-number"), buttonEle.getAttribute("data-location-key"));
        var offence = offenceMap.get(offenceMapKey);
        var location = locationMap.get(offence.locationKey);
        var bylaw = bylawMap.get(offence.bylawNumber);
        var editOffenceModalCloseFn;
        var deleteFn = function () {
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
        var confirmDeleteFn = function (deleteClickEvent) {
            deleteClickEvent.preventDefault();
            cityssm.confirmModal("Remove Offence?", "Are you sure you want to remove this offence?", "Yes, Remove Offence", "warning", deleteFn);
        };
        var submitFn = function (formEvent) {
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
            onshow: function () {
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
                var accountNumberEle = document.getElementById("offenceEdit--accountNumber");
                accountNumberEle.value = offence.accountNumber;
                accountNumberEle.setAttribute("pattern", offenceAccountNumberPatternString);
            },
            onshown: function (modalEle, closeModalFn) {
                editOffenceModalCloseFn = closeModalFn;
                document.getElementById("form--offenceEdit").addEventListener("submit", submitFn);
                modalEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", confirmDeleteFn);
            }
        });
    }
    function addOffence(bylawNumber, locationKey, returnAndRenderOffences, callbackFn) {
        cityssm.postJSON("/admin/doAddOffence", {
            bylawNumber: bylawNumber,
            locationKey: locationKey,
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
        var doRefreshOnClose = false;
        var addFn = function (clickEvent) {
            clickEvent.preventDefault();
            var linkEle = clickEvent.currentTarget;
            var bylawNumber = linkEle.getAttribute("data-bylaw-number");
            var locationKey = linkEle.getAttribute("data-location-key");
            addOffence(bylawNumber, locationKey, false, function (responseJSON) {
                if (responseJSON.success) {
                    linkEle.remove();
                    doRefreshOnClose = true;
                }
            });
        };
        cityssm.openHtmlModal("offence-addFromList", {
            onshow: function (modalEle) {
                var titleHTML = "";
                var selectedHTML = "";
                if (locationKeyFilterIsSet) {
                    titleHTML = "Select By-Laws";
                    var location_1 = locationMap.get(locationKeyFilter);
                    var locationClass = locationClassMap.get(location_1.locationClassKey);
                    selectedHTML = cityssm.escapeHTML(location_1.locationName) + "<br />" +
                        "<span class=\"is-size-7\">" +
                        cityssm.escapeHTML(locationClass ? locationClass.locationClass : location_1.locationClassKey) +
                        "</span>";
                }
                else {
                    titleHTML = "Select Locations";
                    var bylaw = bylawMap.get(bylawNumberFilter);
                    selectedHTML = cityssm.escapeHTML(bylaw.bylawNumber) + "<br />" +
                        "<span class=\"is-size-7\">" + bylaw.bylawDescription + "</span>";
                }
                modalEle.getElementsByClassName("modal-card-title")[0].innerHTML = titleHTML;
                document.getElementById("addContainer--selected").innerHTML = selectedHTML;
            },
            onshown: function () {
                var listEle = document.createElement("div");
                listEle.className = "list has-margin-bottom-20";
                var displayCount = 0;
                if (locationKeyFilterIsSet) {
                    bylawMap.forEach(function (bylaw) {
                        var offenceMapKey = getOffenceMapKey(bylaw.bylawNumber, locationKeyFilter);
                        if (offenceMap.has(offenceMapKey)) {
                            return;
                        }
                        displayCount += 1;
                        var linkEle = document.createElement("a");
                        linkEle.className = "list-item";
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
                        var offenceMapKey = getOffenceMapKey(bylawNumberFilter, location.locationKey);
                        if (offenceMap.has(offenceMapKey)) {
                            return;
                        }
                        displayCount += 1;
                        var linkEle = document.createElement("a");
                        linkEle.className = "list-item";
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
                var addResultsEle = document.getElementById("addContainer--results");
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
            onremoved: function () {
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
        var tbodyEle = document.createElement("tbody");
        var matchCount = 0;
        var displayLimit = (limitResultsCheckboxEle.checked ?
            parseInt(limitResultsCheckboxEle.value) :
            offenceMap.size);
        offenceMap.forEach(function (offence) {
            if (matchCount >= displayLimit) {
                return;
            }
            if ((locationKeyFilterIsSet && locationKeyFilter !== offence.locationKey) ||
                (bylawNumberFilterIsSet && bylawNumberFilter !== offence.bylawNumber)) {
                return;
            }
            var location = locationMap.get(offence.locationKey);
            if (!location) {
                return;
            }
            var bylaw = bylawMap.get(offence.bylawNumber);
            if (!bylaw) {
                return;
            }
            matchCount += 1;
            if (matchCount > displayLimit) {
                return;
            }
            var trEle = document.createElement("tr");
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
                    ("<td class=\"has-text-right\">" +
                        "$" + offence.offenceAmount.toFixed(2) + "<br />" +
                        "<span class=\"is-size-7\">" + offence.accountNumber + "</span>" +
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
            "<th class=\"has-border-right-width-2\" colspan=\"2\">Offence</th>" +
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
            var bylaw = bylawMap.get(bylawNumberFilter);
            var location_2 = locationMap.get(locationKeyFilter);
            cityssm.confirmModal("Create Offence?", "<p class=\"has-text-centered\">Are you sure you want to create the offence record below?</p>" +
                "<div class=\"columns has-margin-top-20 has-margin-bottom-20\">" +
                ("<div class=\"column has-text-centered\">" +
                    cityssm.escapeHTML(location_2.locationName) + "<br />" +
                    "<span class=\"is-size-7\">" +
                    (locationClassMap.has(location_2.locationClassKey) ?
                        locationClassMap.get(location_2.locationClassKey).locationClass :
                        location_2.locationClassKey) +
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
            cityssm.alertModal("How to Add an Offence", "To add an offence, use the main filters to select either a location, a by-law, or both.", "OK", "info");
        }
    });
    function clearLocationFilter() {
        locationInputEle.value = "";
        cityssm.clearElement(locationTextEle);
        locationKeyFilter = "";
        locationKeyFilterIsSet = false;
    }
    function openSelectLocationFilterModal() {
        var selectLocationCloseModalFn;
        var selectFn = function (clickEvent) {
            clickEvent.preventDefault();
            var location = locationMap.get(clickEvent.currentTarget.getAttribute("data-location-key"));
            locationKeyFilterIsSet = true;
            locationKeyFilter = location.locationKey;
            locationInputEle.value = location.locationName;
            selectLocationCloseModalFn();
            renderOffences();
        };
        cityssm.openHtmlModal("location-select", {
            onshow: function () {
                var listEle = document.createElement("div");
                listEle.className = "list is-hoverable has-margin-bottom-20";
                locationMap.forEach(function (location) {
                    var linkEle = document.createElement("a");
                    linkEle.className = "list-item";
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
                var listContainerEle = document.getElementById("container--parkingLocations");
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
        var selectBylawCloseModalFn;
        var selectFn = function (clickEvent) {
            clickEvent.preventDefault();
            var bylaw = bylawMap.get(clickEvent.currentTarget.getAttribute("data-bylaw-number"));
            bylawNumberFilterIsSet = true;
            bylawNumberFilter = bylaw.bylawNumber;
            bylawInputEle.value = bylaw.bylawNumber;
            bylawTextEle.innerText = bylaw.bylawDescription;
            selectBylawCloseModalFn();
            renderOffences();
        };
        cityssm.openHtmlModal("bylaw-select", {
            onshow: function () {
                var listEle = document.createElement("div");
                listEle.className = "list is-hoverable has-margin-bottom-20";
                bylawMap.forEach(function (bylaw) {
                    var linkEle = document.createElement("a");
                    linkEle.className = "list-item";
                    linkEle.setAttribute("data-bylaw-number", bylaw.bylawNumber);
                    linkEle.setAttribute("href", "#");
                    linkEle.innerHTML = cityssm.escapeHTML(bylaw.bylawNumber) + "<br />" +
                        "<span class=\"is-size-7\">" + cityssm.escapeHTML(bylaw.bylawDescription) + "</span>";
                    linkEle.addEventListener("click", selectFn);
                    listEle.appendChild(linkEle);
                });
                var listContainerEle = document.getElementById("container--parkingBylaws");
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
    for (var index = 0; index < exports.locations.length; index += 1) {
        var location_3 = exports.locations[index];
        locationMap.set(location_3.locationKey, location_3);
    }
    delete exports.locations;
    for (var index = 0; index < exports.bylaws.length; index += 1) {
        var bylaw = exports.bylaws[index];
        bylawMap.set(bylaw.bylawNumber, bylaw);
    }
    delete exports.bylaws;
    loadOffenceMap(exports.offences);
    delete exports.offences;
    pts.getDefaultConfigProperty("locationClasses", function (locationClassList) {
        for (var index = 0; index < locationClassList.length; index += 1) {
            var locationClass = locationClassList[index];
            locationClassMap.set(locationClass.locationClassKey, locationClass);
        }
        renderOffences();
    });
}());
