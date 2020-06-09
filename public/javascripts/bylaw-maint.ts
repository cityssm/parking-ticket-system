import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;


(function() {

  const bylawFilterEle = <HTMLInputElement>document.getElementById("bylawFilter--bylaw");
  const bylawResultsEle = document.getElementById("bylawResults");

  let bylawList = exports.bylaws;
  delete exports.bylaws;


  function openUpdateOffencesModal(clickEvent: Event) {

    clickEvent.preventDefault();

    const listIndex = parseInt((<HTMLButtonElement>clickEvent.currentTarget).getAttribute("data-index"));
    const bylaw = bylawList[listIndex];

    let updateOffencesCloseModalFn: Function;

    const updateFn = function(formEvent: Event) {

      formEvent.preventDefault();

      cityssm.postJSON("/admin/doUpdateOffencesByBylaw", formEvent.currentTarget, function(responseJSON) {

        if (responseJSON.success) {

          updateOffencesCloseModalFn();
          bylawList = responseJSON.bylaws;
          renderBylawList();

        }

      });
    }

    cityssm.openHtmlModal("bylaw-updateOffences", {
      onshow: function() {

        (<HTMLInputElement>document.getElementById("updateOffences--bylawNumber")).value = bylaw.bylawNumber;
        (<HTMLInputElement>document.getElementById("updateOffences--bylawDescription")).value = bylaw.bylawDescription;

        (<HTMLInputElement>document.getElementById("updateOffences--offenceAmount")).value = bylaw.offenceAmountMin;
        (<HTMLInputElement>document.getElementById("updateOffences--discountDays")).value = bylaw.discountDaysMin;
        (<HTMLInputElement>document.getElementById("updateOffences--discountOffenceAmount")).value = bylaw.discountOffenceAmountMin;

      },
      onshown: function(modalEle, closeModalFn) {

        updateOffencesCloseModalFn = closeModalFn;

        modalEle.getElementsByTagName("form")[0].addEventListener("submit", updateFn);
      }
    });
  }


  function openEditBylawModal(clickEvent: Event) {

    clickEvent.preventDefault();

    const listIndex = parseInt((<HTMLButtonElement>clickEvent.currentTarget).getAttribute("data-index"));
    const bylaw = bylawList[listIndex];

    let editBylawCloseModalFn: Function;

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

    const confirmDeleteFn = function(deleteClickEvent: Event) {

      deleteClickEvent.preventDefault();

      cityssm.confirmModal(
        "Delete By-Law",
        "Are you sure you want to remove by-law \"" + bylaw.bylawNumber + "\" from the list of available options?",
        "Yes, Remove By-Law",
        "danger",
        deleteFn
      );

    };

    const editFn = function(formEvent: Event) {

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

        (<HTMLInputElement>document.getElementById("editBylaw--bylawNumber")).value = bylaw.bylawNumber;
        (<HTMLInputElement>document.getElementById("editBylaw--bylawDescription")).value = bylaw.bylawDescription;

      },
      onshown: function(modalEle, closeModalFn) {

        editBylawCloseModalFn = closeModalFn;

        modalEle.getElementsByTagName("form")[0].addEventListener("submit", editFn);

        modalEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", confirmDeleteFn);

      }
    });

  }


  function renderBylawList() {

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

      let offenceAmountRange = "";
      let hasOffences = false;

      if (!bylaw.offenceAmountMin) {
        offenceAmountRange = "(No Offences)";
      } else {
        hasOffences = true;

        offenceAmountRange = "$" + bylaw.offenceAmountMin.toFixed(2);

        if (bylaw.offenceAmountMin !== bylaw.offenceAmountMax) {

          offenceAmountRange += " to $" + bylaw.offenceAmountMax.toFixed(2);
        }

        offenceAmountRange = "<a class=\"has-tooltip-left\" data-tooltip=\"Update Offence Amounts\" data-index=\"" + bylawIndex + "\" href=\"#\">" +
          offenceAmountRange +
          "</a>";
      }

      trEle.innerHTML =
        "<td>" +
        "<a data-index=\"" + bylawIndex + "\" href=\"#\">" +
        cityssm.escapeHTML(bylaw.bylawNumber) +
        "</a>" +
        "</td>" +
        "<td class=\"has-border-right-width-2\">" + cityssm.escapeHTML(bylaw.bylawDescription) + "</td>" +
        "<td class=\"has-text-right\">" + bylaw.offenceCount + "</td>" +
        "<td class=\"has-text-right\">" + offenceAmountRange + "</td>";

      trEle.getElementsByTagName("a")[0].addEventListener("click", openEditBylawModal);

      if (hasOffences) {
        trEle.getElementsByTagName("a")[1].addEventListener("click", openUpdateOffencesModal);

      }

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
      "<th class=\"has-border-right-width-2\">Description</th>" +
      "<th class=\"has-text-right\">Total Offences</th>" +
      "<th class=\"has-text-right\">Offence Amount Range</th>" +
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

    let addBylawCloseModalFn: Function;

    const addFn = function(formEvent: Event) {

      formEvent.preventDefault();

      cityssm.postJSON("/admin/doAddBylaw", formEvent.currentTarget, function(responseJSON) {

        if (responseJSON.success) {

          addBylawCloseModalFn();

          if (responseJSON.message) {

            cityssm.alertModal(
              "By-Law Added",
              responseJSON.message,
              "OK",
              "warning"
            );

          }

          bylawList = responseJSON.bylaws;
          renderBylawList();

        } else {

          cityssm.alertModal(
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
