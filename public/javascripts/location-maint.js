"use strict";

(function() {

  let locationClassKeyOptionsHTML = "";

  const locationClassKeyFilterEle = document.getElementById("locationFilter--locationClassKey");
  const locationNameFilterEle = document.getElementById("locationFilter--locationName");
  const locationResultsEle = document.getElementById("locationResults");

  const locationClassKeyMap = new Map();

  let renderLocationList;

  let locationList = pts.locationsInit;
  delete pts.locationsInit;

  function openEditLocationModal(clickEvent) {

    clickEvent.preventDefault();

    const listIndex = parseInt(clickEvent.currentTarget.getAttribute("data-index"));
    const location = locationList[listIndex];

    let editLocationCloseModalFn;

    const deleteFn = function() {

      pts.postJSON("/admin/doDeleteLocation", {
        locationKey: location.locationKey
      }, function(responseJSON) {

        if (responseJSON.success) {

          editLocationCloseModalFn();
          locationList = responseJSON.locations;
          renderLocationList();

        }

      });

    };

    const confirmDeleteFn = function(deleteClickEvent) {

      deleteClickEvent.preventDefault();

      pts.confirmModal(
        "Delete Location",
        "Are you sure you want to remove \"" + location.locationName + "\" from the list of available options?",
        "Yes, Remove Location",
        "danger",
        deleteFn
      );

    };

    const editFn = function(formEvent) {

      formEvent.preventDefault();

      pts.postJSON("/admin/doUpdateLocation", formEvent.currentTarget, function(responseJSON) {

        if (responseJSON.success) {

          editLocationCloseModalFn();
          locationList = responseJSON.locations;
          renderLocationList();

        }

      });

    };

    pts.openHtmlModal("location-edit", {
      onshow: function() {

        document.getElementById("editLocation--locationKey").value = location.locationKey;

        const locationClassKeyEditSelectEle = document.getElementById("editLocation--locationClassKey");

        locationClassKeyEditSelectEle.innerHTML = locationClassKeyOptionsHTML;

        if (!locationClassKeyMap.has(location.locationClassKey)) {

          locationClassKeyEditSelectEle.insertAdjacentHTML(
            "beforeend",
            "<option value=\"" + pts.escapeHTML(location.locationClassKey) + "\">" +
            pts.escapeHTML(location.locationClassKey) +
            "</option>"
          );

        }

        locationClassKeyEditSelectEle.value = location.locationClassKey;

        document.getElementById("editLocation--locationName").value = location.locationName;

      },
      onshown: function(modalEle, closeModalFn) {

        editLocationCloseModalFn = closeModalFn;

        document.getElementById("form--editLocation").addEventListener("submit", editFn);

        modalEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", confirmDeleteFn);

      }
    });

  }

  renderLocationList = function() {

    let displayCount = 0;

    const locationClassKeyFilter = locationClassKeyFilterEle.value;
    const locationNameFilterSplit = locationNameFilterEle.value.trim().toLowerCase()
      .split(" ");

    const tbodyEle = document.createElement("tbody");

    for (let locationIndex = 0; locationIndex < locationList.length; locationIndex += 1) {

      const location = locationList[locationIndex];

      if (locationClassKeyFilter !== "" && locationClassKeyFilter !== location.locationClassKey) {

        continue;

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

        continue;

      }

      displayCount += 1;

      const locationClass = locationClassKeyMap.has(location.locationClassKey) ?
        locationClassKeyMap.get(location.locationClassKey).locationClass :
        location.locationClassKey;

      const trEle = document.createElement("tr");

      trEle.innerHTML =
        "<td>" +
        "<a data-index=\"" + locationIndex + "\" href=\"#\">" +
        pts.escapeHTML(location.locationName) +
        "</a>" +
        "</td>" +
        "<td>" + pts.escapeHTML(locationClass) + "</td>";

      trEle.getElementsByTagName("a")[0].addEventListener("click", openEditLocationModal);

      tbodyEle.appendChild(trEle);

    }

    pts.clearElement(locationResultsEle);

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


  locationClassKeyFilterEle.addEventListener("change", renderLocationList);
  locationNameFilterEle.addEventListener("keyup", renderLocationList);

  pts.getDefaultConfigProperty("locationClasses", function(locationClassesList) {

    locationClassKeyFilterEle.innerHTML = "<option value=\"\">(All Location Classes)</option>";

    for (let index = 0; index < locationClassesList.length; index += 1) {

      const locationClass = locationClassesList[index];

      locationClassKeyOptionsHTML +=
        "<option value=\"" + locationClass.locationClassKey + "\">" +
        pts.escapeHTML(locationClass.locationClass) +
        "</option>";

      locationClassKeyMap.set(locationClass.locationClassKey, locationClass);

    }

    locationClassKeyFilterEle.insertAdjacentHTML("beforeend", locationClassKeyOptionsHTML);

    renderLocationList();

  });

  // Initialize add button

  document.getElementById("is-add-location-button").addEventListener("click", function(clickEvent) {

    clickEvent.preventDefault();

    let addLocationCloseModalFn;

    const addFn = function(formEvent) {

      formEvent.preventDefault();

      pts.postJSON("/admin/doAddLocation", formEvent.currentTarget, function(responseJSON) {

        if (responseJSON.success) {

          addLocationCloseModalFn();
          locationList = responseJSON.locations;
          renderLocationList();

        } else {

          pts.alertModal(
            "Location Not Added",
            responseJSON.message,
            "OK",
            "danger"
          );

        }

      });

    };

    pts.openHtmlModal("location-add", {

      onshown: function(modalEle, closeModalFn) {

        addLocationCloseModalFn = closeModalFn;

        document.getElementById("addLocation--locationClassKey")
          .insertAdjacentHTML("beforeend", locationClassKeyOptionsHTML);

        document.getElementById("form--addLocation").addEventListener("submit", addFn);

      }

    });

  });

}());
