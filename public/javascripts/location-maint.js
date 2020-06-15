"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var locationClassKeyOptionsHTML = "";
    var locationClassKeyFilterEle = document.getElementById("locationFilter--locationClassKey");
    var locationNameFilterEle = document.getElementById("locationFilter--locationName");
    var locationResultsEle = document.getElementById("locationResults");
    var locationClassKeyMap = new Map();
    var locationList = exports.locations;
    delete exports.locations;
    function openEditLocationModal(clickEvent) {
        clickEvent.preventDefault();
        var listIndex = parseInt(clickEvent.currentTarget.getAttribute("data-index"), 10);
        var location = locationList[listIndex];
        var editLocationCloseModalFn;
        var deleteFn = function () {
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
        var confirmDeleteFn = function (deleteClickEvent) {
            deleteClickEvent.preventDefault();
            cityssm.confirmModal("Delete Location", "Are you sure you want to remove \"" + location.locationName + "\" from the list of available options?", "Yes, Remove Location", "danger", deleteFn);
        };
        var editFn = function (formEvent) {
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
            onshow: function () {
                document.getElementById("editLocation--locationKey").value = location.locationKey;
                var locationClassKeyEditSelectEle = document.getElementById("editLocation--locationClassKey");
                locationClassKeyEditSelectEle.innerHTML = locationClassKeyOptionsHTML;
                if (!locationClassKeyMap.has(location.locationClassKey)) {
                    locationClassKeyEditSelectEle.insertAdjacentHTML("beforeend", "<option value=\"" + cityssm.escapeHTML(location.locationClassKey) + "\">" +
                        cityssm.escapeHTML(location.locationClassKey) +
                        "</option>");
                }
                locationClassKeyEditSelectEle.value = location.locationClassKey;
                document.getElementById("editLocation--locationName").value = location.locationName;
            },
            onshown: function (modalEle, closeModalFn) {
                editLocationCloseModalFn = closeModalFn;
                document.getElementById("form--editLocation").addEventListener("submit", editFn);
                modalEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", confirmDeleteFn);
            }
        });
    }
    function renderLocationList() {
        var displayCount = 0;
        var locationClassKeyFilter = locationClassKeyFilterEle.value;
        var locationNameFilterSplit = locationNameFilterEle.value.trim().toLowerCase()
            .split(" ");
        var tbodyEle = document.createElement("tbody");
        for (var locationIndex = 0; locationIndex < locationList.length; locationIndex += 1) {
            var location_1 = locationList[locationIndex];
            if (locationClassKeyFilter !== "" && locationClassKeyFilter !== location_1.locationClassKey) {
                continue;
            }
            var showRecord = true;
            var locationNameLowerCase = location_1.locationName.toLowerCase();
            for (var searchIndex = 0; searchIndex < locationNameFilterSplit.length; searchIndex += 1) {
                if (locationNameLowerCase.indexOf(locationNameFilterSplit[searchIndex]) === -1) {
                    showRecord = false;
                    break;
                }
            }
            if (!showRecord) {
                continue;
            }
            displayCount += 1;
            var locationClass = locationClassKeyMap.has(location_1.locationClassKey) ?
                locationClassKeyMap.get(location_1.locationClassKey).locationClass :
                location_1.locationClassKey;
            var trEle = document.createElement("tr");
            trEle.innerHTML =
                "<td>" +
                    "<a data-index=\"" + locationIndex + "\" href=\"#\">" +
                    cityssm.escapeHTML(location_1.locationName) +
                    "</a>" +
                    "</td>" +
                    "<td>" + cityssm.escapeHTML(locationClass) + "</td>";
            trEle.getElementsByTagName("a")[0].addEventListener("click", openEditLocationModal);
            tbodyEle.appendChild(trEle);
        }
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
        for (var index = 0; index < locationClassesList.length; index += 1) {
            var locationClass = locationClassesList[index];
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
        var addLocationCloseModalFn;
        var addFn = function (formEvent) {
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
