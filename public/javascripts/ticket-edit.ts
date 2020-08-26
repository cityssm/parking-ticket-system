import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { ptsGlobal } from "../../types/publicTypes";
import type * as recordTypes from "../../types/recordTypes";

declare const cityssm: cityssmGlobal;
declare const pts: ptsGlobal;


(() => {

  const ticketID = (document.getElementById("ticket--ticketID") as HTMLInputElement).value;
  const isCreate = (ticketID === "");

  /*
   * Form Management
   */

  const formMessageEle = document.getElementById("container--form-message");

  // let hasUnsavedChanges = false;

  const setUnsavedChangesFn = () => {

    cityssm.enableNavBlocker();

    // hasUnsavedChanges = true;

    formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
      "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
      " <span>Unsaved Changes</span>" +
      "</div>";

  };

  const inputEles = document.querySelectorAll(".input, .select, .textarea");

  for (const inputEle of inputEles) {
    inputEle.addEventListener("change", setUnsavedChangesFn);
  }

  document.getElementById("form--ticket").addEventListener("submit", (formEvent) => {

    formEvent.preventDefault();

    const ticketNumber = (document.getElementById("ticket--ticketNumber") as HTMLInputElement).value;

    formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
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

          formMessageEle.innerHTML = "<span class=\"tag is-light is-success is-medium\">" +
            "<span class=\"icon\"><i class=\"fas fa-check\" aria-hidden=\"true\"></i></span>" +
            " <span>Saved Successfully</span>" +
            "</div>";

        } else {

          setUnsavedChangesFn();
          cityssm.alertModal("Ticket Not Saved", responseJSON.message, "OK", "danger");

        }

        if (responseJSON.success && isCreate) {

          cityssm.openHtmlModal("ticket-createSuccess", {
            onshow(): void {

              document.getElementById("createSuccess--ticketNumber").innerText = ticketNumber;

              document.getElementById("createSuccess--editTicketButton").setAttribute(
                "href",
                "/tickets/" + responseJSON.ticketID.toString() + "/edit"
              );

              document.getElementById("createSuccess--newTicketButton").setAttribute(
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

    document.getElementById("is-delete-ticket-button").addEventListener("click", (clickEvent) => {

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

    let locationLookupCloseModalFn: () => void;

    let locationList = [];

    const clearLocationFn = (clickEvent: Event) => {

      clickEvent.preventDefault();

      (document.getElementById("ticket--locationKey") as HTMLInputElement).value = "";
      (document.getElementById("ticket--locationName") as HTMLInputElement).value = "";

      locationLookupCloseModalFn();

      locationList = [];

    };

    const setLocationFn = (clickEvent: Event) => {

      clickEvent.preventDefault();

      const locationObj =
        locationList[parseInt((clickEvent.currentTarget as HTMLAnchorElement).getAttribute("data-index"), 10)];

      (document.getElementById("ticket--locationKey") as HTMLInputElement).value = locationObj.locationKey;
      (document.getElementById("ticket--locationName") as HTMLInputElement).value = locationObj.locationName;

      locationLookupCloseModalFn();

      locationList = [];

    };

    const populateLocationsFn = () => {

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
          linkEle.addEventListener("click", setLocationFn);
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

    const openLocationLookupModalFn = (clickEvent: Event) => {

      clickEvent.preventDefault();

      cityssm.openHtmlModal("ticket-setLocation", {
        onshown(_modalEle: HTMLElement, closeModalFn: () => void): void {

          locationLookupCloseModalFn = closeModalFn;
          populateLocationsFn();

          document.getElementById("is-clear-location-button").addEventListener("click", clearLocationFn);

        },
        onremoved(): void {
          document.getElementById("is-location-lookup-button").focus();
        }
      });

    };

    document.getElementById("is-location-lookup-button").addEventListener("click", openLocationLookupModalFn);
    document.getElementById("ticket--locationName").addEventListener("dblclick", openLocationLookupModalFn);
  });

  /*
   * By-law / Offence Lookup
   */

  {

    let bylawLookupCloseModalFn: () => void;
    let offenceList: recordTypes.ParkingOffence[] = [];
    const listItemEles: HTMLAnchorElement[] = [];

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

      bylawLookupCloseModalFn();

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

      bylawLookupCloseModalFn();

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

          bylawLookupCloseModalFn = closeModalFn;
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
