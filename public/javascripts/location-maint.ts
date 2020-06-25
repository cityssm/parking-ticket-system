import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;

import type { ptsGlobal } from "./types";
declare const pts: ptsGlobal;

import type * as ptsTypes from "../../helpers/ptsTypes";

type UpdateLocationResponseJSON = {
  success: boolean,
  message?: string,
  locations?: ptsTypes.ParkingLocation[]
};


(() => {

  let locationClassKeyOptionsHTML = "";

  const locationClassKeyFilterEle = <HTMLSelectElement>document.getElementById("locationFilter--locationClassKey");
  const locationNameFilterEle = <HTMLInputElement>document.getElementById("locationFilter--locationName");
  const locationResultsEle = document.getElementById("locationResults");

  const locationClassKeyMap = new Map();

  let locationList = <ptsTypes.ParkingLocation[]>exports.locations;
  delete exports.locations;

  const openEditLocationModalFn = (clickEvent: Event) => {

    clickEvent.preventDefault();

    const listIndex = parseInt((<HTMLButtonElement>clickEvent.currentTarget).getAttribute("data-index"), 10);
    const location = locationList[listIndex];

    let editLocationCloseModalFn: () => void;

    const deleteFn = () => {

      cityssm.postJSON("/admin/doDeleteLocation", {
        locationKey: location.locationKey
      }, (responseJSON: UpdateLocationResponseJSON) => {

        if (responseJSON.success) {

          editLocationCloseModalFn();
          locationList = responseJSON.locations;
          renderLocationListFn();

        }
      });
    };

    const confirmDeleteFn = (deleteClickEvent: Event) => {

      deleteClickEvent.preventDefault();

      cityssm.confirmModal(
        "Delete Location",
        "Are you sure you want to remove \"" + location.locationName + "\" from the list of available options?",
        "Yes, Remove Location",
        "danger",
        deleteFn
      );

    };

    const editFn = (formEvent: Event) => {

      formEvent.preventDefault();

      cityssm.postJSON("/admin/doUpdateLocation", formEvent.currentTarget, (responseJSON: UpdateLocationResponseJSON) => {

        if (responseJSON.success) {

          editLocationCloseModalFn();
          locationList = responseJSON.locations;
          renderLocationListFn();

        }

      });

    };

    cityssm.openHtmlModal("location-edit", {
      onshow() {

        (<HTMLInputElement>document.getElementById("editLocation--locationKey")).value = location.locationKey;

        const locationClassKeyEditSelectEle = <HTMLSelectElement>document.getElementById("editLocation--locationClassKey");

        locationClassKeyEditSelectEle.innerHTML = locationClassKeyOptionsHTML;

        if (!locationClassKeyMap.has(location.locationClassKey)) {

          locationClassKeyEditSelectEle.insertAdjacentHTML(
            "beforeend",
            "<option value=\"" + cityssm.escapeHTML(location.locationClassKey) + "\">" +
            cityssm.escapeHTML(location.locationClassKey) +
            "</option>"
          );

        }

        locationClassKeyEditSelectEle.value = location.locationClassKey;

        (<HTMLInputElement>document.getElementById("editLocation--locationName")).value = location.locationName;

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

        if (locationNameLowerCase.indexOf(locationNamePiece) === -1) {

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


  // Initialize location classes select and map


  locationClassKeyFilterEle.addEventListener("change", renderLocationListFn);
  locationNameFilterEle.addEventListener("keyup", renderLocationListFn);

  pts.getDefaultConfigProperty("locationClasses", (locationClassesList: ptsTypes.ConfigLocationClass[]) => {

    locationClassKeyFilterEle.innerHTML = "<option value=\"\">(All Location Classes)</option>";

    for (const locationClass of locationClassesList) {

      locationClassKeyOptionsHTML +=
        "<option value=\"" + locationClass.locationClassKey + "\">" +
        cityssm.escapeHTML(locationClass.locationClass) +
        "</option>";

      locationClassKeyMap.set(locationClass.locationClassKey, locationClass);

    }

    locationClassKeyFilterEle.insertAdjacentHTML("beforeend", locationClassKeyOptionsHTML);

    renderLocationListFn();

  });

  // Initialize add button

  document.getElementById("is-add-location-button").addEventListener("click", (clickEvent) => {

    clickEvent.preventDefault();

    let addLocationCloseModalFn: () => void;

    const addFn = (formEvent: Event) => {

      formEvent.preventDefault();

      cityssm.postJSON("/admin/doAddLocation", formEvent.currentTarget, (responseJSON: UpdateLocationResponseJSON) => {

        if (responseJSON.success) {

          addLocationCloseModalFn();
          locationList = responseJSON.locations;
          renderLocationListFn();

        } else {

          cityssm.alertModal(
            "Location Not Added",
            responseJSON.message,
            "OK",
            "danger"
          );
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
