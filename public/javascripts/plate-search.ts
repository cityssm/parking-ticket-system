import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;

import type { ptsGlobal } from "./types";
declare const pts: ptsGlobal;


(function() {

  const formEle = <HTMLFormElement>document.getElementById("form--filters");

  const limitEle = <HTMLInputElement>document.getElementById("filter--limit");
  const offsetEle = <HTMLInputElement>document.getElementById("filter--offset");

  const searchResultsEle = document.getElementById("container--searchResults");


  function getLicencePlates() {

    const currentLimit = parseInt(limitEle.value, 10);
    const currentOffset = parseInt(offsetEle.value, 10);

    searchResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading licence plates..." +
      "</p>";

    cityssm.postJSON("/plates/doGetLicencePlates", formEle, function(licencePlateResults) {

      const plateList: any[] = licencePlateResults.licencePlates;

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

      plateList.forEach(function(plateObj) {

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
          (plateObj.licencePlateNumber === "" ?
            "(Blank)" :
            "<span class=\"licence-plate-number\">" + plateObj.licencePlateNumber + "</span>") +
          "</a>" +
          "</td>" +
          ("<td class=\"is-vcentered\">" +
            (plateObj.licencePlateProvince === "" ?
              "<span class=\"has-text-grey\">(Blank)</span>" :
              plateObj.licencePlateProvince) +
            "</td>") +
          ("<td class=\"is-vcentered\">" +
            (plateObj.licencePlateCountry === "" ?
              "<span class=\"has-text-grey\">(Blank)</span>" :
              plateObj.licencePlateCountry) +
            "</td>") +
          ("<td class=\"has-text-right is-vcentered\">" +
            (plateObj.hasOwnerRecord ?
              "<span data-tooltip=\"Has Ownership Record\"><i class=\"fas fa-check\" aria-hidden=\"true\"></i></span>" +
              "<span class=\"sr-only\">Has Ownership Record</span>" :
              "") +
            "</td>") +
          ("<td class=\"has-text-right is-vcentered\">" +
            plateObj.unresolvedTicketCount +
            "</td>");

        tbodyEle.appendChild(trEle);

      });

      searchResultsEle.insertAdjacentHTML("beforeend", "<div class=\"level is-block-print\">" +
        "<div class=\"level-left has-text-weight-bold\">" +
        "Displaying licence plates " +
        (currentOffset + 1) +
        " to " +
        Math.min(currentLimit + currentOffset, licencePlateResults.count) +
        " of " +
        licencePlateResults.count +
        "</div>" +
        "</div>");

      if (currentLimit < licencePlateResults.count) {

        const paginationEle = document.createElement("nav");
        paginationEle.className = "level-right is-hidden-print";
        paginationEle.setAttribute("role", "pagination");
        paginationEle.setAttribute("aria-label", "pagination");

        if (currentOffset > 0) {

          const previousEle = document.createElement("a");
          previousEle.className = "button";
          previousEle.innerHTML = "<span class=\"icon\"><i class=\"fas fa-chevron-left\" aria-hidden=\"true\"></i></span>" +
            "<span>Previous</span>";
          previousEle.addEventListener("click", function(clickEvent) {

            clickEvent.preventDefault();
            offsetEle.value = Math.max(0, currentOffset - currentLimit).toString();
            getLicencePlates();

          });

          paginationEle.appendChild(previousEle);

        }

        if (currentLimit + currentOffset < licencePlateResults.count) {

          const nextEle = document.createElement("a");
          nextEle.className = "button ml-3";
          nextEle.innerHTML = "<span>Next Licence Plates</span>" +
            "<span class=\"icon\"><i class=\"fas fa-chevron-right\" aria-hidden=\"true\"></i></span>";
          nextEle.addEventListener("click", function(clickEvent) {

            clickEvent.preventDefault();
            offsetEle.value = (currentOffset + currentLimit).toString();
            getLicencePlates();

          });

          paginationEle.appendChild(nextEle);

        }

        searchResultsEle.getElementsByClassName("level")[0].appendChild(paginationEle);

      }

    });


  }


  function resetOffsetAndGetLicencePlates() {

    offsetEle.value = "0";
    getLicencePlates();

  }


  formEle.addEventListener("submit", function(formEvent) {
    formEvent.preventDefault();
  });


  document.getElementById("filter--licencePlateNumber").addEventListener("change", resetOffsetAndGetLicencePlates);
  document.getElementById("filter--hasOwnerRecord").addEventListener("change", resetOffsetAndGetLicencePlates);
  document.getElementById("filter--hasUnresolvedTickets").addEventListener("change", resetOffsetAndGetLicencePlates);

  pts.loadDefaultConfigProperties(resetOffsetAndGetLicencePlates);

}());
