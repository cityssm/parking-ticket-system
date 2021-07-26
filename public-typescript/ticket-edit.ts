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
            onshow(): void {

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

      cityssm.postJSON("/offences/doGetAllLocations", {}, (locationListRes: recordTypes.ParkingLocation[]) => {

        locationList = locationListRes;

        const listEle = document.createElement("div");
        listEle.className = "panel mb-4";

        locationList.forEach((locationObj, index) => {

          const locationClassObj = pts.getLocationClass(locationObj.locationClassKey);

          const linkEle = document.createElement("a");
          linkEle.className = "panel-block is-block";
          linkEle.setAttribute("data-index", index.toString());
          linkEle.setAttribute("href", "#");
          linkEle.addEventListener("click", setLocationFunction);
          linkEle.innerHTML =
            "<div class=\"level\">" +
            "<div class=\"level-left\">" + cityssm.escapeHTML(locationObj.locationName) + "</div>" +
            (locationClassObj
              ? "<div class=\"level-right\">" +
              "<span class=\"tag is-primary\">" + cityssm.escapeHTML(locationClassObj.locationClass) + "</span>" +
              "</div>"
              : "") +
            "</div>";

          listEle.insertAdjacentElement("beforeend", linkEle);
        });

        const containerEle = document.getElementById("container--parkingLocations");
        cityssm.clearElement(containerEle);
        containerEle.insertAdjacentElement("beforeend", listEle);
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
    let listItemEles: HTMLAnchorElement[] = [];

    const clearBylawOffenceFn = (clickEvent: Event) => {

      clickEvent.preventDefault();

      (document.getElementById("ticket--bylawNumber") as HTMLInputElement).value = "";

      // Offence Amount

      const offenceAmountEle = document.getElementById("ticket--offenceAmount") as HTMLInputElement;

      offenceAmountEle.classList.add("is-readonly");
      offenceAmountEle.setAttribute("readonly", "readonly");
      offenceAmountEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
        .removeAttribute("disabled");
      offenceAmountEle.value = "";

      // Discount Offence Amount

      const discountOffenceAmountEle = document.getElementById("ticket--discountOffenceAmount") as HTMLInputElement;

      discountOffenceAmountEle.classList.add("is-readonly");
      discountOffenceAmountEle.setAttribute("readonly", "readonly");
      discountOffenceAmountEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
        .removeAttribute("disabled");
      discountOffenceAmountEle.value = "";

      // Discount Days

      const discountDaysEle = document.getElementById("ticket--discountDays") as HTMLInputElement;

      discountDaysEle.classList.add("is-readonly");
      discountDaysEle.setAttribute("readonly", "readonly");
      discountDaysEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
        .removeAttribute("disabled");
      discountDaysEle.value = "";

      // Offence Description

      (document.getElementById("ticket--parkingOffence") as HTMLTextAreaElement).value = "";

      bylawLookupCloseModalFunction();

      offenceList = [];
    };

    const setBylawOffenceFn = (clickEvent: Event) => {

      clickEvent.preventDefault();

      const offenceObj =
        offenceList[parseInt((clickEvent.currentTarget as HTMLInputElement).getAttribute("data-index"), 10)];

      (document.getElementById("ticket--bylawNumber") as HTMLInputElement).value = offenceObj.bylawNumber;

      // Offence Amount

      const offenceAmountEle = document.getElementById("ticket--offenceAmount") as HTMLInputElement;

      offenceAmountEle.classList.add("is-readonly");
      offenceAmountEle.setAttribute("readonly", "readonly");
      offenceAmountEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
        .removeAttribute("disabled");
      offenceAmountEle.value = offenceObj.offenceAmount.toFixed(2);

      // Discount Offence Amount

      const discountOffenceAmountEle = document.getElementById("ticket--discountOffenceAmount") as HTMLInputElement;

      discountOffenceAmountEle.classList.add("is-readonly");
      discountOffenceAmountEle.setAttribute("readonly", "readonly");
      discountOffenceAmountEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
        .removeAttribute("disabled");
      discountOffenceAmountEle.value = offenceObj.discountOffenceAmount.toFixed(2);

      // Discount Days

      const discountDaysEle = document.getElementById("ticket--discountDays") as HTMLInputElement;

      discountDaysEle.classList.add("is-readonly");
      discountDaysEle.setAttribute("readonly", "readonly");
      discountDaysEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0]
        .removeAttribute("disabled");
      discountDaysEle.value = offenceObj.discountDays.toString();

      // Offence Description

      (document.getElementById("ticket--parkingOffence") as HTMLTextAreaElement).value = offenceObj.bylawDescription;

      bylawLookupCloseModalFunction();

      offenceList = [];

    };

    const populateBylawsFn = () => {

      const locationKey = (document.getElementById("ticket--locationKey") as HTMLInputElement).value;
      // const locationName = document.getElementById("ticket--locationName").value;

      cityssm.postJSON("/offences/doGetOffencesByLocation", {
        locationKey
      },
        (offenceListRes: recordTypes.ParkingOffence[]) => {

          offenceList = offenceListRes;
          listItemEles = [];

          const listEle = document.createElement("div");
          listEle.className = "panel mb-4";

          offenceList.forEach((offenceObj, index) => {

            const linkEle = document.createElement("a");
            linkEle.className = "panel-block is-block";
            linkEle.setAttribute("data-index", index.toString());
            linkEle.setAttribute("href", "#");
            linkEle.addEventListener("click", setBylawOffenceFn);
            linkEle.innerHTML =
              "<div class=\"columns\">" +
              ("<div class=\"column\">" +
                "<span class=\"has-text-weight-semibold\">" +
                cityssm.escapeHTML(offenceObj.bylawNumber) +
                "</span><br />" +
                "<small>" + cityssm.escapeHTML(offenceObj.bylawDescription) + "</small>" +
                "</div>") +
              ("<div class=\"column is-narrow has-text-weight-semibold\">" +
                "$" + offenceObj.offenceAmount.toFixed(2) +
                "</div>") +
              "</div>";

            listEle.insertAdjacentElement("beforeend", linkEle);
            listItemEles.push(linkEle);
          });

          const containerEle = document.getElementById("container--bylawNumbers");
          cityssm.clearElement(containerEle);
          containerEle.appendChild(listEle);
        });
    };

    const filterBylawsFn = (keyupEvent: Event) => {

      const searchStringSplit = (keyupEvent.currentTarget as HTMLInputElement).value.trim().toLowerCase().split(" ");

      offenceList.forEach((offenceRecord, recordIndex) => {

        let displayRecord = true;

        for (const searchPiece of searchStringSplit) {

          if (!offenceRecord.bylawNumber.toLowerCase().includes(searchPiece) &&
            !offenceRecord.bylawDescription.toLowerCase().includes(searchPiece)) {

            displayRecord = false;
            break;
          }
        }

        if (displayRecord) {
          listItemEles[recordIndex].classList.remove("is-hidden");
        } else {
          listItemEles[recordIndex].classList.add("is-hidden");
        }
      });
    };

    const openBylawLookupModalFn = (clickEvent: Event) => {

      clickEvent.preventDefault();

      cityssm.openHtmlModal("ticket-setBylawOffence", {
        onshown(_modalEle: HTMLElement, closeModalFn: () => void): void {

          bylawLookupCloseModalFunction = closeModalFn;
          populateBylawsFn();

          const searchStringEle = document.getElementById("bylawLookup--searchStr") as HTMLInputElement;

          searchStringEle.focus();
          searchStringEle.addEventListener("keyup", filterBylawsFn);

          document.getElementById("is-clear-bylaw-button").addEventListener("click", clearBylawOffenceFn);

        },
        onremoved(): void {
          document.getElementById("is-bylaw-lookup-button").focus();
        }
      });

    };

    document.getElementById("is-bylaw-lookup-button").addEventListener("click", openBylawLookupModalFn);
    document.getElementById("ticket--bylawNumber").addEventListener("dblclick", openBylawLookupModalFn);
  }

  /*
   * Licence Plate Required
   */

  {
    const licencePlateIsMissingCheckboxEle =
      document.getElementById("ticket--licencePlateIsMissing") as HTMLInputElement;

    licencePlateIsMissingCheckboxEle.addEventListener("change", () => {

      if (licencePlateIsMissingCheckboxEle.checked) {

        document.getElementById("ticket--licencePlateCountry").removeAttribute("required");
        document.getElementById("ticket--licencePlateProvince").removeAttribute("required");
        document.getElementById("ticket--licencePlateNumber").removeAttribute("required");

      } else {

        document.getElementById("ticket--licencePlateCountry").setAttribute("required", "required");
        document.getElementById("ticket--licencePlateProvince").setAttribute("required", "required");
        document.getElementById("ticket--licencePlateNumber").setAttribute("required", "required");
      }
    });
  }

  /*
   * Licence Plate Province Datalist
   */

  const populateLicencePlateProvinceDatalistFn = () => {

    const datalistEle = document.getElementById("datalist--licencePlateProvince");
    cityssm.clearElement(datalistEle);

    const countryString = (document.getElementById("ticket--licencePlateCountry") as HTMLInputElement).value;

    const countryProperties = pts.getLicencePlateCountryProperties(countryString);

    if (countryProperties ?.provinces) {

      const provincesList = Object.values(countryProperties.provinces);

      for (const province of provincesList) {

        const optionEle = document.createElement("option");
        optionEle.setAttribute("value", province.provinceShortName);
        datalistEle.appendChild(optionEle);
      }
    }
  };

  document.getElementById("ticket--licencePlateCountry")
    .addEventListener("change", populateLicencePlateProvinceDatalistFn);

  pts.loadDefaultConfigProperties(populateLicencePlateProvinceDatalistFn);


  /*
   * Unlock Buttons
   */

  const unlockFieldFn = (unlockBtnClickEvent: Event) => {

    unlockBtnClickEvent.preventDefault();

    const unlockBtnEle = unlockBtnClickEvent.currentTarget as HTMLButtonElement;

    const inputTag = unlockBtnEle.getAttribute("data-unlock");

    const readOnlyEle = unlockBtnEle.closest(".field").getElementsByTagName(inputTag)[0] as HTMLInputElement;

    readOnlyEle.removeAttribute("readonly");
    readOnlyEle.classList.remove("is-readonly");

    readOnlyEle.focus();

    unlockBtnEle.setAttribute("disabled", "disabled");
  };

  const unlockBtnEles = document.getElementsByClassName("is-unlock-field-button");

  for (const unlockBtnEle of unlockBtnEles) {
    unlockBtnEle.addEventListener("click", unlockFieldFn);
  }

})();
