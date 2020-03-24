"use strict";

(function() {

  let batchID = -1;

  let fn_populateBatchView;
  let fn_refreshAvailablePlates;

  /*
   * Available Plates
   */

  const availableIssueDaysAgoEle = document.getElementById("available--issueDaysAgo");
  const availablePlatesContainerEle = document.getElementById("is-available-plates-container");

  const licencePlateNumberFilterEle = document.getElementById("available--licencePlateNumber");

  let availablePlatesList = [];
  let batchEntriesList = [];

  function clickFn_addLicencePlateToBatch(clickEvent) {

    clickEvent.preventDefault();

    const recordIndex = parseInt(clickEvent.currentTarget.getAttribute("data-index"));

    const plateRecord = availablePlatesList[recordIndex];

    const plateContainerEle = clickEvent.currentTarget.closest(".is-plate-container");

    pts.postJSON(
      "/plates/doAddLicencePlateToLookupBatch", {
        batchID: batchID,
        licencePlateCountry: "CA",
        licencePlateProvince: "ON",
        licencePlateNumber: plateRecord.licencePlateNumber,
        ticketID: plateRecord.ticketIDMin
      },
      function(responseJSON) {

        if (responseJSON.success) {

          // Remove element from available list
          plateContainerEle.remove();

          // Set tombstone in available plates list
          availablePlatesList[recordIndex] = null;

          fn_populateBatchView(responseJSON.batch);

        }

      }
    );

  }

  function clickFn_removeLicencePlateFromBatch(clickEvent) {

    clickEvent.preventDefault();

    const recordIndex = parseInt(clickEvent.currentTarget.getAttribute("data-index"));

    const batchEntry = batchEntriesList[recordIndex];

    const entryContainerEle = clickEvent.currentTarget.closest(".is-entry-container");

    pts.postJSON(
      "/plates/doRemoveLicencePlateFromLookupBatch", {
        batchID: batchID,
        licencePlateCountry: "CA",
        licencePlateProvince: "ON",
        licencePlateNumber: batchEntry.licencePlateNumber
      },
      function(responseJSON) {

        if (responseJSON.success) {

          // Remove element from list
          entryContainerEle.remove();

          fn_refreshAvailablePlates();

        }

      }
    );

  }

  function clickFn_clearBatch(clickEvent) {

    clickEvent.preventDefault();

    const clearFn = function() {

      pts.postJSON("/plates/doClearLookupBatch", {
        batchID: batchID
      }, function(responseJSON) {

        if (responseJSON.success) {

          fn_populateBatchView(responseJSON.batch);
          fn_refreshAvailablePlates();

        }

      });

    };

    pts.confirmModal(
      "Clear Batch?",
      "Are you sure you want to remove all licence plates from the batch?",
      "Yes, Clear the Batch",
      "warning",
      clearFn
    );

  }

  function reduceFn_ticketNumbers(soFar, ticketNumber) {

    return soFar + "<a class=\"tag has-tooltip-bottom\" data-tooltip=\"View Ticket (Opens in New Window)\"" +
      " href=\"/tickets/byTicketNumber/" + encodeURIComponent(ticketNumber) + "\" target=\"_blank\">" +
      pts.escapeHTML(ticketNumber) +
      "</a> ";

  }

  function fn_populateAvailablePlatesView() {

    pts.clearElement(availablePlatesContainerEle);

    const resultsPanelEle = document.createElement("div");
    resultsPanelEle.className = "panel";

    const filterStringSplit = licencePlateNumberFilterEle.value.toLowerCase().trim()
      .split(" ");


    let includedLicencePlates = [];

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

      includedLicencePlates.push([
        plateRecord.licencePlateNumber,
        plateRecord.ticketIDMin
      ]);

      const resultEle = document.createElement("div");
      resultEle.className = "panel-block is-block is-plate-container";

      resultEle.innerHTML = "<div class=\"level is-marginless\">" +
        ("<div class=\"level-left\">" +
          "<div class=\"licence-plate\">" +
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

      resultEle.getElementsByTagName("button")[0].addEventListener("click", clickFn_addLicencePlateToBatch);

      resultsPanelEle.appendChild(resultEle);

    }

    if (includedLicencePlates.length > 0) {

      const addAllButtonEle = document.createElement("button");
      addAllButtonEle.className = "button is-fullwidth has-margin-bottom-10";

      addAllButtonEle.innerHTML =
        "<span class=\"icon is-small\"><i class=\"fas fa-plus\" aria-hidden=\"true\"></i></span>" +
        "<span>Add " + includedLicencePlates.length + " Licence Plate" + (includedLicencePlates.length === 1 ? "" : "s") + "</span>";

      addAllButtonEle.addEventListener("click", function() {

        pts.openHtmlModal("loading", {
          onshown: function(modalEle, closeModalFn) {

            document.getElementById("is-loading-modal-message").innerText =
              "Adding " + includedLicencePlates.length + " Licence Plate" + (includedLicencePlates.length === 1 ? "" : "s") + "...";

            pts.postJSON("/plates/doAddAllLicencePlatesToLookupBatch", {
              batchID: batchID,
              licencePlateCountry: "CA",
              licencePlateProvince: "ON",
              licencePlateNumbers: includedLicencePlates
            }, function(resultJSON) {

              closeModalFn();

              if (resultJSON.success) {

                fn_populateBatchView(resultJSON.batch);
                fn_refreshAvailablePlates();

              }

            });

          }
        });


      });

      availablePlatesContainerEle.appendChild(addAllButtonEle);

      availablePlatesContainerEle.appendChild(resultsPanelEle);

    } else {

      availablePlatesContainerEle.innerHTML = "<div class=\"message is-info\">" +
        "<div class=\"message-body\">There are no licence plates that meet your search criteria.</div>" +
        "</div>";

    }

  }

  fn_refreshAvailablePlates = function() {

    availablePlatesContainerEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading licence plates..." +
      "</p>";

    pts.postJSON(
      "/plates/mto_doGetPlatesAvailableForLookup", {
        batchID: batchID,
        issueDaysAgo: availableIssueDaysAgoEle.value
      },
      function(resultPlatesList) {

        availablePlatesList = resultPlatesList;
        fn_populateAvailablePlatesView();

      }
    );

  };

  document.getElementById("is-more-available-filters-toggle").addEventListener("click", function(clickEvent) {

    clickEvent.preventDefault();

    const filterBlockEle = document.getElementById("is-more-available-filters");
    filterBlockEle.classList.toggle("is-block");
    filterBlockEle.classList.toggle("is-hidden");

  });

  licencePlateNumberFilterEle.addEventListener("keyup", fn_populateAvailablePlatesView);

  availableIssueDaysAgoEle.addEventListener("change", fn_refreshAvailablePlates);

  /*
   * Current Batch
   */

  const batchEntriesContainerEle = document.getElementById("is-batch-entries-container");

  fn_populateBatchView = function(batch) {

    batchID = batch.batchID;
    batchEntriesList = batch.batchEntries;

    document.getElementById("batchSelector--batchID").innerText = "Batch #" + batch.batchID;

    document.getElementById("batchSelector--batchDetails").innerHTML = "Created " + batch.batchDateString;

    pts.clearElement(batchEntriesContainerEle);

    if (batchEntriesList.length === 0) {

      batchEntriesContainerEle.innerHTML = "<div class=\"message is-info\">" +
        "<p class=\"message-body\">There are no licence plates included in the batch.</p>" +
        "</div>";

      return;

    }

    pts.clearElement(batchEntriesContainerEle);

    const panelEle = document.createElement("div");
    panelEle.className = "panel";

    for (let index = 0; index < batchEntriesList.length; index += 1) {

      const batchEntry = batchEntriesList[index];

      const panelBlockEle = document.createElement("div");
      panelBlockEle.className = "panel-block is-block is-entry-container";

      panelBlockEle.innerHTML = "<div class=\"level\">" +
        ("<div class=\"level-left\">" +
          "<div class=\"licence-plate\">" +
          "<div class=\"licence-plate-number\">" + pts.escapeHTML(batchEntry.licencePlateNumber) + "</div>" +
          "</div>" +
          "</div>") +
        ("<div class=\"level-right\">" +
          "<button class=\"button is-small\" data-index=\"" + index + "\" type=\"button\">" +
          "<span class=\"icon is-small\"><i class=\"fas fa-minus\" aria-hidden=\"true\"></i></span>" +
          "<span>Remove</span>" +
          "</button>" +
          "</div>") +
        "</div>";

      panelBlockEle.getElementsByTagName("button")[0].addEventListener("click", clickFn_removeLicencePlateFromBatch);

      panelEle.appendChild(panelBlockEle);

    }

    const clearAllButtonEle = document.createElement("button");
    clearAllButtonEle.className = "button is-fullwidth has-margin-bottom-10";
    clearAllButtonEle.innerHTML = "<span class=\"icon is-small\"><i class=\"fas fa-broom\" aria-hidden=\"true\"></i></span>" +
      "<span>Clear " + batchEntriesList.length + " Entr" + (batchEntriesList.length === 1 ? "y" : "ies") + " from Batch</span>";

    clearAllButtonEle.addEventListener("click", clickFn_clearBatch);

    batchEntriesContainerEle.appendChild(clearAllButtonEle);

    batchEntriesContainerEle.appendChild(panelEle);

  };

  function fn_refreshBatch() {

    pts.postJSON(
      "/plates/doGetLookupBatch", {
        batchID: batchID
      },
      fn_populateBatchView
    );

    fn_refreshAvailablePlates();

  }

  function clickFn_openSelectBatchModal(clickEvent) {

    clickEvent.preventDefault();

    let selectBatchCloseModalFn;
    let resultsContainerEle;

    const clickFn_selectBatch = function(batchClickEvent) {

      batchClickEvent.preventDefault();

      batchID = parseInt(batchClickEvent.currentTarget.getAttribute("data-batch-id"));

      selectBatchCloseModalFn();
      fn_refreshBatch();

    };

    const fn_loadBatches = function() {

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

          linkEle.addEventListener("click", clickFn_selectBatch);

          listEle.appendChild(linkEle);

        }

        pts.clearElement(resultsContainerEle);
        resultsContainerEle.appendChild(listEle);

      });

    };

    pts.openHtmlModal("mto-selectBatch", {
      onshow: function(modalEle) {

        resultsContainerEle = modalEle.getElementsByClassName("is-results-container")[0];
        fn_loadBatches();

      },
      onshown: function(modalEle, closeModalFn) {

        selectBatchCloseModalFn = closeModalFn;

      }
    });

  }

  document.getElementById("is-select-batch-button").addEventListener("click", clickFn_openSelectBatchModal);

  document.getElementById("is-create-batch-button").addEventListener("click", function() {

    const createFn = function() {

      pts.postJSON("/plates/doCreateLookupBatch", {}, function(responseJSON) {

        if (responseJSON.success) {

          fn_populateBatchView(responseJSON.batch);

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

    fn_populateBatchView(pts.plateExportBatch);
    delete pts.plateExportBatch;

    fn_refreshAvailablePlates();

  }

}());
