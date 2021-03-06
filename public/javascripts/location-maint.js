"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    let locationClassKeyOptionsHTML = "";
    const locationClassKeyFilterEle = document.getElementById("locationFilter--locationClassKey");
    const locationNameFilterEle = document.getElementById("locationFilter--locationName");
    const locationResultsEle = document.getElementById("locationResults");
    let locationList = exports.locations;
    delete exports.locations;
    const openEditLocationModalFn = (clickEvent) => {
        clickEvent.preventDefault();
        const listIndex = parseInt(clickEvent.currentTarget.getAttribute("data-index"), 10);
        const location = locationList[listIndex];
        let editLocationCloseModalFn;
        const deleteFn = () => {
            cityssm.postJSON("/admin/doDeleteLocation", {
                locationKey: location.locationKey
            }, (responseJSON) => {
                if (responseJSON.success) {
                    editLocationCloseModalFn();
                    locationList = responseJSON.locations;
                    renderLocationListFn();
                }
            });
        };
        const confirmDeleteFn = (deleteClickEvent) => {
            deleteClickEvent.preventDefault();
            cityssm.confirmModal("Delete Location", "Are you sure you want to remove \"" + location.locationName + "\" from the list of available options?", "Yes, Remove Location", "danger", deleteFn);
        };
        const editFn = (formEvent) => {
            formEvent.preventDefault();
            cityssm.postJSON("/admin/doUpdateLocation", formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    editLocationCloseModalFn();
                    locationList = responseJSON.locations;
                    renderLocationListFn();
                }
            });
        };
        cityssm.openHtmlModal("location-edit", {
            onshow() {
                document.getElementById("editLocation--locationKey").value = location.locationKey;
                const locationClassKeyEditSelectEle = document.getElementById("editLocation--locationClassKey");
                locationClassKeyEditSelectEle.innerHTML = locationClassKeyOptionsHTML;
                if (!locationClassKeyEditSelectEle.querySelector("[value='" + location.locationClassKey + "']")) {
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
    };
    const renderLocationListFn = () => {
        let displayCount = 0;
        const locationClassKeyFilter = locationClassKeyFilterEle.value;
        const locationNameFilterSplit = locationNameFilterEle.value.trim().toLowerCase()
            .split(" ");
        const tbodyEle = document.createElement("tbody");
        locationList.forEach((location, locationIndex) => {
            if (locationClassKeyFilter !== "" && locationClassKeyFilter !== location.locationClassKey) {
                return;
            }
            let showRecord = true;
            const locationNameLowerCase = location.locationName.toLowerCase();
            for (const locationNamePiece of locationNameFilterSplit) {
                if (!locationNameLowerCase.includes(locationNamePiece)) {
                    showRecord = false;
                    break;
                }
            }
            if (!showRecord) {
                return;
            }
            displayCount += 1;
            const locationClass = pts.getLocationClass(location.locationClassKey).locationClass;
            const trEle = document.createElement("tr");
            trEle.innerHTML =
                "<td>" +
                    "<a data-index=\"" + locationIndex.toString() + "\" href=\"#\">" +
                    cityssm.escapeHTML(location.locationName) +
                    "</a>" +
                    "</td>" +
                    "<td>" + cityssm.escapeHTML(locationClass) + "</td>";
            trEle.getElementsByTagName("a")[0].addEventListener("click", openEditLocationModalFn);
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
    };
    locationClassKeyFilterEle.addEventListener("change", renderLocationListFn);
    locationNameFilterEle.addEventListener("keyup", renderLocationListFn);
    pts.getDefaultConfigProperty("locationClasses", (locationClassesList) => {
        locationClassKeyFilterEle.innerHTML = "<option value=\"\">(All Location Classes)</option>";
        for (const locationClass of locationClassesList) {
            locationClassKeyOptionsHTML +=
                "<option value=\"" + locationClass.locationClassKey + "\">" +
                    cityssm.escapeHTML(locationClass.locationClass) +
                    "</option>";
        }
        locationClassKeyFilterEle.insertAdjacentHTML("beforeend", locationClassKeyOptionsHTML);
        renderLocationListFn();
    });
    document.getElementById("is-add-location-button").addEventListener("click", (clickEvent) => {
        clickEvent.preventDefault();
        let addLocationCloseModalFn;
        const addFn = (formEvent) => {
            formEvent.preventDefault();
            cityssm.postJSON("/admin/doAddLocation", formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    addLocationCloseModalFn();
                    locationList = responseJSON.locations;
                    renderLocationListFn();
                }
                else {
                    cityssm.alertModal("Location Not Added", responseJSON.message, "OK", "danger");
                }
            });
        };
        cityssm.openHtmlModal("location-add", {
            onshown(_modalEle, closeModalFn) {
                addLocationCloseModalFn = closeModalFn;
                document.getElementById("addLocation--locationClassKey")
                    .insertAdjacentHTML("beforeend", locationClassKeyOptionsHTML);
                document.getElementById("form--addLocation").addEventListener("submit", addFn);
            }
        });
    });
})();
