import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { ptsGlobal } from "../types/publicTypes";
import type * as recordTypes from "../types/recordTypes";

declare const cityssm: cityssmGlobal;
declare const pts: ptsGlobal;


(() => {

  const formEle = document.getElementById("form--filters") as HTMLFormElement;

  const offsetEle = document.getElementById("filter--offset") as HTMLInputElement;

  const searchResultsEle = document.getElementById("container--searchResults");


  const buildPlateTrEleFn = (plateObj: recordTypes.LicencePlate) => {

    const trEle = document.createElement("tr");

    // Output row

    const url = "/plates/" +
      (plateObj.licencePlateCountry === "" ? "_" : encodeURIComponent(plateObj.licencePlateCountry)) +
      "/" +
      (plateObj.licencePlateProvince === "" ? "_" : encodeURIComponent(plateObj.licencePlateProvince)) +
      "/" +
      (plateObj.licencePlateNumber === "" ? "_" : encodeURIComponent(plateObj.licencePlateNumber));


    trEle.innerHTML = "<td>" +
      "<a href=\"" + url + "\" data-tooltip=\"View Licence Plate\">" +
      (plateObj.licencePlateNumber === ""
        ? "(Blank)"
        : "<span class=\"licence-plate-number\">" + plateObj.licencePlateNumber + "</span>") +
      "</a>" +
      "</td>" +
      ("<td class=\"is-vcentered\">" +
        (plateObj.licencePlateProvince === ""
          ? "<span class=\"has-text-grey\">(Blank)</span>"
          : plateObj.licencePlateProvince) +
        "</td>") +
      ("<td class=\"is-vcentered\">" +
        (plateObj.licencePlateCountry === ""
          ? "<span class=\"has-text-grey\">(Blank)</span>"
          : plateObj.licencePlateCountry) +
        "</td>") +
      ("<td class=\"has-text-right is-vcentered\">" +
        (plateObj.hasOwnerRecord
          ? "<span data-tooltip=\"Has Ownership Record\">" +
          "<i class=\"fas fa-check\" aria-hidden=\"true\"></i>" +
          "</span>" +
          "<span class=\"sr-only\">Has Ownership Record</span>"
          : "") +
        "</td>") +
      ("<td class=\"has-text-right is-vcentered\">" +
        plateObj.unresolvedTicketCount.toString() +
        "</td>");

    return trEle;
  };


  const processPlateResultsFn = (licencePlateResults: {
    count: number;
    limit: number;
    offset: number;
    licencePlates: recordTypes.LicencePlate[];
  }) => {

    const plateList = licencePlateResults.licencePlates;

    if (plateList.length === 0) {

      searchResultsEle.innerHTML = "<div class=\"message is-info\">" +
        "<div class=\"message-body\">" +
        "<strong>Your search returned no results.</strong><br />" +
        "Please try expanding your search criteria." +
        "</div>" +
        "</div>";

      return;
    }

    searchResultsEle.innerHTML = "<table class=\"table is-fullwidth is-striped is-hoverable\">" +
      "<thead><tr>" +
      "<th>Licence Plate Number</th>" +
      "<th>Province</th>" +
      "<th>Country</th>" +
      "<th class=\"has-text-right\">Ownership Record</th>" +
      "<th class=\"has-text-right\">Unresolved Tickets</th>" +
      "</tr></thead>" +
      "<tbody></tbody>" +
      "</table>";

    const tbodyEle = searchResultsEle.getElementsByTagName("tbody")[0];

    for (const plateObj of plateList) {

      const trEle = buildPlateTrEleFn(plateObj);
      tbodyEle.appendChild(trEle);
    }

    searchResultsEle.insertAdjacentHTML("beforeend", "<div class=\"level is-block-print\">" +
      "<div class=\"level-left has-text-weight-bold\">" +
      "Displaying licence plates " +
      (licencePlateResults.offset + 1).toString() +
      " to " +
      Math.min(licencePlateResults.limit + licencePlateResults.offset, licencePlateResults.count).toString() +
      " of " +
      licencePlateResults.count.toString() +
      "</div>" +
      "</div>");

    if (licencePlateResults.limit < licencePlateResults.count) {

      const paginationEle = document.createElement("nav");
      paginationEle.className = "level-right is-hidden-print";
      paginationEle.setAttribute("role", "pagination");
      paginationEle.setAttribute("aria-label", "pagination");

      if (licencePlateResults.offset > 0) {

        const previousEle = document.createElement("a");
        previousEle.className = "button";
        previousEle.innerHTML =
          "<span class=\"icon\"><i class=\"fas fa-chevron-left\" aria-hidden=\"true\"></i></span>" +
          "<span>Previous</span>";
        previousEle.addEventListener("click", (clickEvent) => {

          clickEvent.preventDefault();
          offsetEle.value = Math.max(0, licencePlateResults.offset - licencePlateResults.limit).toString();
          getLicencePlatesFn();

        });

        paginationEle.appendChild(previousEle);
      }

      if (licencePlateResults.limit + licencePlateResults.offset < licencePlateResults.count) {

        const nextEle = document.createElement("a");
        nextEle.className = "button ml-3";
        nextEle.innerHTML = "<span>Next Licence Plates</span>" +
          "<span class=\"icon\"><i class=\"fas fa-chevron-right\" aria-hidden=\"true\"></i></span>";

        nextEle.addEventListener("click", (clickEvent) => {

          clickEvent.preventDefault();
          offsetEle.value = (licencePlateResults.offset + licencePlateResults.limit).toString();
          getLicencePlatesFn();
        });

        paginationEle.appendChild(nextEle);
      }

      searchResultsEle.getElementsByClassName("level")[0].appendChild(paginationEle);
    }
  };


  const getLicencePlatesFn = () => {

    searchResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading licence plates..." +
      "</p>";

    cityssm.postJSON("/plates/doGetLicencePlates", formEle, processPlateResultsFn);
  };


  const resetOffsetAndGetLicencePlatesFn = () => {

    offsetEle.value = "0";
    getLicencePlatesFn();
  };


  formEle.addEventListener("submit", (formEvent) => {
    formEvent.preventDefault();
  });


  document.getElementById("filter--licencePlateNumber").addEventListener("change", resetOffsetAndGetLicencePlatesFn);
  document.getElementById("filter--hasOwnerRecord").addEventListener("change", resetOffsetAndGetLicencePlatesFn);
  document.getElementById("filter--hasUnresolvedTickets").addEventListener("change", resetOffsetAndGetLicencePlatesFn);

  pts.loadDefaultConfigProperties(resetOffsetAndGetLicencePlatesFn);

})();
