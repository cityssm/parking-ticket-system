"use strict";

(function() {

  const formEle = document.getElementById("form--filters");

  const limitEle = document.getElementById("filter--limit");
  const offsetEle = document.getElementById("filter--offset");

  const searchResultsEle = document.getElementById("container--searchResults");


  function getLicencePlates() {

    const currentLimit = parseInt(limitEle.value);
    const currentOffset = parseInt(offsetEle.value);

    searchResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading licence plates..." +
      "</p>";

    pts.postJSON("/plates/doGetLicencePlates", formEle, function(licencePlateResults) {

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
        "<th>Ownership Record</th>" +
        "<th>Oustanding Tickets</th>" +
        "</tr></thead>" +
        "<tbody></tbody>" +
        "</table>";

      const tbodyEle = searchResultsEle.getElementsByTagName("tbody")[0];

      for (let plateIndex = 0; plateIndex < plateList.length; plateIndex += 1) {

        const plateObj = plateList[plateIndex];

        const trEle = document.createElement("tr");

        // Output row

        trEle.innerHTML = "<td>" +
          "<a href=\"/plates/" + plateObj.licencePlateCountry + "/" + plateObj.licencePlateProvince + "/" + plateObj.licencePlateNumber + "\" data-tooltip=\"View Licence Plate\">" +
          plateObj.licencePlateNumber +
          "</a>" +
          "</td>" +
          "<td>" + plateObj.licencePlateProvince + "</td>" +
          "<td>" + plateObj.licencePlateCountry + "</td>" +
          ("<td>" +
            plateObj.hasOwnerRecord +
            "</td>") +
          ("<td>" +
            plateObj.unresolvedTicketCount +
            "</td>");

        tbodyEle.appendChild(trEle);

      }

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
          previousEle.innerText = "Previous";
          previousEle.addEventListener("click", function(clickEvent) {

            clickEvent.preventDefault();
            offsetEle.value = Math.max(0, currentOffset - currentLimit);
            getLicencePlates();

          });

          paginationEle.appendChild(previousEle);

        }

        if (currentLimit + currentOffset < licencePlateResults.count) {

          const nextEle = document.createElement("a");
          nextEle.className = "button has-margin-left-10";
          nextEle.innerHTML = "<span>Next Licence Plates</span><span class=\"icon\"><i class=\"fas fa-chevron-right\" aria-hidden=\"true\"></i></span>";
          nextEle.addEventListener("click", function(clickEvent) {

            clickEvent.preventDefault();
            offsetEle.value = (currentOffset + currentLimit);
            getLicencePlates();

          });

          paginationEle.appendChild(nextEle);

        }

        searchResultsEle.getElementsByClassName("level")[0].appendChild(paginationEle);

      }

    });


  }


  function resetOffsetAndGetLicencePlates() {

    offsetEle.value = 0;
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
