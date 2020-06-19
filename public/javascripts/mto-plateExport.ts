import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;

import type { LicencePlateLookupBatch } from "../../helpers/ptsTypes";


(function() {

  const canUpdate =
    document.getElementsByTagName("main")[0].getAttribute("data-can-update") === "true";

  let batchID = -1;
  let batchIsLocked = true;
  let batchIsSent = false;


  // Available Plates


  const availableIssueDaysAgoEle = <HTMLSelectElement>document.getElementById("available--issueDaysAgo");
  const availablePlatesContainerEle = document.getElementById("is-available-plates-container");

  const licencePlateNumberFilterEle = <HTMLInputElement>document.getElementById("available--licencePlateNumber");

  let availablePlatesList: {
    licencePlateNumber: string,
    ticketIDMin: number,
    ticketCount: number,
    issueDateMin: number,
    issueDateMinString: string,
    issueDateMax: number,
    issueDateMaxString: string,
    ticketNumbersConcat: string,
    ticketNumbers: string[]
  }[] = [];

  let batchEntriesList = [];

  function clickFn_addLicencePlateToBatch(clickEvent: Event) {

    clickEvent.preventDefault();

    const buttonEle = <HTMLButtonElement>clickEvent.currentTarget;
    buttonEle.setAttribute("disabled", "disabled");

    const recordIndex = parseInt(buttonEle.getAttribute("data-index"), 10);

    const plateRecord = availablePlatesList[recordIndex];

    const plateContainerEle = buttonEle.closest(".is-plate-container");

    cityssm.postJSON(
      "/plates/doAddLicencePlateToLookupBatch", {
        batchID,
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

        } else {

          buttonEle.removeAttribute("disabled");

        }

      }
    );

  }

  function clickFn_removeLicencePlateFromBatch(clickEvent: Event) {

    clickEvent.preventDefault();

    const buttonEle = <HTMLButtonElement>clickEvent.currentTarget;
    buttonEle.setAttribute("disabled", "disabled");

    const recordIndex = parseInt(buttonEle.getAttribute("data-index"), 10);

    const batchEntry = batchEntriesList[recordIndex];

    const entryContainerEle = buttonEle.closest(".is-entry-container");

    cityssm.postJSON(
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

        } else {

          buttonEle.removeAttribute("disabled");

        }

      }
    );

  }

  function clickFn_clearBatch(clickEvent: Event) {

    clickEvent.preventDefault();

    const clearFn = function() {

      cityssm.postJSON("/plates/doClearLookupBatch", {
        batchID: batchID
      }, function(responseJSON) {

        if (responseJSON.success) {

          fn_populateBatchView(responseJSON.batch);
          fn_refreshAvailablePlates();

        }

      });

    };

    cityssm.confirmModal(
      "Clear Batch?",
      "Are you sure you want to remove all licence plates from the batch?",
      "Yes, Clear the Batch",
      "warning",
      clearFn
    );

  }

  function clickFn_downloadBatch(clickEvent: Event) {

    clickEvent.preventDefault();

    const downloadFn = function() {

      window.open("/plates-ontario/mtoExport/" + batchID);
      batchIsSent = true;

    };

    if (batchIsSent) {

      downloadFn();
      return;

    }

    cityssm.confirmModal(
      "Download Batch?",
      "<strong>You are about to download this batch for the first time.</strong><br />" +
      "The date of this download will be tracked as part of the batch record.",
      "OK, Download the File",
      "warning",
      downloadFn
    );

  }

  function reduceFn_ticketNumbers(soFar: string, ticketNumber: string) {

    return soFar + "<a class=\"tag has-tooltip-bottom\" data-tooltip=\"View Ticket (Opens in New Window)\"" +
      " href=\"/tickets/byTicketNumber/" + encodeURIComponent(ticketNumber) + "\" target=\"_blank\">" +
      cityssm.escapeHTML(ticketNumber) +
      "</a> ";

  }

  function fn_populateAvailablePlatesView() {

    cityssm.clearElement(availablePlatesContainerEle);

    const resultsPanelEle = document.createElement("div");
    resultsPanelEle.className = "panel";

    const filterStringSplit = licencePlateNumberFilterEle.value.toLowerCase().trim()
      .split(" ");


    let includedLicencePlates = [];

    availablePlatesList.forEach(function(plateRecord, recordIndex) {

      // Tombstone record
      if (!plateRecord) {
        return;
      }

      let displayRecord = true;
      const licencePlateNumberLowerCase = plateRecord.licencePlateNumber.toLowerCase();

      for (const searchStringPiece of filterStringSplit) {
        if (licencePlateNumberLowerCase.indexOf(searchStringPiece) === -1) {
          displayRecord = false;
          break;
        }
      }

      if (!displayRecord) {
        return;
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
          "<div class=\"licence-plate-number\">" + cityssm.escapeHTML(plateRecord.licencePlateNumber) + "</div>" +
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

    });

    if (includedLicencePlates.length > 0) {

      const addAllButtonEle = document.createElement("button");
      addAllButtonEle.className = "button is-fullwidth mb-3";

      addAllButtonEle.innerHTML =
        "<span class=\"icon is-small\"><i class=\"fas fa-plus\" aria-hidden=\"true\"></i></span>" +
        "<span>Add " + includedLicencePlates.length + " Licence Plate" + (includedLicencePlates.length === 1 ? "" : "s") + "</span>";

      addAllButtonEle.addEventListener("click", function() {

        cityssm.openHtmlModal("loading", {
          onshown: function(_modalEle, closeModalFn) {

            document.getElementById("is-loading-modal-message").innerText =
              "Adding " + includedLicencePlates.length + " Licence Plate" + (includedLicencePlates.length === 1 ? "" : "s") + "...";

            cityssm.postJSON("/plates/doAddAllLicencePlatesToLookupBatch", {
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

  function fn_refreshAvailablePlates() {

    if (batchIsLocked) {

      availablePlatesContainerEle.innerHTML = "<div class=\"message is-info\">" +
        "<div class=\"message-body\">Licence Plates cannot be added to a locked batch.</div>" +
        "</div>";

      return;
    }

    availablePlatesContainerEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading licence plates..." +
      "</p>";

    cityssm.postJSON(
      "/plates-ontario/doGetPlatesAvailableForMTOLookup", {
        batchID: batchID,
        issueDaysAgo: availableIssueDaysAgoEle.value
      },
      function(resultPlatesList) {

        availablePlatesList = resultPlatesList;
        fn_populateAvailablePlatesView();

      }
    );

  }

  document.getElementById("is-more-available-filters-toggle").addEventListener("click", function(clickEvent) {

    clickEvent.preventDefault();

    document.getElementById("is-more-available-filters").classList.toggle("is-hidden");

  });

  licencePlateNumberFilterEle.addEventListener("keyup", fn_populateAvailablePlatesView);

  availableIssueDaysAgoEle.addEventListener("change", fn_refreshAvailablePlates);


  // Current Batch


  const lockBatchButtonEle = document.getElementById("is-lock-batch-button");

  const batchEntriesContainerEle = document.getElementById("is-batch-entries-container");

  function fn_populateBatchView(batch: LicencePlateLookupBatch) {

    batchID = batch.batchID;
    batchEntriesList = batch.batchEntries;

    batchIsLocked = !(batch.lockDate == null);
    batchIsSent = !(batch.sentDate == null);

    if (canUpdate) {

      if (batchIsLocked) {

        lockBatchButtonEle.setAttribute("disabled", "disabled");

      } else {

        lockBatchButtonEle.removeAttribute("disabled");

      }
    }

    document.getElementById("batchSelector--batchID").innerText = "Batch #" + batch.batchID;

    document.getElementById("batchSelector--batchDetails").innerHTML =
      "<span class=\"icon is-small\"><i class=\"fas fa-calendar\" aria-hidden=\"true\"></i></span>" +
      "<span>" + batch.batchDateString + "</span>" +
      (batchIsLocked ?
        " <span class=\"tag is-light\">" +
        "<span class=\"icon is-small\"><i class=\"fas fa-lock\" aria-hidden=\"true\"></i></span> <span>" + batch.lockDateString + "</span>" +
        "</span>" :
        "");

    cityssm.clearElement(batchEntriesContainerEle);

    if (batchEntriesList.length === 0) {

      batchEntriesContainerEle.innerHTML = "<div class=\"message is-info\">" +
        "<p class=\"message-body\">There are no licence plates included in the batch.</p>" +
        "</div>";

      return;

    }

    cityssm.clearElement(batchEntriesContainerEle);

    const panelEle = document.createElement("div");
    panelEle.className = "panel";

    for (let index = 0; index < batchEntriesList.length; index += 1) {

      const batchEntry = batchEntriesList[index];

      const panelBlockEle = document.createElement("div");
      panelBlockEle.className = "panel-block is-block is-entry-container";

      panelBlockEle.innerHTML = "<div class=\"level\">" +
        ("<div class=\"level-left\">" +
          "<div class=\"licence-plate\">" +
          "<div class=\"licence-plate-number\">" + cityssm.escapeHTML(batchEntry.licencePlateNumber) + "</div>" +
          "</div>" +
          "</div>") +
        (batchIsLocked ?
          "" :
          "<div class=\"level-right\">" +
          "<button class=\"button is-small\" data-index=\"" + index + "\" type=\"button\">" +
          "<span class=\"icon is-small\"><i class=\"fas fa-minus\" aria-hidden=\"true\"></i></span>" +
          "<span>Remove</span>" +
          "</button>" +
          "</div>") +
        "</div>";

      if (!batchIsLocked) {

        panelBlockEle.getElementsByTagName("button")[0].addEventListener("click", clickFn_removeLicencePlateFromBatch);

      }

      panelEle.appendChild(panelBlockEle);

    }

    if (batchIsLocked) {

      const downloadFileButtonEle = document.createElement("button");
      downloadFileButtonEle.className = "button is-fullwidth mb-3";
      downloadFileButtonEle.innerHTML =
        "<span class=\"icon is-small\"><i class=\"fas fa-download\" aria-hidden=\"true\"></i></span>" +
        "<span>Download File for MTO</span>";

      downloadFileButtonEle.addEventListener("click", clickFn_downloadBatch);

      batchEntriesContainerEle.appendChild(downloadFileButtonEle);

      batchEntriesContainerEle.insertAdjacentHTML(
        "beforeend",
        "<a class=\"button is-fullwidth mb-3\" href=\"https://www.apps.rus.mto.gov.on.ca/edtW/login/login.jsp\" target=\"_blank\" rel=\"noreferrer\">" +
        "<span class=\"icon is-small\"><i class=\"fas fa-building\" aria-hidden=\"true\"></i></span>" +
        "<span>MTO ARIS Login</span>" +
        "</a>"
      );

    } else {

      const clearAllButtonEle = document.createElement("button");
      clearAllButtonEle.className = "button is-fullwidth mb-3";
      clearAllButtonEle.innerHTML =
        "<span class=\"icon is-small\"><i class=\"fas fa-broom\" aria-hidden=\"true\"></i></span>" +
        "<span>Clear Batch</span>";

      clearAllButtonEle.addEventListener("click", clickFn_clearBatch);

      batchEntriesContainerEle.appendChild(clearAllButtonEle);

    }

    batchEntriesContainerEle.appendChild(panelEle);

  }

  function fn_refreshBatch() {

    cityssm.postJSON(
      "/plates/doGetLookupBatch", {
        batchID: batchID
      },
      function(batch: LicencePlateLookupBatch) {

        fn_populateBatchView(batch);
        fn_refreshAvailablePlates();

      }
    );


  }

  function clickFn_openSelectBatchModal(clickEvent: Event) {

    clickEvent.preventDefault();

    let selectBatchCloseModalFn: Function;
    let resultsContainerEle: HTMLDivElement;

    const clickFn_selectBatch = function(batchClickEvent: Event) {

      batchClickEvent.preventDefault();

      batchID = parseInt((<HTMLAnchorElement>batchClickEvent.currentTarget).getAttribute("data-batch-id"), 10);

      selectBatchCloseModalFn();
      fn_refreshBatch();

    };

    const fn_loadBatches = function() {

      cityssm.postJSON("/plates/doGetUnreceivedLicencePlateLookupBatches", {}, function(batchList: LicencePlateLookupBatch[]) {

        if (batchList.length === 0) {

          resultsContainerEle.innerHTML = "<div class=\"message is-info\">" +
            "<p class=\"message-body\">There are no unsent batches available.</p>" +
            "</div>";
          return;

        }

        const listEle = document.createElement("div");
        listEle.className = "panel";

        for (let index = 0; index < batchList.length; index += 1) {

          const batch = batchList[index];

          const linkEle = document.createElement("a");
          linkEle.className = "panel-block is-block";
          linkEle.setAttribute("href", "#");
          linkEle.setAttribute("data-batch-id", batch.batchID.toString());

          linkEle.innerHTML = "<div class=\"columns\">" +
            "<div class=\"column is-narrow\">#" + batch.batchID + "</div>" +
            "<div class=\"column has-text-right\">" +
            batch.batchDateString + "<br />" +
            ("<div class=\"tags justify-flex-end\">" +
              (batch.lockDate ?
                "<span class=\"tag\">" +
                "<span class=\"icon is-small\"><i class=\"fas fa-lock\" aria-hidden=\"true\"></i></span>" +
                "<span>Locked</span>" +
                "</span>" :
                "") +
              (batch.sentDate ?
                "<span class=\"tag\">" +
                "<span class=\"icon is-small\"><i class=\"fas fa-share\" aria-hidden=\"true\"></i></span>" +
                "<span>Sent to MTO</span>" +
                "</span>" :
                "") +
              "</div>") +
            "</div>" +
            "</div>";

          linkEle.addEventListener("click", clickFn_selectBatch);

          listEle.appendChild(linkEle);

        }

        cityssm.clearElement(resultsContainerEle);
        resultsContainerEle.appendChild(listEle);

      });

    };

    cityssm.openHtmlModal("mto-selectBatch", {
      onshow(modalEle) {

        resultsContainerEle = <HTMLDivElement>modalEle.getElementsByClassName("is-results-container")[0];
        fn_loadBatches();

        if (canUpdate) {

          const createBatchButtonEle = modalEle.getElementsByClassName("is-create-batch-button")[0];

          createBatchButtonEle.classList.remove("is-hidden");

          createBatchButtonEle.addEventListener("click", function() {

            selectBatchCloseModalFn();

            const createFn = function() {

              cityssm.postJSON("/plates/doCreateLookupBatch", {}, function(responseJSON) {

                if (responseJSON.success) {

                  fn_populateBatchView(responseJSON.batch);
                  fn_refreshAvailablePlates();

                }

              });

            };

            cityssm.confirmModal(
              "Create a New Batch?",
              "Are you sure you want to create a new licence plate lookup batch?",
              "Yes, Create a Batch",
              "info",
              createFn
            );

          });

        }

      },
      onshown(_modalEle, closeModalFn) {
        selectBatchCloseModalFn = closeModalFn;
      }
    });

  }

  document.getElementById("is-select-batch-button").addEventListener("click", clickFn_openSelectBatchModal);

  if (canUpdate) {

    lockBatchButtonEle.addEventListener("click", function() {

      if (batchIsLocked) {
        return;
      }

      const lockFn = function() {

        cityssm.postJSON("/plates/doLockLookupBatch", {
          batchID: batchID
        }, function(responseJSON) {

          if (responseJSON.success) {

            fn_populateBatchView(responseJSON.batch);

          }

        });

      };

      cityssm.confirmModal(
        "Lock Batch?",
        "<strong>Are you sure you want to lock the batch?</strong><br />" +
        "Once the batch is locked, no licence plates can be added or deleted from the batch." +
        " All tickets related to the licence plates in the batch will be updated with a \"Pending Lookup\" status.",
        "Yes, Lock the Batch",
        "info",
        lockFn
      );
    });
  }

  if (exports.plateExportBatch) {

    fn_populateBatchView(exports.plateExportBatch);
    delete exports.plateExportBatch;

    fn_refreshAvailablePlates();
  }

}());
