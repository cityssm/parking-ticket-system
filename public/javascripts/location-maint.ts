import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { ptsGlobal } from "../../types/publicTypes";
import type * as configTypes from "../../types/configTypes";
import type * as recordTypes from "../../types/recordTypes";

declare const cityssm: cityssmGlobal;
declare const pts: ptsGlobal;

interface UpdateLocationResponseJSON {
  success: boolean;
  message?: string;
  locations?: recordTypes.ParkingLocation[];
}


(() => {

  let locationClassKeyOptionsHTML = "";

  const locationClassKeyFilterEle = document.getElementById("locationFilter--locationClassKey") as HTMLSelectElement;
  const locationNameFilterEle = document.getElementById("locationFilter--locationName") as HTMLInputElement;
  const locationResultsEle = document.getElementById("locationResults");

  let locationList = exports.locations as recordTypes.ParkingLocation[];
  delete exports.locations;

  const openEditLocationModalFn = (clickEvent: Event) => {

    clickEvent.preventDefault();

    const listIndex = parseInt((clickEvent.currentTarget as HTMLButtonElement).getAttribute("data-index"), 10);
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

      cityssm.postJSON("/admin/doUpdateLocation", formEvent.currentTarget,
        (responseJSON: UpdateLocationResponseJSON) => {

          if (responseJSON.success) {

            editLocationCloseModalFn();
            locationList = responseJSON.locations;
            renderLocationListFn();
          }
        });
    };

    cityssm.openHtmlModal("location-edit", {
      onshow(): void {

        (document.getElementById("editLocation--locationKey") as HTMLInputElement).value = location.locationKey;

        const locationClassKeyEditSelectEle =
          document.getElementById("editLocation--locationClassKey") as HTMLSelectElement;

        locationClassKeyEditSelectEle.innerHTML = locationClassKeyOptionsHTML;

        if (!locationClassKeyEditSelectEle.querySelector("[value='" + location.locationClassKey + "']")) {

          locationClassKeyEditSelectEle.insertAdjacentHTML(
            "beforeend",
            "<option value=\"" + cityssm.escapeHTML(location.locationClassKey) + "\">" +
            cityssm.escapeHTML(location.locationClassKey) +
            "</option>"
          );

        }

        locationClassKeyEditSelectEle.value = location.locationClassKey;

        (document.getElementById("editLocation--locationName") as HTMLInputElement).value = location.locationName;

      },
      onshown(modalEle: HTMLElement, closeModalFn: () => void): void {

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


  // Initialize location classes select and map


  locationClassKeyFilterEle.addEventListener("change", renderLocationListFn);
  locationNameFilterEle.addEventListener("keyup", renderLocationListFn);

  pts.getDefaultConfigProperty("locationClasses", (locationClassesList: configTypes.ConfigLocationClass[]) => {

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

      onshown(_modalEle: HTMLElement, closeModalFn: () => void): void {

        addLocationCloseModalFn = closeModalFn;

        document.getElementById("addLocation--locationClassKey")
          .insertAdjacentHTML("beforeend", locationClassKeyOptionsHTML);

        document.getElementById("form--addLocation").addEventListener("submit", addFn);
      }
    });
  });
})();
