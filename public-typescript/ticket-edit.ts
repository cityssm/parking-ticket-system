/* eslint-disable unicorn/filename-case */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { ptsGlobal } from "../types/publicTypes";
import type * as recordTypes from "../types/recordTypes";

declare const cityssm: cityssmGlobal;
declare const pts: ptsGlobal;


(() => {

  const ticketID = (document.querySelector("#ticket--ticketID") as HTMLInputElement).value;
  const isCreate = (ticketID === "");

  /*
   * Form Management
   */

  const formMessageElement = document.querySelector("#container--form-message");

  // let hasUnsavedChanges = false;

  const setUnsavedChangesFunction = () => {

    cityssm.enableNavBlocker();

    // hasUnsavedChanges = true;

    formMessageElement.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
      "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
      " <span>Unsaved Changes</span>" +
      "</div>";
  };

  const inputElements = document.querySelectorAll(".input, .select, .textarea");

  for (const inputElement of inputElements) {
    inputElement.addEventListener("change", setUnsavedChangesFunction);
  }

  document.querySelector("#form--ticket").addEventListener("submit", (formEvent) => {

    formEvent.preventDefault();

    const ticketNumber = (document.querySelector("#ticket--ticketNumber") as HTMLInputElement).value;

    formMessageElement.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
      "<span>Saving ticket... </span>" +
      " <span class=\"icon\"><i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i></span>" +
      "</div>";

    cityssm.postJSON(
      (isCreate ? "/tickets/doCreateTicket" : "/tickets/doUpdateTicket"),
      formEvent.currentTarget,
      (responseJSON: { success: boolean; message?: string; ticketID?: number; nextTicketNumber?: string }) => {

        if (responseJSON.success) {

          cityssm.disableNavBlocker();
          // hasUnsavedChanges = false;

          formMessageElement.innerHTML = "<span class=\"tag is-light is-success is-medium\">" +
            "<span class=\"icon\"><i class=\"fas fa-check\" aria-hidden=\"true\"></i></span>" +
            " <span>Saved Successfully</span>" +
            "</div>";

        } else {

          setUnsavedChangesFunction();
          cityssm.alertModal("Ticket Not Saved", responseJSON.message, "OK", "danger");
        }

        if (responseJSON.success && isCreate) {

          cityssm.openHtmlModal("ticket-createSuccess", {
            onshow() {

              document.querySelector("#createSuccess--ticketNumber").textContent = ticketNumber;

              document.querySelector("#createSuccess--editTicketButton").setAttribute(
                "href",
                "/tickets/" + responseJSON.ticketID.toString() + "/edit"
              );

              document.querySelector("#createSuccess--newTicketButton").setAttribute(
                "href",
                "/tickets/new/" + responseJSON.nextTicketNumber
              );
            }
          });
        }
      }
    );
  });


  if (!isCreate) {

    document.querySelector("#is-delete-ticket-button").addEventListener("click", (clickEvent) => {

      clickEvent.preventDefault();

      cityssm.confirmModal(
        "Delete Ticket?",
        "Are you sure you want to delete this ticket record?",
        "Yes, Delete Ticket",
        "danger",
        () => {

          cityssm.postJSON(
            "/tickets/doDeleteTicket", {
              ticketID
            },
            (responseJSON: { success: boolean }) => {

              if (responseJSON.success) {
                window.location.href = "/tickets";
              }
            }
          );
        }
      );
    });
  }

  /*
   * Location Lookup
   */

  pts.getDefaultConfigProperty("locationClasses", () => {

    let locationLookupCloseModalFunction: () => void;

    let locationList = [];

    const clearLocationFunction = (clickEvent: Event) => {

      clickEvent.preventDefault();

      (document.querySelector("#ticket--locationKey") as HTMLInputElement).value = "";
      (document.querySelector("#ticket--locationName") as HTMLInputElement).value = "";

      locationLookupCloseModalFunction();

      locationList = [];
    };

    const setLocationFunction = (clickEvent: Event) => {

      clickEvent.preventDefault();

      const locationObject =
        locationList[Number.parseInt((clickEvent.currentTarget as HTMLAnchorElement).dataset.index, 10)];

      (document.querySelector("#ticket--locationKey") as HTMLInputElement).value = locationObject.locationKey;
      (document.querySelector("#ticket--locationName") as HTMLInputElement).value = locationObject.locationName;

      locationLookupCloseModalFunction();

      locationList = [];
    };

    const populateLocationsFunction = () => {

      cityssm.postJSON("/offences/doGetAllLocations", {}, (locationListResponse: recordTypes.ParkingLocation[]) => {

        locationList = locationListResponse;

        const listElement = document.createElement("div");
        listElement.className = "panel mb-4";

        for (const [index, locationObject] of locationList.entries()) {

          const locationClassObject = pts.getLocationClass(locationObject.locationClassKey);

          const linkElement = document.createElement("a");
          linkElement.className = "panel-block is-block";
          linkElement.dataset.index = index.toString();
          linkElement.setAttribute("href", "#");
          linkElement.addEventListener("click", setLocationFunction);
          linkElement.innerHTML =
            "<div class=\"level\">" +
            "<div class=\"level-left\">" + cityssm.escapeHTML(locationObject.locationName) + "</div>" +
            (locationClassObject
              ? "<div class=\"level-right\">" +
              "<span class=\"tag is-primary\">" + cityssm.escapeHTML(locationClassObject.locationClass) + "</span>" +
              "</div>"
              : "") +
            "</div>";

          listElement.append(linkElement);
        }

        const containerElement = document.querySelector("#container--parkingLocations") as HTMLElement;
        cityssm.clearElement(containerElement);
        containerElement.append(listElement);
      });
    };

    const openLocationLookupModalFunction = (clickEvent: Event) => {

      clickEvent.preventDefault();

      cityssm.openHtmlModal("ticket-setLocation", {
        onshown(_modalElement, closeModalFunction) {

          locationLookupCloseModalFunction = closeModalFunction;
          populateLocationsFunction();

          document.querySelector("#is-clear-location-button").addEventListener("click", clearLocationFunction);

        },
        onremoved(): void {
          (document.querySelector("#is-location-lookup-button") as HTMLButtonElement).focus();
        }
      });

    };

    document.querySelector("#is-location-lookup-button").addEventListener("click", openLocationLookupModalFunction);
    document.querySelector("#ticket--locationName").addEventListener("dblclick", openLocationLookupModalFunction);
  });

  /*
   * By-law / Offence Lookup
   */

  {

    let bylawLookupCloseModalFunction: () => void;
    let offenceList: recordTypes.ParkingOffence[] = [];
    let listItemElements: HTMLAnchorElement[] = [];

    const clearBylawOffenceFunction = (clickEvent: Event) => {

      clickEvent.preventDefault();

      (document.querySelector("#ticket--bylawNumber") as HTMLInputElement).value = "";

      // Offence Amount

      const offenceAmountElement = document.querySelector("#ticket--offenceAmount") as HTMLInputElement;

      offenceAmountElement.classList.add("is-readonly");
      offenceAmountElement.setAttribute("readonly", "readonly");
      offenceAmountElement.closest(".field").querySelector(".is-unlock-field-button")
        .removeAttribute("disabled");
      offenceAmountElement.value = "";

      // Discount Offence Amount

      const discountOffenceAmountElement = document.querySelector("#ticket--discountOffenceAmount") as HTMLInputElement;

      discountOffenceAmountElement.classList.add("is-readonly");
      discountOffenceAmountElement.setAttribute("readonly", "readonly");
      discountOffenceAmountElement.closest(".field").querySelector(".is-unlock-field-button")
        .removeAttribute("disabled");
      discountOffenceAmountElement.value = "";

      // Discount Days

      const discountDaysElement = document.querySelector("#ticket--discountDays") as HTMLInputElement;

      discountDaysElement.classList.add("is-readonly");
      discountDaysElement.setAttribute("readonly", "readonly");
      discountDaysElement.closest(".field").querySelector(".is-unlock-field-button")
        .removeAttribute("disabled");
      discountDaysElement.value = "";

      // Offence Description

      (document.querySelector("#ticket--parkingOffence") as HTMLTextAreaElement).value = "";

      bylawLookupCloseModalFunction();

      offenceList = [];
    };

    const setBylawOffenceFunction = (clickEvent: Event) => {

      clickEvent.preventDefault();

      const offenceObject =
        offenceList[Number.parseInt((clickEvent.currentTarget as HTMLInputElement).getAttribute("data-index"), 10)];

      (document.querySelector("#ticket--bylawNumber") as HTMLInputElement).value = offenceObject.bylawNumber;

      // Offence Amount

      const offenceAmountElement = document.querySelector("#ticket--offenceAmount") as HTMLInputElement;

      offenceAmountElement.classList.add("is-readonly");
      offenceAmountElement.setAttribute("readonly", "readonly");
      offenceAmountElement.closest(".field").querySelector(".is-unlock-field-button").removeAttribute("disabled");
      offenceAmountElement.value = offenceObject.offenceAmount.toFixed(2);

      // Discount Offence Amount

      const discountOffenceAmountElement = document.querySelector("#ticket--discountOffenceAmount") as HTMLInputElement;

      discountOffenceAmountElement.classList.add("is-readonly");
      discountOffenceAmountElement.setAttribute("readonly", "readonly");
      discountOffenceAmountElement.closest(".field").querySelector(".is-unlock-field-button").removeAttribute("disabled");
      discountOffenceAmountElement.value = offenceObject.discountOffenceAmount.toFixed(2);

      // Discount Days

      const discountDaysElement = document.querySelector("#ticket--discountDays") as HTMLInputElement;

      discountDaysElement.classList.add("is-readonly");
      discountDaysElement.setAttribute("readonly", "readonly");
      discountDaysElement.closest(".field").querySelector(".is-unlock-field-button").removeAttribute("disabled");
      discountDaysElement.value = offenceObject.discountDays.toString();

      // Offence Description

      (document.querySelector("#ticket--parkingOffence") as HTMLTextAreaElement).value = offenceObject.bylawDescription;

      bylawLookupCloseModalFunction();

      offenceList = [];

    };

    const populateBylawsFunction = () => {

      const locationKey = (document.querySelector("#ticket--locationKey") as HTMLInputElement).value;
      // const locationName = document.getElementById("ticket--locationName").value;

      cityssm.postJSON("/offences/doGetOffencesByLocation", {
        locationKey
      },
        (offenceListResponse: recordTypes.ParkingOffence[]) => {

          offenceList = offenceListResponse;
          listItemElements = [];

          const listElement = document.createElement("div");
          listElement.className = "panel mb-4";

          for (const [index, offenceObject] of offenceList.entries()) {

            const linkElement = document.createElement("a");
            linkElement.className = "panel-block is-block";
            linkElement.dataset.index = index.toString();
            linkElement.setAttribute("href", "#");
            linkElement.addEventListener("click", setBylawOffenceFunction);
            linkElement.innerHTML =
              "<div class=\"columns\">" +
              ("<div class=\"column\">" +
                "<span class=\"has-text-weight-semibold\">" +
                cityssm.escapeHTML(offenceObject.bylawNumber) +
                "</span><br />" +
                "<small>" + cityssm.escapeHTML(offenceObject.bylawDescription) + "</small>" +
                "</div>") +
              ("<div class=\"column is-narrow has-text-weight-semibold\">" +
                "$" + offenceObject.offenceAmount.toFixed(2) +
                "</div>") +
              "</div>";

            listElement.append(linkElement);
            listItemElements.push(linkElement);
          }

          const containerElement = document.querySelector("#container--bylawNumbers") as HTMLElement;
          cityssm.clearElement(containerElement);
          containerElement.append(listElement);
        });
    };

    const filterBylawsFunction = (keyupEvent: Event) => {

      const searchStringSplit = (keyupEvent.currentTarget as HTMLInputElement).value.trim().toLowerCase().split(" ");

      for (const [recordIndex, offenceRecord] of offenceList.entries()) {

        let displayRecord = true;

        for (const searchPiece of searchStringSplit) {

          if (!offenceRecord.bylawNumber.toLowerCase().includes(searchPiece) &&
            !offenceRecord.bylawDescription.toLowerCase().includes(searchPiece)) {

            displayRecord = false;
            break;
          }
        }

        if (displayRecord) {
          listItemElements[recordIndex].classList.remove("is-hidden");
        } else {
          listItemElements[recordIndex].classList.add("is-hidden");
        }
      }
    };

    const openBylawLookupModalFunction = (clickEvent: Event) => {

      clickEvent.preventDefault();

      cityssm.openHtmlModal("ticket-setBylawOffence", {
        onshown(_modalElement, closeModalFunction) {

          bylawLookupCloseModalFunction = closeModalFunction;
          populateBylawsFunction();

          const searchStringElement = document.querySelector("#bylawLookup--searchStr") as HTMLInputElement;

          searchStringElement.focus();
          searchStringElement.addEventListener("keyup", filterBylawsFunction);

          document.querySelector("#is-clear-bylaw-button").addEventListener("click", clearBylawOffenceFunction);

        },
        onremoved() {
          (document.querySelector("#is-bylaw-lookup-button") as HTMLButtonElement).focus();
        }
      });

    };

    document.querySelector("#is-bylaw-lookup-button").addEventListener("click", openBylawLookupModalFunction);
    document.querySelector("#ticket--bylawNumber").addEventListener("dblclick", openBylawLookupModalFunction);
  }

  /*
   * Licence Plate Required
   */

  {
    const licencePlateIsMissingCheckboxElement =
      document.querySelector("#ticket--licencePlateIsMissing") as HTMLInputElement;

    licencePlateIsMissingCheckboxElement.addEventListener("change", () => {

      if (licencePlateIsMissingCheckboxElement.checked) {

        document.querySelector("#ticket--licencePlateCountry").removeAttribute("required");
        document.querySelector("#ticket--licencePlateProvince").removeAttribute("required");
        document.querySelector("#ticket--licencePlateNumber").removeAttribute("required");

      } else {

        document.querySelector("#ticket--licencePlateCountry").setAttribute("required", "required");
        document.querySelector("#ticket--licencePlateProvince").setAttribute("required", "required");
        document.querySelector("#ticket--licencePlateNumber").setAttribute("required", "required");
      }
    });
  }

  /*
   * Licence Plate Province Datalist
   */

  const populateLicencePlateProvinceDatalistFunction = () => {

    const datalistElement = document.querySelector("#datalist--licencePlateProvince") as HTMLElement;
    cityssm.clearElement(datalistElement);

    const countryString = (document.querySelector("#ticket--licencePlateCountry") as HTMLInputElement).value;

    const countryProperties = pts.getLicencePlateCountryProperties(countryString);

    if (countryProperties ?.provinces) {

      const provincesList = Object.values(countryProperties.provinces);

      for (const province of provincesList) {

        const optionElement = document.createElement("option");
        optionElement.setAttribute("value", province.provinceShortName);
        datalistElement.append(optionElement);
      }
    }
  };

  document.querySelector("#ticket--licencePlateCountry")
    .addEventListener("change", populateLicencePlateProvinceDatalistFunction);

  pts.loadDefaultConfigProperties(populateLicencePlateProvinceDatalistFunction);


  /*
   * Unlock Buttons
   */

  const unlockFieldFunction = (unlockButtonClickEvent: Event) => {

    unlockButtonClickEvent.preventDefault();

    const unlockButtonElement = unlockButtonClickEvent.currentTarget as HTMLButtonElement;

    const inputTag = unlockButtonElement.getAttribute("data-unlock");

    const readOnlyElement = unlockButtonElement.closest(".field").querySelector(inputTag) as HTMLInputElement;

    readOnlyElement.removeAttribute("readonly");
    readOnlyElement.classList.remove("is-readonly");

    readOnlyElement.focus();

    unlockButtonElement.setAttribute("disabled", "disabled");
  };

  const unlockButtonElements = document.querySelectorAll(".is-unlock-field-button");

  for (const unlockButtonElement of unlockButtonElements) {
    unlockButtonElement.addEventListener("click", unlockFieldFunction);
  }
})();
