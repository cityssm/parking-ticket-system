"use strict";

(function() {

  let batchID = -1;

  function populateView(batch) {

    batchID = batch.batchID;

    document.getElementById("batchSelector--batch").innerHTML =
      "<strong>Batch #" + batch.batchID + "</strong>, Created " + batch.batchDateString;

  }

  function getBatch() {

  }

  function openSelectBatchModal(clickEvent) {

    clickEvent.preventDefault();

    let selectBatchCloseModalFn;
    let resultsContainerEle;

    const selectBatchFn = function(batchClickEvent) {

      batchClickEvent.preventDefault();

      batchID = parseInt(batchClickEvent.currentTarget.getAttribute("data-batch-id"));

      selectBatchCloseModalFn();
      getBatch();

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

  document.getElementById("batchSelector--batch").addEventListener("dblclick", openSelectBatchModal);

  document.getElementById("is-create-batch-button").addEventListener("click", function() {

    const createFn = function() {

      pts.postJSON("/plates/doCreateLookupBatch", {}, function(responseJSON) {

        if (responseJSON.success) {

          populateView(responseJSON.batch);

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

    populateView(pts.plateExportBatch);
    delete pts.plateExportBatch;

  }

}());
