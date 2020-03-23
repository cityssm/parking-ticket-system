"use strict";

(function() {

  let batchID = -1;

  /*
   * Available Plates
   */

  const availableIssueDaysAgoEle = document.getElementById("available--issueDaysAgo");
  const availablePlatesContainerEle = document.getElementById("is-available-plates-container");

  const licencePlateNumberFilterEle = document.getElementById("available--licencePlateNumber");

  let availablePlatesList = [];

  function addLicencePlateToBatch(clickEvent) {

    clickEvent.preventDefault();

    const recordIndex = parseInt(clickEvent.currentTarget.getAttribute("data-index"));

    const plateRecord = availablePlatesList[recordIndex];

    // Set tombstone
    availablePlatesList[recordIndex] = null;

    pts.postJSON(
      "/plates/addLicencePlateToLookupBatch", {
        batchID: batchID,
        licencePlateCountry: "CA",
        licencePlateProvince: "ON",
        licencePlateNumber: plateRecord.licencePlateNumber
      },
      populateBatchView
    );

  };

  function reduceFn_ticketNumbers(soFar, ticketNumber) {

    return soFar + "<a class=\"tag has-tooltip-bottom\" data-tooltip=\"View Ticket (Opens in New Window)\"" +
      " href=\"/tickets/byTicketNumber/" + encodeURIComponent(ticketNumber) + "\" target=\"_blank\">" +
      pts.escapeHTML(ticketNumber) +
      "</a> ";

  }

  function populateAvailablePlatesView() {

    pts.clearElement(availablePlatesContainerEle);

    const resultsPanelEle = document.createElement("div");
    resultsPanelEle.className = "panel";

    const filterStringSplit = licencePlateNumberFilterEle.value.toLowerCase().trim()
      .split(" ");

    for (let recordIndex = 0; recordIndex < availablePlatesList.length; recordIndex += 1) {

      const plateRecord = availablePlatesList[recordIndex];

      // Tombstone record
      if (!plateRecord) {

        continue;

      }

      let displayRecord = true;
      const licencePlateNumberLowerCase = plateRecord.licencePlateNumber.toLowerCase();

      for (let searchIndex = 0; searchIndex < filterStringSplit.length; searchIndex += 1) {

        if (licencePlateNumberLowerCase.indexOf(filterStringSplit[searchIndex]) === -1) {

          displayRecord = false;
          break;

        }

      }

      if (!displayRecord) {

        continue;

      }

      const resultEle = document.createElement("div");
      resultEle.className = "panel-block is-block";

      resultEle.innerHTML = "<div class=\"level is-marginless\">" +
        ("<div class=\"level-left\">" +
          "<div class\"licence-plate\">" +
          "<div class=\"licence-plate-number\">" + pts.escapeHTML(plateRecord.licencePlateNumber) + "</div>" +
          "</div>" +
          "</div>") +
        ("<div class=\"level-right\">" +
          "<button class=\"button is-small\" data-index=\"" + recordIndex + "\" data-tooltip=\"Add to Batch\" type=\"button\">" +
          "<span class=\"icon is-small\"><i class=\"fas fa-plus\" aria-hidden=\"true\"></i></span>" +
          "<span>Add</span>" +
          "</button>" +
          "</div>") +
        "</div>" +

        "<div class=\"level\">" +
        "<div class=\"level-left\"><div class=\"tags\">" +
        plateRecord.ticketNumbers.reduce(reduceFn_ticketNumbers, "") +
        "</div></div>" +
        "<div class=\"level-right is-size-7\">" +
        plateRecord.issueDateMinString +
        (plateRecord.issueDateMin === plateRecord.issueDateMax ?
          "" :
          " to " + plateRecord.issueDateMaxString) +
        "</div>" +
        "</div>";

      resultEle.getElementsByTagName("button")[0].addEventListener("click", addLicencePlateToBatch);

      resultsPanelEle.appendChild(resultEle);

    }

    availablePlatesContainerEle.appendChild(resultsPanelEle);

  }

  function refreshAvailablePlates() {

    availablePlatesContainerEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading licence plates..." +
      "</p>";

    pts.postJSON(
      "/plates/mto_doGetPlatesAvailableForLookup", {
        issueDaysAgo: availableIssueDaysAgoEle.value
      },
      function(resultPlatesList) {

        availablePlatesList = resultPlatesList;
        populateAvailablePlatesView();

      }
    );

  }

  document.getElementById("is-more-available-filters-toggle").addEventListener("click", function(clickEvent) {

    clickEvent.preventDefault();

    const filterBlockEle = document.getElementById("is-more-available-filters");
    filterBlockEle.classList.toggle("is-block");
    filterBlockEle.classList.toggle("is-hidden");

  });

  licencePlateNumberFilterEle.addEventListener("keyup", populateAvailablePlatesView);

  availableIssueDaysAgoEle.addEventListener("change", refreshAvailablePlates);
  refreshAvailablePlates();

  /*
   * Current Batch
   */

  const batchEntriesContainerEle = document.getElementById("is-batch-entries-container");

  function populateBatchView(batch) {

    batchID = batch.batchID;

    document.getElementById("batchSelector--batchID").innerText = "Batch #" + batch.batchID;

    document.getElementById("batchSelector--batchDetails").innerHTML = "Created " + batch.batchDateString;

    pts.clearElement(batchEntriesContainerEle);

    if (batch.batchEntries.length === 0) {

      batchEntriesContainerEle.innerHTML = "<div class=\"message is-info\">" +
        "<p class=\"message-body\">There are no licence plates included in the batch.</p>" +
        "</div>";

      return;

    }


  }

  function refreshBatch() {

    pts.postJSON(
      "/plates/doGetLookupBatch", {
        batchID: batchID
      },
      populateBatchView
    );

  }

  function openSelectBatchModal(clickEvent) {

    clickEvent.preventDefault();

    let selectBatchCloseModalFn;
    let resultsContainerEle;

    const selectBatchFn = function(batchClickEvent) {

      batchClickEvent.preventDefault();

      batchID = parseInt(batchClickEvent.currentTarget.getAttribute("data-batch-id"));

      selectBatchCloseModalFn();
      refreshBatch();

    };

    const loadBatchesFn = function() {

      pts.postJSON("/plates/doGetUnsentLicencePlateLookupBatches", {}, function(batchList) {

        if (batchList.length === 0) {

          resultsContainerEle.innerHTML = "<div class=\"message is-info\">" +
            "<p class=\"message-body\">There are no unsent batches available.</p>" +
            "</div>";
          return;

        }

        const listEle = document.createElement("div");
        listEle.className = "list is-hoverable";

        for (let index = 0; index < batchList.length; index += 1) {

          const batch = batchList[index];

          const linkEle = document.createElement("a");
          linkEle.className = "list-item";
          linkEle.setAttribute("href", "#");
          linkEle.setAttribute("data-batch-id", batch.batchID);

          linkEle.innerHTML = "<div class=\"columns\">" +
            "<div class=\"column is-narrow\">#" + batch.batchID + "</div>" +
            "<div class=\"column has-text-right\">" +
            batch.batchDateString +
            (batch.lockDate ? "<br /><span class=\"tag\">Locked</span>" : "") +
            "</div>" +
            "</div>";

          linkEle.addEventListener("click", selectBatchFn);

          listEle.appendChild(linkEle);

        }

        pts.clearElement(resultsContainerEle);
        resultsContainerEle.appendChild(listEle);

      });

    };

    pts.openHtmlModal("mto-selectBatch", {
      onshow: function(modalEle) {

        resultsContainerEle = modalEle.getElementsByClassName("is-results-container")[0];
        loadBatchesFn();

      },
      onshown: function(modalEle, closeModalFn) {

        selectBatchCloseModalFn = closeModalFn;

      }
    });

  }

  document.getElementById("is-select-batch-button").addEventListener("click", openSelectBatchModal);

  document.getElementById("is-create-batch-button").addEventListener("click", function() {

    const createFn = function() {

      pts.postJSON("/plates/doCreateLookupBatch", {}, function(responseJSON) {

        if (responseJSON.success) {

          populateBatchView(responseJSON.batch);

        }

      });

    };

    pts.confirmModal(
      "Create a New Batch?",
      "Are you sure you want to create a new licence plate lookup batch?",
      "Yes, Create a Batch",
      "info",
      createFn
    );

  });

  if (pts.plateExportBatch) {

    populateBatchView(pts.plateExportBatch);
    delete pts.plateExportBatch;

  }

}());
