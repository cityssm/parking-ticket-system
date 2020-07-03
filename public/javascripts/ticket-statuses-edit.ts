import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/src/types";
import type { ptsGlobal } from "./types";
import type * as ptsTypes from "../../helpers/ptsTypes";

declare const cityssm: cityssmGlobal;
declare const pts: ptsGlobal;


(() => {

  const ticketID = (document.getElementById("ticket--ticketID") as HTMLInputElement).value;

  const statusPanelEle = document.getElementById("is-status-panel");

  let statusList = exports.ticketStatusLog as ptsTypes.ParkingTicketStatusLog[];
  delete exports.ticketStatusLog;

  const clearStatusPanelFn = () => {

    const panelBlockEles = statusPanelEle.getElementsByClassName("panel-block");

    while (panelBlockEles.length > 0) {
      panelBlockEles[0].remove();
    }
  };

  const confirmResolveTicketFn = (clickEvent: Event) => {

    clickEvent.preventDefault();

    cityssm.confirmModal(
      "Mark Ticket as Resolved?",
      "Once resolved, you will no longer be able to make changes to the ticket.",
      "Yes, Resolve Ticket",
      "info",
      () => {

        cityssm.postJSON(
          "/tickets/doResolveTicket", {
            ticketID
          },
          (responseJSON: { success: boolean }) => {

            if (responseJSON.success) {
              window.location.href = "/tickets/" + ticketID;
            }
          }
        );

      }
    );

  };

  const confirmDeleteStatusFn = (clickEvent: Event) => {

    const statusIndex = (clickEvent.currentTarget as HTMLButtonElement).getAttribute("data-status-index");

    cityssm.confirmModal(
      "Delete Remark?",
      "Are you sure you want to delete this status?",
      "Yes, Delete",
      "warning",
      () => {

        cityssm.postJSON("/tickets/doDeleteStatus", {
          ticketID,
          statusIndex
        },
          (responseJSON: { success: boolean }) => {

            if (responseJSON.success) {
              getStatusesFn();
            }
          });
      }
    );

  };

  const openEditStatusModalFn = (clickEvent: Event) => {

    clickEvent.preventDefault();

    let editStatusCloseModalFn: () => void;

    const index = parseInt((clickEvent.currentTarget as HTMLButtonElement).getAttribute("data-index"), 10);

    const statusObj = statusList[index];

    const submitFn = (formEvent: Event) => {

      formEvent.preventDefault();

      cityssm.postJSON("/tickets/doUpdateStatus", formEvent.currentTarget,
        (responseJSON: { success: boolean }) => {

          if (responseJSON.success) {
            editStatusCloseModalFn();
            getStatusesFn();
          }
        });
    };

    const statusKeyChangeFn = (changeEvent: Event) => {

      const statusKeyObj = pts.getTicketStatus((changeEvent.currentTarget as HTMLSelectElement).value);

      const statusFieldEle = document.getElementById("editStatus--statusField") as HTMLInputElement;
      statusFieldEle.value = "";

      if (statusKeyObj?.statusField) {

        const fieldEle = statusFieldEle.closest(".field");
        fieldEle.getElementsByTagName("label")[0].innerText = statusKeyObj.statusField.fieldLabel;
        fieldEle.classList.remove("is-hidden");

      } else {

        statusFieldEle.closest(".field").classList.add("is-hidden");
      }

      const statusField2Ele = document.getElementById("editStatus--statusField2") as HTMLInputElement;
      statusField2Ele.value = "";

      if (statusKeyObj ?.statusField2) {

        const fieldEle = statusField2Ele.closest(".field");
        fieldEle.getElementsByTagName("label")[0].innerText = statusKeyObj.statusField2.fieldLabel;
        fieldEle.classList.remove("is-hidden");

      } else {

        statusFieldEle.closest(".field").classList.add("is-hidden");
      }
    };

    cityssm.openHtmlModal("ticket-editStatus", {

      onshow(modalEle: HTMLElement): void {

        (document.getElementById("editStatus--ticketID") as HTMLInputElement).value = ticketID;

        (document.getElementById("editStatus--statusIndex") as HTMLInputElement).value =
          statusObj.statusIndex.toString();

        (document.getElementById("editStatus--statusField") as HTMLInputElement).value = statusObj.statusField;
        (document.getElementById("editStatus--statusField2") as HTMLInputElement).value = statusObj.statusField2;
        (document.getElementById("editStatus--statusNote") as HTMLTextAreaElement).value = statusObj.statusNote;

        const statusDateEle = document.getElementById("editStatus--statusDateString") as HTMLInputElement;
        statusDateEle.value = statusObj.statusDateString;
        statusDateEle.setAttribute("max", cityssm.dateToString(new Date()));

        (document.getElementById("editStatus--statusTimeString") as HTMLInputElement).value =
          statusObj.statusTimeString;

        pts.getDefaultConfigProperty("parkingTicketStatuses",
          (parkingTicketStatuses: ptsTypes.ConfigParkingTicketStatus[]) => {

            let statusKeyFound = false;

            const statusKeyEle = document.getElementById("editStatus--statusKey") as HTMLSelectElement;

            for (const statusKeyObj of parkingTicketStatuses) {

              if (statusKeyObj.isUserSettable || statusKeyObj.statusKey === statusObj.statusKey) {

                statusKeyEle.insertAdjacentHTML("beforeend", "<option value=\"" + statusKeyObj.statusKey + "\">" +
                  statusKeyObj.status +
                  "</option>");

                if (statusKeyObj.statusKey === statusObj.statusKey) {

                  statusKeyFound = true;

                  if (statusKeyObj.statusField) {

                    const fieldEle = document.getElementById("editStatus--statusField").closest(".field");
                    fieldEle.getElementsByTagName("label")[0].innerText = statusKeyObj.statusField.fieldLabel;
                    fieldEle.classList.remove("is-hidden");

                  }

                  if (statusKeyObj.statusField2) {

                    const fieldEle = document.getElementById("editStatus--statusField2").closest(".field");
                    fieldEle.getElementsByTagName("label")[0].innerText = statusKeyObj.statusField2.fieldLabel;
                    fieldEle.classList.remove("is-hidden");

                  }
                }
              }
            }

            if (!statusKeyFound) {

              statusKeyEle.insertAdjacentHTML("beforeend", "<option value=\"" + statusObj.statusKey + "\">" +
                statusObj.statusKey +
                "</option>");
            }

            statusKeyEle.value = statusObj.statusKey;

            statusKeyEle.addEventListener("change", statusKeyChangeFn);

          });

        modalEle.getElementsByTagName("form")[0].addEventListener("submit", submitFn);

      },
      onshown(_modalEle: HTMLElement, closeModalFn: () => void): void {
        editStatusCloseModalFn = closeModalFn;
      }
    });

  };

  const populateStatusesPanelFn = () => {

    clearStatusPanelFn();

    if (statusList.length === 0) {

      statusPanelEle.insertAdjacentHTML("beforeend", "<div class=\"panel-block is-block\">" +
        "<div class=\"message is-info\">" +
        "<p class=\"message-body\">" +
        "There are no statuses associated with this ticket." +
        "</p>" +
        "</div>" +
        "</div>");

      return;
    }

    // Loop through statuses

    for (const statusObj of statusList) {

      const statusDefinitionObj = pts.getTicketStatus(statusObj.statusKey);

      const panelBlockEle = document.createElement("div");
      panelBlockEle.className = "panel-block is-block";

      panelBlockEle.innerHTML = "<div class=\"columns\">" +
        ("<div class=\"column\">" +

          ("<div class=\"level mb-1\">" +
            "<div class=\"level-left\">" +
            "<strong>" + (statusDefinitionObj ? statusDefinitionObj.status : statusObj.statusKey) + "</strong>" +
            "</div>" +
            "<div class=\"level-right\">" + statusObj.statusDateString + "</div>" +
            "</div>") +

          (!statusObj.statusField || statusObj.statusField === ""
            ? ""
            : "<p class=\"is-size-7\">" +
            "<strong>" +
            (statusDefinitionObj ?.statusField
              ? statusDefinitionObj.statusField.fieldLabel
              : "") +
            ":</strong> " +
            statusObj.statusField +
            "</p>") +

          (!statusObj.statusField2 || statusObj.statusField2 === ""
            ? ""
            : "<p class=\"is-size-7\">" +
            "<strong>" +
            (statusDefinitionObj ?.statusField2
              ? statusDefinitionObj.statusField2.fieldLabel
              : "") +
            ":</strong> " +
            statusObj.statusField2 +
            "</p>") +

          "<p class=\"has-newline-chars is-size-7\">" + statusObj.statusNote + "</p>" +

          "</div>") +

        "</div>";

      statusPanelEle.appendChild(panelBlockEle);
    }

    // Initialize edit and delete buttons (if applicable)

    const firstStatusObj = statusList[0];

    if (firstStatusObj.canUpdate) {

      const firstStatusColumnsEle =
        statusPanelEle.getElementsByClassName("panel-block")[0].getElementsByClassName("columns")[0];

      firstStatusColumnsEle.insertAdjacentHTML("beforeend", "<div class=\"column is-narrow\">" +
        "<div class=\"buttons is-right has-addons\">" +
        ("<button class=\"button is-small is-edit-status-button\"" +
          " data-tooltip=\"Edit Status\" data-index=\"0\" type=\"button\">" +
          "<span class=\"icon is-small\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
          " <span>Edit</span>" +
          "</button>") +
        ("<button class=\"button is-small has-text-danger is-delete-status-button\" data-tooltip=\"Delete Status\"" +
          " data-status-index=\"" + firstStatusObj.statusIndex.toString() + "\" type=\"button\">" +
          "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
          "<span class=\"sr-only\">Delete</span>" +
          "</button>") +
        "</div>" +
        "</div>");

      firstStatusColumnsEle.getElementsByClassName("is-edit-status-button")[0]
        .addEventListener("click", openEditStatusModalFn);

      firstStatusColumnsEle.getElementsByClassName("is-delete-status-button")[0]
        .addEventListener("click", confirmDeleteStatusFn);

    }

    // Add finalize button

    const firstStatusDefinitionObj = pts.getTicketStatus(firstStatusObj.statusKey);

    if (firstStatusDefinitionObj ?.isFinalStatus) {

      const finalizePanelBlockEle = document.createElement("div");
      finalizePanelBlockEle.className = "panel-block is-block";

      finalizePanelBlockEle.innerHTML = "<div class=\"message is-info is-clearfix\">" +
        "<div class=\"message-body\">" +

        "<div class=\"columns\">" +

        "<div class=\"column\">" +
        "<strong>This ticket is able to be marked as resolved.</strong>" +
        "</div>" +

        "<div class=\"column is-narrow has-text-right align-self-flex-end\">" +
        "<button class=\"button is-info\" type=\"button\">" +
        "<span class=\"icon is-small\"><i class=\"fas fa-check\" aria-hidden=\"true\"></i></span>" +
        "<span>Resolve Ticket</span>" +
        "</button>" +
        "</div>" +

        "</div>" +
        "</div>" +
        "</div>";

      finalizePanelBlockEle.getElementsByTagName("button")[0].addEventListener("click", confirmResolveTicketFn);

      statusPanelEle.insertAdjacentElement("afterbegin", finalizePanelBlockEle);

    }

  };

  const getStatusesFn = () => {

    clearStatusPanelFn();

    statusPanelEle.insertAdjacentHTML(
      "beforeend",
      "<div class=\"panel-block is-block\">" +
      "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-2x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading statuses..." +
      "</p>" +
      "</div>"
    );

    cityssm.postJSON("/tickets/doGetStatuses", {
      ticketID
    },
      (responseStatusList) => {

        statusList = responseStatusList;
        populateStatusesPanelFn();

      });

  };

  document.getElementById("is-add-status-button").addEventListener("click", (clickEvent) => {

    clickEvent.preventDefault();

    let addStatusCloseModalFn: () => void;

    const submitFn = (formEvent: Event) => {

      formEvent.preventDefault();

      const resolveTicket = (document.getElementById("addStatus--resolveTicket") as HTMLInputElement).checked;

      cityssm.postJSON("/tickets/doAddStatus", formEvent.currentTarget,
        (responseJSON: { success: boolean }) => {

          if (responseJSON.success) {

            addStatusCloseModalFn();

            if (resolveTicket) {

              window.location.href = "/tickets/" + ticketID;

            } else {

              getStatusesFn();
            }
          }
        });
    };

    const statusKeyChangeFn = (changeEvent: Event) => {

      const statusObj = pts.getTicketStatus((changeEvent.currentTarget as HTMLInputElement).value);

      const statusFieldEle = document.getElementById("addStatus--statusField") as HTMLInputElement;
      statusFieldEle.value = "";

      if (statusObj ?.statusField) {

        const fieldEle = statusFieldEle.closest(".field");
        fieldEle.getElementsByTagName("label")[0].innerText = statusObj.statusField.fieldLabel;
        fieldEle.classList.remove("is-hidden");

      } else {

        statusFieldEle.closest(".field").classList.add("is-hidden");

      }

      const statusField2Ele = document.getElementById("addStatus--statusField2") as HTMLInputElement;
      statusField2Ele.value = "";

      if (statusObj ?.statusField2) {

        const fieldEle = statusField2Ele.closest(".field");
        fieldEle.getElementsByTagName("label")[0].innerText = statusObj.statusField2.fieldLabel;
        fieldEle.classList.remove("is-hidden");

      } else {
        statusField2Ele.closest(".field").classList.add("is-hidden");
      }

      const resolveTicketEle = document.getElementById("addStatus--resolveTicket") as HTMLInputElement;
      resolveTicketEle.checked = false;

      if (statusObj ?.isFinalStatus) {

        resolveTicketEle.closest(".field").classList.remove("is-hidden");

      } else {
        resolveTicketEle.closest(".field").classList.add("is-hidden");
      }
    };

    cityssm.openHtmlModal("ticket-addStatus", {

      onshow(modalEle: HTMLElement): void {

        (document.getElementById("addStatus--ticketID") as HTMLInputElement).value = ticketID;

        pts.getDefaultConfigProperty("parkingTicketStatuses",
          (parkingTicketStatuses: ptsTypes.ConfigParkingTicketStatus[]) => {

            const statusKeyEle = document.getElementById("addStatus--statusKey");

            for (const statusObj of parkingTicketStatuses) {

              if (statusObj.isUserSettable) {
                statusKeyEle.insertAdjacentHTML("beforeend", "<option value=\"" + statusObj.statusKey + "\">" +
                  statusObj.status +
                  "</option>");
              }
            }

            statusKeyEle.addEventListener("change", statusKeyChangeFn);
          });

        modalEle.getElementsByTagName("form")[0].addEventListener("submit", submitFn);

      },
      onshown(_modalEle: HTMLElement, closeModalFn: () => void): void {
        addStatusCloseModalFn = closeModalFn;
      }

    });

  });

  document.getElementById("is-add-paid-status-button").addEventListener("click", (clickEvent) => {

    clickEvent.preventDefault();

    let addPaidStatusCloseModalFn: () => void;

    const submitFn = (formEvent: Event) => {

      formEvent.preventDefault();

      const resolveTicket = (document.getElementById("addPaidStatus--resolveTicket") as HTMLInputElement).checked;

      cityssm.postJSON("/tickets/doAddStatus", formEvent.currentTarget,
        (responseJSON: { success: boolean }) => {

          if (responseJSON.success) {

            addPaidStatusCloseModalFn();

            if (resolveTicket) {
              window.location.href = "/tickets/" + ticketID;

            } else {
              getStatusesFn();
            }
          }
        });
    };

    cityssm.openHtmlModal("ticket-addStatusPaid", {

      onshow(modalEle: HTMLElement): void {

        (document.getElementById("addPaidStatus--ticketID") as HTMLInputElement).value = ticketID;

        // Set amount

        const statusFieldEle = document.getElementById("addPaidStatus--statusField") as HTMLInputElement;

        const offenceAmount = (document.getElementById("ticket--offenceAmount") as HTMLInputElement).value;

        const issueDateString = (document.getElementById("ticket--issueDateString") as HTMLInputElement).value;

        const discountDays = (document.getElementById("ticket--discountDays") as HTMLInputElement).value;

        if (issueDateString === "" || discountDays === "") {
          statusFieldEle.value = offenceAmount;

        } else {

          const currentDateString = cityssm.dateToString(new Date());

          const dateDifference = cityssm.dateStringDifferenceInDays(issueDateString, currentDateString);

          if (dateDifference <= parseInt(discountDays, 10)) {

            statusFieldEle.value =
              (document.getElementById("ticket--discountOffenceAmount") as HTMLInputElement).value;

          } else {
            statusFieldEle.value = offenceAmount;
          }
        }

        modalEle.getElementsByTagName("form")[0].addEventListener("submit", submitFn);

      },
      onshown(_modalEle: HTMLElement, closeModalFn: () => void): void {
        addPaidStatusCloseModalFn = closeModalFn;
      }

    });

  });

  pts.loadDefaultConfigProperties(populateStatusesPanelFn);

})();
