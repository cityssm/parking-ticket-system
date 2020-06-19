import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;


(function() {

  const ticketID = (<HTMLInputElement>document.getElementById("ticket--ticketID")).value;

  const remarkPanelEle = document.getElementById("is-remark-panel");

  let remarkList = exports.ticketRemarks;
  delete exports.ticketRemarks;


  const clearRemarkPanelFn = function() {

    const panelBlockEles = remarkPanelEle.getElementsByClassName("panel-block");

    while (panelBlockEles.length > 0) {

      panelBlockEles[0].remove();

    }

  };

  const confirmDeleteRemarkFn = function(clickEvent: Event) {

    const remarkIndex = (<HTMLAnchorElement>clickEvent.currentTarget).getAttribute("data-remark-index");

    cityssm.confirmModal(
      "Delete Remark?",
      "Are you sure you want to delete this remark?",
      "Yes, Delete",
      "warning",
      function() {

        cityssm.postJSON("/tickets/doDeleteRemark", {
          ticketID,
          remarkIndex
        }, function(resultJSON) {

          if (resultJSON.success) {

            getRemarksFn();

          }

        });

      }
    );

  };

  const openEditRemarkModalFn = function(clickEvent: Event) {

    clickEvent.preventDefault();

    let editRemarkCloseModalFn: Function;

    const index = parseInt((<HTMLButtonElement>clickEvent.currentTarget).getAttribute("data-index"), 10);

    const remarkObj = remarkList[index];

    const submitFn = function(formEvent: Event) {

      formEvent.preventDefault();

      cityssm.postJSON("/tickets/doUpdateRemark", formEvent.currentTarget, function(responseJSON) {

        if (responseJSON.success) {

          editRemarkCloseModalFn();
          getRemarksFn();

        }

      });

    };

    cityssm.openHtmlModal("ticket-editRemark", {

      onshow: function(modalEle) {

        (<HTMLInputElement>document.getElementById("editRemark--ticketID")).value = ticketID;
        (<HTMLInputElement>document.getElementById("editRemark--remarkIndex")).value = remarkObj.remarkIndex;
        (<HTMLInputElement>document.getElementById("editRemark--remark")).value = remarkObj.remark;
        (<HTMLInputElement>document.getElementById("editRemark--remarkDateString")).value = remarkObj.remarkDateString;
        (<HTMLInputElement>document.getElementById("editRemark--remarkTimeString")).value = remarkObj.remarkTimeString;

        modalEle.getElementsByTagName("form")[0].addEventListener("submit", submitFn);

      },
      onshown: function(_modalEle, closeModalFn) {
        editRemarkCloseModalFn = closeModalFn;
      }

    });

  };

  const populateRemarksPanelFn = function() {

    clearRemarkPanelFn();

    if (remarkList.length === 0) {

      remarkPanelEle.insertAdjacentHTML("beforeend", "<div class=\"panel-block is-block\">" +
        "<div class=\"message is-info\">" +
        "<p class=\"message-body\">" +
        "There are no remarks associated with this ticket." +
        "</p>" +
        "</div>" +
        "</div>");

      return;

    }

    for (let index = 0; index < remarkList.length; index += 1) {

      const remarkObj = remarkList[index];

      const panelBlockEle = document.createElement("div");
      panelBlockEle.className = "panel-block is-block";

      panelBlockEle.innerHTML = "<div class=\"columns\">" +
        ("<div class=\"column\">" +

          "<p class=\"has-newline-chars\">" +
          cityssm.escapeHTML(remarkObj.remark) +
          "</p>" +
          "<p class=\"is-size-7\">" +
          (remarkObj.recordCreate_timeMillis === remarkObj.recordUpdate_timeMillis ?
            "" :
            "<i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i> ") +
          remarkObj.recordUpdate_userName + " - " +
          remarkObj.remarkDateString + " " + remarkObj.remarkTimeString +
          "</p>" +
          "</div>") +

        (remarkObj.canUpdate ?
          "<div class=\"column is-narrow\">" +
          "<div class=\"buttons is-right has-addons\">" +
          ("<button class=\"button is-small is-edit-remark-button\"" +
            " data-tooltip=\"Edit Remark\" data-index=\"" + index + "\" type=\"button\">" +
            "<span class=\"icon is-small\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
            " <span>Edit</span>" +
            "</button>") +
          ("<button class=\"button is-small has-text-danger is-delete-remark-button\"" +
            " data-tooltip=\"Delete Remark\" data-remark-index=\"" + remarkObj.remarkIndex + "\" type=\"button\">" +
            "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
            "<span class=\"sr-only\">Delete</span>" +
            "</button>") +
          "</div>" +
          "</div>" :
          "") +
        "</div>";

      if (remarkObj.canUpdate) {

        panelBlockEle.getElementsByClassName("is-edit-remark-button")[0]
          .addEventListener("click", openEditRemarkModalFn);

        panelBlockEle.getElementsByClassName("is-delete-remark-button")[0]
          .addEventListener("click", confirmDeleteRemarkFn);

      }

      remarkPanelEle.appendChild(panelBlockEle);

    }

  };

  const getRemarksFn = function() {

    clearRemarkPanelFn();

    remarkPanelEle.insertAdjacentHTML(
      "beforeend",
      "<div class=\"panel-block is-block\">" +
      "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-2x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading remarks..." +
      "</p>" +
      "</div>"
    );

    cityssm.postJSON("/tickets/doGetRemarks", {
      ticketID: ticketID
    }, function(resultList) {

      remarkList = resultList;
      populateRemarksPanelFn();

    });

  };

  document.getElementById("is-add-remark-button").addEventListener("click", function(clickEvent) {

    clickEvent.preventDefault();

    let addRemarkCloseModalFn: Function;

    const submitFn = function(formEvent: Event) {

      formEvent.preventDefault();

      cityssm.postJSON("/tickets/doAddRemark", formEvent.currentTarget, function(responseJSON) {

        if (responseJSON.success) {

          addRemarkCloseModalFn();
          getRemarksFn();

        }

      });

    };

    cityssm.openHtmlModal("ticket-addRemark", {

      onshow: function(modalEle) {

        (<HTMLInputElement>document.getElementById("addRemark--ticketID")).value = ticketID;
        modalEle.getElementsByTagName("form")[0].addEventListener("submit", submitFn);

      },
      onshown: function(_modalEle, closeModalFn) {
        addRemarkCloseModalFn = closeModalFn;
      }

    });

  });

  populateRemarksPanelFn();

}());
