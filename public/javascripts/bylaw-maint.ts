import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { ParkingBylaw } from "../../types/recordTypes";

declare const cityssm: cityssmGlobal;

interface UpdateBylawResponseJSON {
  success: boolean;
  message?: string;
  bylaws?: ParkingBylaw[];
}


(() => {

  const bylawFilterEle = document.getElementById("bylawFilter--bylaw") as HTMLInputElement;
  const bylawResultsEle = document.getElementById("bylawResults");

  let bylawList = exports.bylaws as ParkingBylaw[];
  delete exports.bylaws;


  const openUpdateOffencesModal = (clickEvent: Event) => {

    clickEvent.preventDefault();

    const listIndex = parseInt((clickEvent.currentTarget as HTMLButtonElement).getAttribute("data-index"), 10);
    const bylaw = bylawList[listIndex];

    let updateOffencesCloseModalFn: () => void;

    const updateFn = (formEvent: Event) => {

      formEvent.preventDefault();

      cityssm.postJSON("/admin/doUpdateOffencesByBylaw", formEvent.currentTarget,
        (responseJSON: UpdateBylawResponseJSON) => {

          if (responseJSON.success) {
            updateOffencesCloseModalFn();
            bylawList = responseJSON.bylaws;
            renderBylawListFn();
          }
        });
    };

    cityssm.openHtmlModal("bylaw-updateOffences", {
      onshow(): void {

        (document.getElementById("updateOffences--bylawNumber") as HTMLInputElement).value = bylaw.bylawNumber;
        (document.getElementById("updateOffences--bylawDescription") as HTMLInputElement).value = bylaw.bylawDescription;

        (document.getElementById("updateOffences--offenceAmount") as HTMLInputElement).value =
          bylaw.offenceAmountMin.toFixed(2);

        (document.getElementById("updateOffences--discountDays") as HTMLInputElement).value =
          bylaw.discountDaysMin.toString();

        (document.getElementById("updateOffences--discountOffenceAmount") as HTMLInputElement).value =
          bylaw.discountOffenceAmountMin.toFixed(2);

      },
      onshown(modalEle: HTMLElement, closeModalFn: () => void): void {

        updateOffencesCloseModalFn = closeModalFn;
        modalEle.getElementsByTagName("form")[0].addEventListener("submit", updateFn);
      }
    });
  };


  const openEditBylawModalFn = (clickEvent: Event) => {

    clickEvent.preventDefault();

    const listIndex = parseInt((clickEvent.currentTarget as HTMLButtonElement).getAttribute("data-index"), 10);
    const bylaw = bylawList[listIndex];

    let editBylawCloseModalFn: () => void;

    const deleteFn = () => {

      cityssm.postJSON("/admin/doDeleteBylaw", {
        bylawNumber: bylaw.bylawNumber
      }, (responseJSON: UpdateBylawResponseJSON) => {

        if (responseJSON.success) {

          editBylawCloseModalFn();
          bylawList = responseJSON.bylaws;
          renderBylawListFn();
        }
      });
    };

    const confirmDeleteFn = (deleteClickEvent: Event) => {

      deleteClickEvent.preventDefault();

      cityssm.confirmModal(
        "Delete By-Law",
        "Are you sure you want to remove by-law \"" + bylaw.bylawNumber + "\" from the list of available options?",
        "Yes, Remove By-Law",
        "danger",
        deleteFn
      );

    };

    const editFn = (formEvent: Event) => {

      formEvent.preventDefault();

      cityssm.postJSON("/admin/doUpdateBylaw", formEvent.currentTarget, (responseJSON: UpdateBylawResponseJSON) => {

        if (responseJSON.success) {

          editBylawCloseModalFn();
          bylawList = responseJSON.bylaws;
          renderBylawListFn();

        }

      });

    };

    cityssm.openHtmlModal("bylaw-edit", {
      onshow(): void {

        (document.getElementById("editBylaw--bylawNumber") as HTMLInputElement).value = bylaw.bylawNumber;
        (document.getElementById("editBylaw--bylawDescription") as HTMLInputElement).value = bylaw.bylawDescription;

      },
      onshown(modalEle: HTMLElement, closeModalFn: () => void): void {

        editBylawCloseModalFn = closeModalFn;

        modalEle.getElementsByTagName("form")[0].addEventListener("submit", editFn);

        modalEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", confirmDeleteFn);

      }
    });
  };


  const renderBylawListFn = () => {

    let displayCount = 0;

    const bylawFilterSplit = bylawFilterEle.value.trim().toLowerCase()
      .split(" ");

    const tbodyEle = document.createElement("tbody");

    bylawList.forEach((bylaw, bylawIndex) => {

      let showRecord = true;

      const bylawNumberLowerCase = bylaw.bylawNumber.toLowerCase();
      const bylawDescriptionLowerCase = bylaw.bylawDescription.toLowerCase();

      for (const searchStringPiece of bylawFilterSplit) {

        if (!bylawNumberLowerCase.includes(searchStringPiece) &&
          !bylawDescriptionLowerCase.includes(searchStringPiece)) {

          showRecord = false;
          break;
        }
      }

      if (!showRecord) {
        return;
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

        offenceAmountRange =
          "<a class=\"has-tooltip-left\" data-tooltip=\"Update Offence Amounts\"" +
          " data-index=\"" + bylawIndex.toString() + "\" href=\"#\">" +
          offenceAmountRange +
          "</a>";
      }

      trEle.innerHTML =
        "<td>" +
        "<a data-index=\"" + bylawIndex.toString() + "\" href=\"#\">" +
        cityssm.escapeHTML(bylaw.bylawNumber) +
        "</a>" +
        "</td>" +
        "<td class=\"has-border-right-width-2\">" + cityssm.escapeHTML(bylaw.bylawDescription) + "</td>" +
        "<td class=\"has-text-right\">" + bylaw.offenceCount.toString() + "</td>" +
        "<td class=\"has-text-right\">" + offenceAmountRange + "</td>";

      trEle.getElementsByTagName("a")[0].addEventListener("click", openEditBylawModalFn);

      if (hasOffences) {
        trEle.getElementsByTagName("a")[1].addEventListener("click", openUpdateOffencesModal);

      }

      tbodyEle.appendChild(trEle);

    });

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


  bylawFilterEle.addEventListener("keyup", renderBylawListFn);
  renderBylawListFn();


  // Initialize add button


  document.getElementById("is-add-bylaw-button").addEventListener("click", (clickEvent) => {

    clickEvent.preventDefault();

    let addBylawCloseModalFn: () => void;

    const addFn = (formEvent: Event) => {

      formEvent.preventDefault();

      cityssm.postJSON("/admin/doAddBylaw", formEvent.currentTarget, (responseJSON: UpdateBylawResponseJSON) => {

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
          renderBylawListFn();

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

      onshown(modalEle: HTMLElement, closeModalFn: () => void): void {
        addBylawCloseModalFn = closeModalFn;
        modalEle.getElementsByTagName("form")[0].addEventListener("submit", addFn);
      }

    });

  });

})();
