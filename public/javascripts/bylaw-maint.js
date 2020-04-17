"use strict";

(function() {

  const bylawFilterEle = document.getElementById("bylawFilter--bylaw");
  const bylawResultsEle = document.getElementById("bylawResults");

  let renderBylawList;

  let bylawList = pts.bylawsInit;
  delete pts.bylawsInit;

  function openEditBylawModal(clickEvent) {

    clickEvent.preventDefault();

    const listIndex = parseInt(clickEvent.currentTarget.getAttribute("data-index"));
    const bylaw = bylawList[listIndex];

    let editBylawCloseModalFn;

    const deleteFn = function() {

      cityssm.postJSON("/admin/doDeleteBylaw", {
        bylawNumber: bylaw.bylawNumber
      }, function(responseJSON) {

        if (responseJSON.success) {

          editBylawCloseModalFn();
          bylawList = responseJSON.bylaws;
          renderBylawList();

        }

      });

    };

    const confirmDeleteFn = function(deleteClickEvent) {

      deleteClickEvent.preventDefault();

      pts.confirmModal(
        "Delete By-Law",
        "Are you sure you want to by-law \"" + bylaw.bylawNumber + "\" from the list of available options?",
        "Yes, Remove By-Law",
        "danger",
        deleteFn
      );

    };

    const editFn = function(formEvent) {

      formEvent.preventDefault();

      cityssm.postJSON("/admin/doUpdateBylaw", formEvent.currentTarget, function(responseJSON) {

        if (responseJSON.success) {

          editBylawCloseModalFn();
          bylawList = responseJSON.bylaws;
          renderBylawList();

        }

      });

    };

    cityssm.openHtmlModal("bylaw-edit", {
      onshow: function() {

        document.getElementById("editBylaw--bylawNumber").value = bylaw.bylawNumber;
        document.getElementById("editBylaw--bylawDescription").value = bylaw.bylawDescription;

      },
      onshown: function(modalEle, closeModalFn) {

        editBylawCloseModalFn = closeModalFn;

        modalEle.getElementsByTagName("form")[0].addEventListener("submit", editFn);

        modalEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", confirmDeleteFn);

      }
    });

  }

  renderBylawList = function() {

    let displayCount = 0;

    const bylawFilterSplit = bylawFilterEle.value.trim().toLowerCase()
      .split(" ");

    const tbodyEle = document.createElement("tbody");

    for (let bylawIndex = 0; bylawIndex < bylawList.length; bylawIndex += 1) {

      const bylaw = bylawList[bylawIndex];

      let showRecord = true;

      const bylawNumberLowerCase = bylaw.bylawNumber.toLowerCase();
      const bylawDescriptionLowerCase = bylaw.bylawDescription.toLowerCase();

      for (let searchIndex = 0; searchIndex < bylawFilterSplit.length; searchIndex += 1) {

        if (bylawNumberLowerCase.indexOf(bylawFilterSplit[searchIndex]) === -1 &&
          bylawDescriptionLowerCase.indexOf(bylawFilterSplit[searchIndex]) === -1) {

          showRecord = false;
          break;

        }

      }

      if (!showRecord) {

        continue;

      }

      displayCount += 1;

      const trEle = document.createElement("tr");

      trEle.innerHTML =
        "<td>" +
        "<a data-index=\"" + bylawIndex + "\" href=\"#\">" +
        cityssm.escapeHTML(bylaw.bylawNumber) +
        "</a>" +
        "</td>" +
        "<td>" + cityssm.escapeHTML(bylaw.bylawDescription) + "</td>";

      trEle.getElementsByTagName("a")[0].addEventListener("click", openEditBylawModal);

      tbodyEle.appendChild(trEle);

    }

    cityssm.clearElement(bylawResultsEle);

    if (displayCount === 0) {

      bylawResultsEle.innerHTML = "<div class=\"message is-info\">" +
        "<div class=\"message-body\">There are no by-laws that meet your search criteria.</div>" +
        "</div>";

      return;

    }

    bylawResultsEle.innerHTML = "<table class=\"table is-striped is-hoverable is-fullwidth\">" +
      "<thead><tr>" +
      "<th>By-Law Number</th>" +
      "<th>Description</th>" +
      "</tr></thead>" +
      "</table>";

    bylawResultsEle.getElementsByTagName("table")[0].appendChild(tbodyEle);

  };


  // Initialize filters


  bylawFilterEle.addEventListener("keyup", renderBylawList);
  renderBylawList();


  // Initialize add button


  document.getElementById("is-add-bylaw-button").addEventListener("click", function(clickEvent) {

    clickEvent.preventDefault();

    let addBylawCloseModalFn;

    const addFn = function(formEvent) {

      formEvent.preventDefault();

      cityssm.postJSON("/admin/doAddBylaw", formEvent.currentTarget, function(responseJSON) {

        if (responseJSON.success) {

          addBylawCloseModalFn();

          if (responseJSON.message) {

            pts.alertModal(
              "By-Law Added",
              responseJSON.message,
              "OK",
              "warning"
            );

          }

          bylawList = responseJSON.bylaws;
          renderBylawList();

        } else {

          pts.alertModal(
            "By-Law Not Added",
            responseJSON.message,
            "OK",
            "danger"
          );

        }

      });

    };

    cityssm.openHtmlModal("bylaw-add", {

      onshown: function(modalEle, closeModalFn) {

        addBylawCloseModalFn = closeModalFn;

        modalEle.getElementsByTagName("form")[0].addEventListener("submit", addFn);

      }

    });

  });

}());
