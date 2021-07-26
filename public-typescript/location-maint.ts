/* eslint-disable unicorn/filename-case, unicorn/prefer-module */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { ptsGlobal } from "../types/publicTypes";
import type * as configTypes from "../types/configTypes";
import type * as recordTypes from "../types/recordTypes";

declare const cityssm: cityssmGlobal;
declare const pts: ptsGlobal;

interface UpdateLocationResponseJSON {
  success: boolean;
  message?: string;
  locations?: recordTypes.ParkingLocation[];
}


(() => {

  let locationClassKeyOptionsHTML = "";

  const locationClassKeyFilterElement = document.querySelector("#locationFilter--locationClassKey") as HTMLSelectElement;
  const locationNameFilterElement = document.querySelector("#locationFilter--locationName") as HTMLInputElement;
  const locationResultsElement = document.querySelector("#locationResults") as HTMLElement;

  let locationList = exports.locations as recordTypes.ParkingLocation[];
  delete exports.locations;

  const openEditLocationModalFunction = (clickEvent: Event) => {

    clickEvent.preventDefault();

    const listIndex = Number.parseInt((clickEvent.currentTarget as HTMLButtonElement).getAttribute("data-index"), 10);
    const location = locationList[listIndex];

    let editLocationCloseModalFunction: () => void;

    const deleteFunction = () => {

      cityssm.postJSON("/admin/doDeleteLocation", {
        locationKey: location.locationKey
      }, (responseJSON: UpdateLocationResponseJSON) => {

        if (responseJSON.success) {

          editLocationCloseModalFunction();
          locationList = responseJSON.locations;
          renderLocationListFunction();
        }
      });
    };

    const confirmDeleteFunction = (deleteClickEvent: Event) => {

      deleteClickEvent.preventDefault();

      cityssm.confirmModal(
        "Delete Location",
        "Are you sure you want to remove \"" + location.locationName + "\" from the list of available options?",
        "Yes, Remove Location",
        "danger",
        deleteFunction
      );
    };

    const editFunction = (formEvent: Event) => {

      formEvent.preventDefault();

      cityssm.postJSON("/admin/doUpdateLocation", formEvent.currentTarget,
        (responseJSON: UpdateLocationResponseJSON) => {

          if (responseJSON.success) {

            editLocationCloseModalFunction();
            locationList = responseJSON.locations;
            renderLocationListFunction();
          }
        });
    };

    cityssm.openHtmlModal("location-edit", {
      onshow() {

        (document.querySelector("#editLocation--locationKey") as HTMLInputElement).value = location.locationKey;

        const locationClassKeyEditSelectElement =
          document.querySelector("#editLocation--locationClassKey") as HTMLSelectElement;

        locationClassKeyEditSelectElement.innerHTML = locationClassKeyOptionsHTML;

        if (!locationClassKeyEditSelectElement.querySelector("[value='" + location.locationClassKey + "']")) {

          locationClassKeyEditSelectElement.insertAdjacentHTML(
            "beforeend",
            "<option value=\"" + cityssm.escapeHTML(location.locationClassKey) + "\">" +
            cityssm.escapeHTML(location.locationClassKey) +
            "</option>"
          );

        }

        locationClassKeyEditSelectElement.value = location.locationClassKey;

        (document.querySelector("#editLocation--locationName") as HTMLInputElement).value = location.locationName;

      },
      onshown(modalElement, closeModalFunction) {

        editLocationCloseModalFunction = closeModalFunction;

        document.querySelector("#form--editLocation").addEventListener("submit", editFunction);

        modalElement.querySelector(".is-delete-button").addEventListener("click", confirmDeleteFunction);

      }
    });

  };

  const renderLocationListFunction = () => {

    let displayCount = 0;

    const locationClassKeyFilter = locationClassKeyFilterElement.value;
    const locationNameFilterSplit = locationNameFilterElement.value.trim().toLowerCase()
      .split(" ");

    const tbodyElement = document.createElement("tbody");

    for (const [locationIndex, location] of locationList.entries()) {

      if (locationClassKeyFilter !== "" && locationClassKeyFilter !== location.locationClassKey) {
        continue;
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
        continue;
      }

      displayCount += 1;

      const locationClass = pts.getLocationClass(location.locationClassKey).locationClass;

      const trElement = document.createElement("tr");

      trElement.innerHTML =
        "<td>" +
        "<a data-index=\"" + locationIndex.toString() + "\" href=\"#\">" +
        cityssm.escapeHTML(location.locationName) +
        "</a>" +
        "</td>" +
        "<td>" + cityssm.escapeHTML(locationClass) + "</td>";

      trElement.querySelector("a").addEventListener("click", openEditLocationModalFunction);

      tbodyElement.append(trElement);

    }

    cityssm.clearElement(locationResultsElement);

    if (displayCount === 0) {

      locationResultsElement.innerHTML = "<div class=\"message is-info\">" +
        "<div class=\"message-body\">There are no locations that meet your search criteria.</div>" +
        "</div>";

      return;
    }

    locationResultsElement.innerHTML = "<table class=\"table is-fixed is-striped is-hoverable is-fullwidth\">" +
      "<thead><tr>" +
      "<th>Location</th>" +
      "<th>Class</th>" +
      "</tr></thead>" +
      "</table>";

    locationResultsElement.querySelector("table").append(tbodyElement);
  };


  // Initialize location classes select and map


  locationClassKeyFilterElement.addEventListener("change", renderLocationListFunction);
  locationNameFilterElement.addEventListener("keyup", renderLocationListFunction);

  pts.getDefaultConfigProperty("locationClasses", (locationClassesList: configTypes.ConfigLocationClass[]) => {

    locationClassKeyFilterElement.innerHTML = "<option value=\"\">(All Location Classes)</option>";

    for (const locationClass of locationClassesList) {

      locationClassKeyOptionsHTML +=
        "<option value=\"" + locationClass.locationClassKey + "\">" +
        cityssm.escapeHTML(locationClass.locationClass) +
        "</option>";
    }

    locationClassKeyFilterElement.insertAdjacentHTML("beforeend", locationClassKeyOptionsHTML);

    renderLocationListFunction();
  });

  // Initialize add button

  document.querySelector("#is-add-location-button").addEventListener("click", (clickEvent) => {

    clickEvent.preventDefault();

    let addLocationCloseModalFunction: () => void;

    const addFunction = (formEvent: Event) => {

      formEvent.preventDefault();

      cityssm.postJSON("/admin/doAddLocation", formEvent.currentTarget, (responseJSON: UpdateLocationResponseJSON) => {

        if (responseJSON.success) {

          addLocationCloseModalFunction();
          locationList = responseJSON.locations;
          renderLocationListFunction();

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

      onshown(_modalElement, closeModalFunction): void {

        addLocationCloseModalFunction = closeModalFunction;

        document.querySelector("#addLocation--locationClassKey")
          .insertAdjacentHTML("beforeend", locationClassKeyOptionsHTML);

        document.querySelector("#form--addLocation").addEventListener("submit", addFunction);
      }
    });
  });
})();
