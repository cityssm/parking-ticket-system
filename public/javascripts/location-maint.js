"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    let locationClassKeyOptionsHTML = "";
    const locationClassKeyFilterEle = document.getElementById("locationFilter--locationClassKey");
    const locationNameFilterEle = document.getElementById("locationFilter--locationName");
    const locationResultsEle = document.getElementById("locationResults");
    const locationClassKeyMap = new Map();
    let locationList = exports.locations;
    delete exports.locations;
    function openEditLocationModal(clickEvent) {
        clickEvent.preventDefault();
        const listIndex = parseInt(clickEvent.currentTarget.getAttribute("data-index"), 10);
        const location = locationList[listIndex];
        let editLocationCloseModalFn;
        const deleteFn = function () {
            cityssm.postJSON("/admin/doDeleteLocation", {
                locationKey: location.locationKey
            }, function (responseJSON) {
                if (responseJSON.success) {
                    editLocationCloseModalFn();
                    locationList = responseJSON.locations;
                    renderLocationList();
                }
            });
        };
        const confirmDeleteFn = function (deleteClickEvent) {
            deleteClickEvent.preventDefault();
            cityssm.confirmModal("Delete Location", "Are you sure you want to remove \"" + location.locationName + "\" from the list of available options?", "Yes, Remove Location", "danger", deleteFn);
        };
        const editFn = function (formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON("/admin/doUpdateLocation", formEvent.currentTarget, function (responseJSON) {
                if (responseJSON.success) {
                    editLocationCloseModalFn();
                    locationList = responseJSON.locations;
                    renderLocationList();
                }
            });
        };
        cityssm.openHtmlModal("location-edit", {
            onshow() {
                document.getElementById("editLocation--locationKey").value = location.locationKey;
                const locationClassKeyEditSelectEle = document.getElementById("editLocation--locationClassKey");
                locationClassKeyEditSelectEle.innerHTML = locationClassKeyOptionsHTML;
                if (!locationClassKeyMap.has(location.locationClassKey)) {
                    locationClassKeyEditSelectEle.insertAdjacentHTML("beforeend", "<option value=\"" + cityssm.escapeHTML(location.locationClassKey) + "\">" +
                        cityssm.escapeHTML(location.locationClassKey) +
                        "</option>");
                }
                locationClassKeyEditSelectEle.value = location.locationClassKey;
                document.getElementById("editLocation--locationName").value = location.locationName;
            },
            onshown(modalEle, closeModalFn) {
                editLocationCloseModalFn = closeModalFn;
                document.getElementById("form--editLocation").addEventListener("submit", editFn);
                modalEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", confirmDeleteFn);
            }
        });
    }
    function renderLocationList() {
        let displayCount = 0;
        const locationClassKeyFilter = locationClassKeyFilterEle.value;
        const locationNameFilterSplit = locationNameFilterEle.value.trim().toLowerCase()
            .split(" ");
        const tbodyEle = document.createElement("tbody");
        locationList.forEach(function (location, locationIndex) {
            if (locationClassKeyFilter !== "" && locationClassKeyFilter !== location.locationClassKey) {
                return;
            }
            let showRecord = true;
            const locationNameLowerCase = location.locationName.toLowerCase();
            for (let searchIndex = 0; searchIndex < locationNameFilterSplit.length; searchIndex += 1) {
                if (locationNameLowerCase.indexOf(locationNameFilterSplit[searchIndex]) === -1) {
                    showRecord = false;
                    break;
                }
            }
            if (!showRecord) {
                return;
            }
            displayCount += 1;
            const locationClass = locationClassKeyMap.has(location.locationClassKey) ?
                locationClassKeyMap.get(location.locationClassKey).locationClass :
                location.locationClassKey;
            const trEle = document.createElement("tr");
            trEle.innerHTML =
                "<td>" +
                    "<a data-index=\"" + locationIndex + "\" href=\"#\">" +
                    cityssm.escapeHTML(location.locationName) +
                    "</a>" +
                    "</td>" +
                    "<td>" + cityssm.escapeHTML(locationClass) + "</td>";
            trEle.getElementsByTagName("a")[0].addEventListener("click", openEditLocationModal);
            tbodyEle.appendChild(trEle);
        });
        cityssm.clearElement(locationResultsEle);
        if (displayCount === 0) {
            locationResultsEle.innerHTML = "<div class=\"message is-info\">" +
                "<div class=\"message-body\">There are no locations that meet your search criteria.</div>" +
                "</div>";
            return;
        }
        locationResultsEle.innerHTML = "<table class=\"table is-fixed is-striped is-hoverable is-fullwidth\">" +
            "<thead><tr>" +
            "<th>Location</th>" +
            "<th>Class</th>" +
            "</tr></thead>" +
            "</table>";
        locationResultsEle.getElementsByTagName("table")[0].appendChild(tbodyEle);
    }
    locationClassKeyFilterEle.addEventListener("change", renderLocationList);
    locationNameFilterEle.addEventListener("keyup", renderLocationList);
    pts.getDefaultConfigProperty("locationClasses", function (locationClassesList) {
        locationClassKeyFilterEle.innerHTML = "<option value=\"\">(All Location Classes)</option>";
        for (const locationClass of locationClassesList) {
            locationClassKeyOptionsHTML +=
                "<option value=\"" + locationClass.locationClassKey + "\">" +
                    cityssm.escapeHTML(locationClass.locationClass) +
                    "</option>";
            locationClassKeyMap.set(locationClass.locationClassKey, locationClass);
        }
        locationClassKeyFilterEle.insertAdjacentHTML("beforeend", locationClassKeyOptionsHTML);
        renderLocationList();
    });
    document.getElementById("is-add-location-button").addEventListener("click", function (clickEvent) {
        clickEvent.preventDefault();
        let addLocationCloseModalFn;
        const addFn = function (formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON("/admin/doAddLocation", formEvent.currentTarget, function (responseJSON) {
                if (responseJSON.success) {
                    addLocationCloseModalFn();
                    locationList = responseJSON.locations;
                    renderLocationList();
                }
                else {
                    cityssm.alertModal("Location Not Added", responseJSON.message, "OK", "danger");
                }
            });
        };
        cityssm.openHtmlModal("location-add", {
            onshown: function (_modalEle, closeModalFn) {
                addLocationCloseModalFn = closeModalFn;
                document.getElementById("addLocation--locationClassKey")
                    .insertAdjacentHTML("beforeend", locationClassKeyOptionsHTML);
                document.getElementById("form--addLocation").addEventListener("submit", addFn);
            }
        });
    });
}());
