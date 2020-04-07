"use strict";

(function() {

  let locationClassMap = new Map();

  let offenceList = [];

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

  function renderOffences() {

    const tbodyEle = document.createElement("tbody");

    let matchCount = 0;

    const displayLimit = (limitResultsCheckboxEle.checked ?
      parseInt(limitResultsCheckboxEle.value) :
      offenceList.length);

    for (let offenceIndex = 0; offenceIndex < offenceList.length; offenceIndex += 1) {

      const offence = offenceList[offenceIndex];

      // Ensure offence matches filters

      if ((locationKeyFilterIsSet && locationKeyFilter !== offence.locationKey) ||
        (bylawNumberFilterIsSet && bylawNumberFilter !== offence.bylawNumber)) {

        continue;

      }

      // Ensure location record exists

      const location = locationMap.get(offence.locationKey);

      if (!location) {

        continue;

      }

      // Ensure by-law record exists

      const bylaw = bylawMap.get(offence.bylawNumber);

      if (!bylaw) {

        continue;

      }

      matchCount += 1;

      if (matchCount > displayLimit) {

        break;

      }

      const trEle = document.createElement("tr");

      trEle.innerHTML =
        ("<td class=\"has-border-right-width-2\">" +
          pts.escapeHTML(location.locationName) + "<br />" +
          "<span class=\"is-size-7\">" +
          (locationClassMap.has(location.locationClassKey) ?
            locationClassMap.get(location.locationClassKey).locationClass :
            location.locationClassKey) +
          "</span>" +
          "</td>") +
        ("<td class=\"has-border-right-width-2\">" +
          "<strong>" + pts.escapeHTML(bylaw.bylawNumber) + "</strong><br />" +
          "<span class=\"is-size-7\">" + pts.escapeHTML(bylaw.bylawDescription) + "</span>" +
          "</td>") +
        ("<td class=\"has-text-right\">" +
          "$" + offence.offenceAmount.toFixed(2) + "<br />" +
          "<span class=\"is-size-7\">" + offence.accountNumber + "</span>" +
          "</td>") +
        ("<td class=\"has-border-right-width-2\">" +
          "<div class=\"is-size-7\">" +
          pts.escapeHTML(offence.parkingOffence) +
          "</div>" +
          "</td>") +
        ("<td class=\"has-text-right\">" +
          "<button class=\"button is-small\" data-index=\"" + offenceIndex + "\" type=\"button\">" +
          "<span class=\"icon is-small\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
          "<span>Edit</span>" +
          "</button>" +
          "</td>");

      tbodyEle.appendChild(trEle);

    }

    pts.clearElement(resultsEle);

    if (matchCount === 0) {

      resultsEle.innerHTML = "<div class=\"message is-info\">" +
        "<div class=\"message-body\">There are no offences that match the given criteria.</div>" +
        "</div>";

      return;

    }

    resultsEle.innerHTML = "<table class=\"table is-striped is-hoverable is-fullwidth\">" +
      "<thead>" +
      "<tr>" +
      "<th class=\"has-border-right-width-2\">Location</th>" +
      "<th class=\"has-border-right-width-2\">By-Law</th>" +
      "<th class=\"has-border-right-width-2\" colspan=\"2\">Offence</th>" +
      "<th></th>" +
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

  }

  // Location filter setup

  document.getElementById("is-select-location-filter-button").addEventListener("click", function() {

    let selectLocationCloseModalFn;

    const selectFn = function(clickEvent) {

      clickEvent.preventDefault();

      const location = locationMap.get(clickEvent.currentTarget.getAttribute("data-location-key"));

      locationKeyFilterIsSet = true;
      locationKeyFilter = location.locationKey;

      locationInputEle.value = location.locationName;

      selectLocationCloseModalFn();

      renderOffences();

    };

    pts.openHtmlModal("location-select", {

      onshow: function() {

        const listEle = document.createElement("div");
        listEle.className = "list is-hoverable has-margin-bottom-20";

        for (const location of locationMap.values()) {

          const linkEle = document.createElement("a");

          linkEle.className = "list-item";
          linkEle.setAttribute("data-location-key", location.locationKey);
          linkEle.setAttribute("href", "#");

          linkEle.innerHTML = "<div class=\"level\">" +
            ("<div class=\"level-left\">" +
              pts.escapeHTML(location.locationName) +
              "</div>") +
            "<div class=\"level-right\">" +
            pts.escapeHTML(locationClassMap.has(location.locationClassKey) ?
              locationClassMap.get(location.locationClassKey).locationClass :
              location.locationClassKey) +
            "</div>" +
            "</div>";

          linkEle.addEventListener("click", selectFn);

          listEle.appendChild(linkEle);

        }

        const listContainerEle = document.getElementById("container--parkingLocations");
        pts.clearElement(listContainerEle);
        listContainerEle.appendChild(listEle);

      },
      onshown: function(modalEle, closeModalFn) {

        selectLocationCloseModalFn = closeModalFn;

      }
    });

  });

  document.getElementById("is-clear-location-filter-button").addEventListener("click", function() {

    locationInputEle.value = "";
    pts.clearElement(locationTextEle);

    locationKeyFilter = "";
    locationKeyFilterIsSet = false;

    renderOffences();

  });

  // By-law filter setup

  document.getElementById("is-clear-bylaw-filter-button").addEventListener("click", function() {

    bylawInputEle.value = "";
    pts.clearElement(bylawTextEle);

    bylawNumberFilter = "";
    bylawNumberFilterIsSet = false;

    renderOffences();

  });

  // Limit checkbox setup

  limitResultsCheckboxEle.addEventListener("change", renderOffences);

  // Load locationMap

  for (let index = 0; index < pts.locationsInit.length; index += 1) {

    const location = pts.locationsInit[index];
    locationMap.set(location.locationKey, location);

  }

  delete pts.locationsInit;

  // Load bylawMap

  for (let index = 0; index < pts.bylawsInit.length; index += 1) {

    const bylaw = pts.bylawsInit[index];
    bylawMap.set(bylaw.bylawNumber, bylaw);

  }

  delete pts.bylawsInit;

  // Load offenceList

  offenceList = pts.offencesInit;
  delete pts.offencesInit;

  pts.getDefaultConfigProperty("locationClasses", function(locationClassList) {

    for (let index = 0; index < locationClassList.length; index += 1) {

      const locationClass = locationClassList[index];
      locationClassMap.set(locationClass.locationClassKey, locationClass);

    }

    renderOffences();

  });

}());
