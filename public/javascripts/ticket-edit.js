"use strict";

(function() {

  const ticketID = document.getElementById("ticket--ticketID").value;
  const isCreate = (ticketID === "");

  // Form Management

  {
    const formMessageEle = document.getElementById("container--form-message");

    let hasUnsavedChanges = false;

    const setUnsavedChangesFn = function(changeEvent) {

      pts.enableNavBlocker();

      hasUnsavedChanges = true;

      formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
        "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
        " <span>Unsaved Changes</span>" +
        "</div>";

    };

    const inputEles = document.querySelectorAll(".input, .select, .textarea");

    for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {

      inputEles[inputIndex].addEventListener("change", setUnsavedChangesFn);

    }

    document.getElementById("form--ticket").addEventListener("submit", function(formEvent) {

      formEvent.preventDefault();

      formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
        "<span>Saving ticket... </span>" +
        " <span class=\"icon\"><i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i></span>" +
        "</div>";

      pts.postJSON(
        (isCreate ? "/tickets/doCreateTicket" : "/tickets/doUpdateTicket"),
        formEvent.currentTarget,
        function(responseJSON) {

          if (responseJSON.success) {

            hasUnsavedChanges = false;
            formMessageEle.innerHTML = "<span class=\"tag is-light is-success is-medium\">" +
              "<span class=\"icon\"><i class=\"fas fa-check\" aria-hidden=\"true\"></i></span>" +
              " <span>Saved Successfully</span>" +
              "</div>";

          }
          
        }
      );

    });
  }

  // Location Lookup
  pts.getDefaultConfigProperty("locationClasses", function(locationClassesList) {

    let locationLookupCloseModalFn;
    const locationClassMap = {};
    let locationList = {};

    for (let index = 0; index < locationClassesList.length; index += 1) {

      const locationClassObj = locationClassesList[index];
      locationClassMap[locationClassObj.locationClassKey] = locationClassObj;

    }

    const setLocationFn = function(clickEvent) {

      clickEvent.preventDefault();

      const locationObj = locationList[parseInt(clickEvent.currentTarget.getAttribute("data-index"))];

      document.getElementById("ticket--locationKey").value = locationObj.locationKey;
      document.getElementById("ticket--locationName").value = locationObj.locationName;

      locationLookupCloseModalFn();

      locationList = [];

    };

    const populateLocationsFn = function() {

      pts.postJSON("/offences/doGetAllLocations", {}, function(locationListRes) {

        locationList = locationListRes;

        const listEle = document.createElement("div");
        listEle.className = "list is-hoverable";

        for (let index = 0; index < locationList.length; index += 1) {

          const locationObj = locationList[index];

          const locationClassObj = locationClassMap[locationObj.locationClassKey];

          const linkEle = document.createElement("a");
          linkEle.className = "list-item";
          linkEle.setAttribute("data-index", index);
          linkEle.setAttribute("href", "#");
          linkEle.addEventListener("click", setLocationFn);
          linkEle.innerHTML =
            "<div class=\"level\">" +
            "<div class=\"level-left\">" + pts.escapeHTML(locationObj.locationName) + "</div>" +
            (locationClassObj ?
              "<div class=\"level-right\">" +
              "<span class=\"tag is-primary\">" + pts.escapeHTML(locationClassObj.locationClass) + "</span>" +
              "</div>" :
              "") +
            "</div>";

          listEle.insertAdjacentElement("beforeend", linkEle);

        }

        const containerEle = document.getElementById("container--parkingLocations");
        pts.clearElement(containerEle);
        containerEle.insertAdjacentElement("beforeend", listEle);

      });

    };

    const openLocationLookupModalFn = function(clickEvent) {

      clickEvent.preventDefault();

      pts.openHtmlModal("ticket-setLocation", {
        onshown: function(modalEle, closeModalFn) {

          locationLookupCloseModalFn = closeModalFn;
          populateLocationsFn();

        },
        onremoved: function() {

          document.getElementById("is-location-lookup-button").focus();

        }
      });

    };

    document.getElementById("is-location-lookup-button").addEventListener("click", openLocationLookupModalFn);
    document.getElementById("ticket--locationName").addEventListener("dblclick", openLocationLookupModalFn);

  });

  // By-law / Offence Lookup
  {

    let bylawLookupCloseModalFn;
    let offenceList = [];

    const setBylawOffenceFn = function(clickEvent) {

      clickEvent.preventDefault();

      const offenceObj = offenceList[parseInt(clickEvent.currentTarget.getAttribute("data-index"))];

      document.getElementById("ticket--bylawNumber").value = offenceObj.bylawNumber;

      const offenceAmountEle = document.getElementById("ticket--offenceAmount");

      offenceAmountEle.classList.add("is-readonly");
      offenceAmountEle.setAttribute("readonly", "readonly");
      offenceAmountEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0].removeAttribute("disabled");
      offenceAmountEle.value = offenceObj.offenceAmount;

      document.getElementById("ticket--parkingOffence").value = offenceObj.bylawDescription;

      bylawLookupCloseModalFn();

      offenceList = [];

    };

    const populateBylawsFn = function() {

      const locationKey = document.getElementById("ticket--locationKey").value;
      const locationName = document.getElementById("ticket--locationName").value;

      pts.postJSON("/offences/doGetOffencesByLocation", {
        locationKey: locationKey
      }, function(offenceListRes) {

        offenceList = offenceListRes;

        const listEle = document.createElement("div");
        listEle.className = "list is-hoverable has-margin-bottom-20";

        for (let index = 0; index < offenceList.length; index += 1) {

          const offenceObj = offenceList[index];

          const linkEle = document.createElement("a");
          linkEle.className = "list-item";
          linkEle.setAttribute("data-index", index);
          linkEle.setAttribute("href", "#");
          linkEle.addEventListener("click", setBylawOffenceFn);
          linkEle.innerHTML =
            "<div class=\"columns\">" +
            ("<div class=\"column\">" +
              pts.escapeHTML(offenceObj.bylawNumber) + "<br />" +
              "<small>" + pts.escapeHTML(offenceObj.bylawDescription) + "</small>" +
              "</div>") +
            ("<div class=\"column is-narrow\">" +
              "$ " + offenceObj.offenceAmount.toFixed(2) +
              "</div>") +
            "</div>";

          listEle.insertAdjacentElement("beforeend", linkEle);

        }

        const containerEle = document.getElementById("container--bylawNumbers");
        pts.clearElement(containerEle);
        containerEle.appendChild(listEle);

      });

    };

    const openBylawLookupModalFn = function(clickEvent) {

      clickEvent.preventDefault();

      pts.openHtmlModal("ticket-setBylawOffence", {
        onshown: function(modalEle, closeModalFn) {

          bylawLookupCloseModalFn = closeModalFn;
          populateBylawsFn();

          document.getElementById("bylawLookup--searchStr").focus();

        },
        onremoved: function() {

          document.getElementById("is-bylaw-lookup-button").focus();

        }
      });

    };

    document.getElementById("is-bylaw-lookup-button").addEventListener("click", openBylawLookupModalFn);
    document.getElementById("ticket--bylawNumber").addEventListener("dblclick", openBylawLookupModalFn);

  }

  {

    const populateLicencePlateProvinceDatalistFn = function() {

      const datalistEle = document.getElementById("datalist--licencePlateProvince");
      pts.clearElement(datalistEle);

      const countryProperties = pts.getLicencePlateCountryProperties(document.getElementById("ticket--licencePlateCountry").value);

      if (countryProperties && countryProperties.provinces) {

        const provincesList = Object.values(countryProperties.provinces);

        for (let index = 0; index < provincesList.length; index += 1) {

          const optionEle = document.createElement("option");
          optionEle.setAttribute("value", provincesList[index].provinceShortName);
          datalistEle.appendChild(optionEle);

        }

      }

    };

    document.getElementById("ticket--licencePlateCountry").addEventListener("change", populateLicencePlateProvinceDatalistFn);
    pts.loadDefaultConfigProperties(populateLicencePlateProvinceDatalistFn);

  }

  // Unlock Buttons
  {

    const unlockFieldFn = function(unlockBtnClickEvent) {

      unlockBtnClickEvent.preventDefault();

      const unlockBtnEle = unlockBtnClickEvent.currentTarget;

      const inputTag = unlockBtnEle.getAttribute("data-unlock");

      const readOnlyEle = unlockBtnEle.closest(".field").getElementsByTagName(inputTag)[0];

      readOnlyEle.removeAttribute("readonly");
      readOnlyEle.classList.remove("is-readonly");

      readOnlyEle.focus();

      unlockBtnEle.setAttribute("disabled", "disabled");

    };

    const unlockBtnEles = document.getElementsByClassName("is-unlock-field-button");

    for (let buttonIndex = 0; buttonIndex < unlockBtnEles.length; buttonIndex += 1) {

      unlockBtnEles[buttonIndex].addEventListener("click", unlockFieldFn);

    }

  }

}());
