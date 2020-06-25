import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;

import type { ptsGlobal } from "./types";
declare const pts: ptsGlobal;

import type * as ptsTypes from "../../helpers/ptsTypes";

type UpdateOffenceResponseJSON = {
  success: boolean,
  message?: string,
  offences?: ptsTypes.ParkingOffence[]
};


(() => {

  const locationClassMap = new Map();

  const offenceMap = new Map<string, ptsTypes.ParkingOffence>();

  const offenceAccountNumberPatternString = exports.accountNumberPattern;
  delete exports.accountNumberPattern;

  const locationMap = new Map<string, ptsTypes.ParkingLocation>();
  const limitResultsCheckboxEle = <HTMLInputElement>document.getElementById("offenceFilter--limitResults");
  const resultsEle = document.getElementById("offenceResults");

  const locationInputEle = <HTMLInputElement>document.getElementById("offenceFilter--location");
  const locationTextEle = document.getElementById("offenceFilter--locationText");

  let locationKeyFilterIsSet = false;
  let locationKeyFilter = "";

  const bylawMap = new Map<string, ptsTypes.ParkingBylaw>();

  const bylawInputEle = <HTMLInputElement>document.getElementById("offenceFilter--bylaw");
  const bylawTextEle = document.getElementById("offenceFilter--bylawText");

  let bylawNumberFilterIsSet = false;
  let bylawNumberFilter = "";


  const getOffenceMapKeyFn = (bylawNumber: string, locationKey: string) => {
    return bylawNumber + "::::" + locationKey;
  };


  const loadOffenceMapFn = (offenceList: ptsTypes.ParkingOffence[]) => {

    offenceMap.clear();

    for (const offence of offenceList) {

      const offenceMapKey = getOffenceMapKeyFn(offence.bylawNumber, offence.locationKey);
      offenceMap.set(offenceMapKey, offence);
    }
  };


  const openEditOffenceModalFn = (clickEvent: Event) => {

    clickEvent.preventDefault();

    const buttonEle = <HTMLButtonElement>clickEvent.currentTarget;

    const offenceMapKey =
      getOffenceMapKeyFn(buttonEle.getAttribute("data-bylaw-number"), buttonEle.getAttribute("data-location-key"));

    const offence = offenceMap.get(offenceMapKey);
    const location = locationMap.get(offence.locationKey);
    const bylaw = bylawMap.get(offence.bylawNumber);

    let editOffenceModalCloseFn: () => void;

    const deleteFn = () => {

      cityssm.postJSON("/admin/doDeleteOffence", {
        bylawNumber: offence.bylawNumber,
        locationKey: offence.locationKey
      }, (responseJSON: UpdateOffenceResponseJSON) => {

        if (responseJSON.success) {

          loadOffenceMapFn(responseJSON.offences);
          editOffenceModalCloseFn();
          renderOffencesFn();

        }
      });
    };

    const confirmDeleteFn = (deleteClickEvent: Event) => {

      deleteClickEvent.preventDefault();

      cityssm.confirmModal(
        "Remove Offence?",
        "Are you sure you want to remove this offence?",
        "Yes, Remove Offence",
        "warning",
        deleteFn
      );

    };

    const submitFn = (formEvent: Event) => {

      formEvent.preventDefault();

      cityssm.postJSON("/admin/doUpdateOffence", formEvent.currentTarget,
        (responseJSON: UpdateOffenceResponseJSON) => {

          if (responseJSON.success) {

            loadOffenceMapFn(responseJSON.offences);
            editOffenceModalCloseFn();
            renderOffencesFn();
          }
        });
    };

    cityssm.openHtmlModal("offence-edit", {
      onshow(): void {

        (<HTMLInputElement>document.getElementById("offenceEdit--locationKey")).value = offence.locationKey;
        (<HTMLInputElement>document.getElementById("offenceEdit--bylawNumber")).value = offence.bylawNumber;

        (<HTMLSpanElement>document.getElementById("offenceEdit--locationName")).innerText = location.locationName;

        (<HTMLSpanElement>document.getElementById("offenceEdit--locationClass")).innerText =
          (locationClassMap.has(location.locationClassKey) ?
            locationClassMap.get(location.locationClassKey).locationClass :
            location.locationClassKey);

        document.getElementById("offenceEdit--bylawNumberSpan").innerText = bylaw.bylawNumber;

        document.getElementById("offenceEdit--bylawDescription").innerText = bylaw.bylawDescription;

        (<HTMLInputElement>document.getElementById("offenceEdit--parkingOffence")).value = offence.parkingOffence;

        (<HTMLInputElement>document.getElementById("offenceEdit--offenceAmount")).value =
          offence.offenceAmount.toFixed(2);

        (<HTMLInputElement>document.getElementById("offenceEdit--discountOffenceAmount")).value =
          offence.discountOffenceAmount.toFixed(2);

        (<HTMLInputElement>document.getElementById("offenceEdit--discountDays")).value =
          offence.discountDays.toString();

        const accountNumberEle = <HTMLInputElement>document.getElementById("offenceEdit--accountNumber");
        accountNumberEle.value = offence.accountNumber;
        accountNumberEle.setAttribute("pattern", offenceAccountNumberPatternString);

      },
      onshown(modalEle: HTMLElement, closeModalFn: () => void): void {

        editOffenceModalCloseFn = closeModalFn;

        document.getElementById("form--offenceEdit").addEventListener("submit", submitFn);

        modalEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", confirmDeleteFn);
      }
    });
  };


  const addOffenceFn = (bylawNumber: string, locationKey: string, returnAndRenderOffences: boolean,
    callbackFn: (responseJSON: UpdateOffenceResponseJSON) => void) => {

    cityssm.postJSON(
      "/admin/doAddOffence", {
        bylawNumber,
        locationKey,
        returnOffences: returnAndRenderOffences
      },
      (responseJSON: UpdateOffenceResponseJSON) => {

        if (responseJSON.success && responseJSON.offences && returnAndRenderOffences) {

          loadOffenceMapFn(responseJSON.offences);
          renderOffencesFn();
        }

        if (callbackFn) {
          callbackFn(responseJSON);
        }
      }
    );
  };


  const openAddOffenceFromListModalFn = () => {

    let doRefreshOnClose = false;

    const addFn = (clickEvent: Event) => {

      clickEvent.preventDefault();

      const linkEle = <HTMLAnchorElement>clickEvent.currentTarget;

      const bylawNumber = linkEle.getAttribute("data-bylaw-number");
      const locationKey = linkEle.getAttribute("data-location-key");

      addOffenceFn(bylawNumber, locationKey, false, (responseJSON) => {

        if (responseJSON.success) {
          linkEle.remove();
          doRefreshOnClose = true;
        }
      });
    };

    cityssm.openHtmlModal("offence-addFromList", {
      onshow(modalEle: HTMLElement): void {

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

        } else {

          titleHTML = "Select Locations";

          const bylaw = bylawMap.get(bylawNumberFilter);

          selectedHTML = cityssm.escapeHTML(bylaw.bylawNumber) + "<br />" +
            "<span class=\"is-size-7\">" + bylaw.bylawDescription + "</span>";

        }

        modalEle.getElementsByClassName("modal-card-title")[0].innerHTML = titleHTML;
        document.getElementById("addContainer--selected").innerHTML = selectedHTML;

      },
      onshown(): void {

        const listEle = document.createElement("div");
        listEle.className = "panel";

        let displayCount = 0;

        if (locationKeyFilterIsSet) {

          bylawMap.forEach((bylaw) => {

            const offenceMapKey = getOffenceMapKeyFn(bylaw.bylawNumber, locationKeyFilter);

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

        } else {

          locationMap.forEach((location) => {

            const offenceMapKey = getOffenceMapKeyFn(bylawNumberFilter, location.locationKey);

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

        } else {
          addResultsEle.appendChild(listEle);
        }
      },
      onremoved(): void {

        if (doRefreshOnClose) {

          cityssm.postJSON("/offences/doGetAllOffences", {}, (offenceList) => {
            loadOffenceMapFn(offenceList);
            renderOffencesFn();
          });
        }
      }
    });
  };


  const renderOffencesFn = () => {

    const tbodyEle = document.createElement("tbody");

    let matchCount = 0;

    const displayLimit = (limitResultsCheckboxEle.checked ?
      parseInt(limitResultsCheckboxEle.value, 10) :
      offenceMap.size);

    offenceMap.forEach((offence) => {

      if (matchCount >= displayLimit) {
        return;
      }

      // Ensure offence matches filters

      if ((locationKeyFilterIsSet && locationKeyFilter !== offence.locationKey) ||
        (bylawNumberFilterIsSet && bylawNumberFilter !== offence.bylawNumber)) {

        return;
      }

      // Ensure location record exists

      const location = locationMap.get(offence.locationKey);

      if (!location) {
        return;
      }

      // Ensure by-law record exists

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

      trEle.getElementsByTagName("button")[0].addEventListener("click", openEditOffenceModalFn);

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

      resultsEle.insertAdjacentHTML(
        "afterbegin",
        "<div class=\"message is-warning\">" +
        "<div class=\"message-body has-text-centered\">Limit Reached</div>" +
        "</div>"
      );

    }
  };


  document.getElementById("is-add-offence-button").addEventListener("click", (clickEvent) => {

    clickEvent.preventDefault();

    if (locationKeyFilterIsSet && bylawNumberFilterIsSet) {

      const bylaw = bylawMap.get(bylawNumberFilter);
      const location = locationMap.get(locationKeyFilter);

      cityssm.confirmModal(
        "Create Offence?",
        "<p class=\"has-text-centered\">Are you sure you want to create the offence record below?</p>" +
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
        "</div>",
        "Yes, Create Offence",
        "info",
        () => {

          addOffenceFn(bylawNumberFilter, locationKeyFilter, true, (responseJSON) => {

            if (!responseJSON.success) {

              cityssm.alertModal(
                "Offence Not Added",
                responseJSON.message,
                "OK",
                "danger"
              );

            } else if (responseJSON.message) {

              cityssm.alertModal(
                "Offence Added Successfully",
                responseJSON.message,
                "OK",
                "warning"
              );
            }
          });
        }
      );

    } else if (locationKeyFilterIsSet || bylawNumberFilterIsSet) {

      openAddOffenceFromListModalFn();

    } else {

      cityssm.alertModal(
        "How to Create a New Offence",
        "To add an offence, use the main filters to select either a location, a by-law, or both.",
        "OK",
        "info"
      );
    }
  });


  // Location filter setup


  const clearLocationFilterFn = () => {

    locationInputEle.value = "";
    cityssm.clearElement(locationTextEle);

    locationKeyFilter = "";
    locationKeyFilterIsSet = false;
  };

  const openSelectLocationFilterModalFn = () => {

    let selectLocationCloseModalFn: () => void;

    const selectFn = (clickEvent: Event) => {

      clickEvent.preventDefault();

      const location = locationMap.get((<HTMLAnchorElement>clickEvent.currentTarget).getAttribute("data-location-key"));

      locationKeyFilterIsSet = true;
      locationKeyFilter = location.locationKey;

      locationInputEle.value = location.locationName;

      selectLocationCloseModalFn();

      renderOffencesFn();

    };

    cityssm.openHtmlModal("location-select", {

      onshow(): void {

        const listEle = document.createElement("div");
        listEle.className = "panel mb-4";

        locationMap.forEach((location) => {

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
      onshown(_modalEle: HTMLElement, closeModalFn: () => void): void {
        selectLocationCloseModalFn = closeModalFn;
      }
    });
  };

  locationInputEle.addEventListener("dblclick", openSelectLocationFilterModalFn);

  document.getElementById("is-select-location-filter-button")
    .addEventListener("click", openSelectLocationFilterModalFn);

  document.getElementById("is-clear-location-filter-button").addEventListener("click", () => {

    clearLocationFilterFn();
    renderOffencesFn();
  });

  if (!locationKeyFilterIsSet) {
    clearLocationFilterFn();
  }


  // By-law filter setup


  const clearBylawFilterFn = () => {

    bylawInputEle.value = "";
    cityssm.clearElement(bylawTextEle);

    bylawNumberFilter = "";
    bylawNumberFilterIsSet = false;

  };

  const openSelectBylawFilterModalFn = () => {

    let selectBylawCloseModalFn: () => void;

    const selectFn = (clickEvent: Event) => {

      clickEvent.preventDefault();

      const bylaw = bylawMap.get((<HTMLAnchorElement>clickEvent.currentTarget).getAttribute("data-bylaw-number"));

      bylawNumberFilterIsSet = true;
      bylawNumberFilter = bylaw.bylawNumber;

      bylawInputEle.value = bylaw.bylawNumber;
      bylawTextEle.innerText = bylaw.bylawDescription;

      selectBylawCloseModalFn();

      renderOffencesFn();
    };

    cityssm.openHtmlModal("bylaw-select", {

      onshow(): void {

        const listEle = document.createElement("div");
        listEle.className = "panel mb-4";

        bylawMap.forEach((bylaw) => {

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
      onshown(_modalEle: HTMLElement, closeModalFn: () => void): void {

        selectBylawCloseModalFn = closeModalFn;
      }
    });
  };

  bylawInputEle.addEventListener("dblclick", openSelectBylawFilterModalFn);
  document.getElementById("is-select-bylaw-filter-button").addEventListener("click", openSelectBylawFilterModalFn);

  document.getElementById("is-clear-bylaw-filter-button").addEventListener("click", () => {

    clearBylawFilterFn();
    renderOffencesFn();
  });

  if (!bylawNumberFilterIsSet) {
    clearBylawFilterFn();
  }


  // Limit checkbox setup


  limitResultsCheckboxEle.addEventListener("change", renderOffencesFn);


  // Load locationMap


  for (const location of exports.locations) {
    locationMap.set(location.locationKey, location);
  }

  delete exports.locations;


  // Load bylawMap


  for (const bylaw of exports.bylaws) {
    bylawMap.set(bylaw.bylawNumber, bylaw);
  }

  delete exports.bylaws;


  // Load offenceList


  loadOffenceMapFn(exports.offences);
  delete exports.offences;


  // Load locationClasses


  pts.getDefaultConfigProperty("locationClasses", (locationClassList: ptsTypes.ConfigLocationClass[]) => {

    for (const locationClass of locationClassList) {
      locationClassMap.set(locationClass.locationClassKey, locationClass);
    }

    renderOffencesFn();
  });
})();
