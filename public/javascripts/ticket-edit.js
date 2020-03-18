"use strict";

(function() {

  const ticketID = document.getElementById("ticket--ticketID").value;
  const isCreate = (ticketID === "");

  /*
   * Form Management
   */

  {

    const formMessageEle = document.getElementById("container--form-message");

    let hasUnsavedChanges = false;

    const setUnsavedChangesFn = function(changeEvent) {

      pts.enableNavBlocker();

      hasUnsavedChanges = true;

      formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
        "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
        " <span>Unsaved Changes</span>" +
        "</div>";

    };

    const inputEles = document.querySelectorAll(".input, .select, .textarea");

    for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {

      inputEles[inputIndex].addEventListener("change", setUnsavedChangesFn);

    }

    document.getElementById("form--ticket").addEventListener("submit", function(formEvent) {

      formEvent.preventDefault();

      const ticketNumber = document.getElementById("ticket--ticketNumber").value;

      formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
        "<span>Saving ticket... </span>" +
        " <span class=\"icon\"><i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i></span>" +
        "</div>";

      pts.postJSON(
        (isCreate ? "/tickets/doCreateTicket" : "/tickets/doUpdateTicket"),
        formEvent.currentTarget,
        function(responseJSON) {

          if (responseJSON.success) {

            pts.disableNavBlocker();
            hasUnsavedChanges = false;

            formMessageEle.innerHTML = "<span class=\"tag is-light is-success is-medium\">" +
              "<span class=\"icon\"><i class=\"fas fa-check\" aria-hidden=\"true\"></i></span>" +
              " <span>Saved Successfully</span>" +
              "</div>";

          } else {

            setUnsavedChangesFn();
            pts.alertModal("Ticket Not Saved", responseJSON.message, "OK", "danger");

          }

          if (responseJSON.success && isCreate) {

            pts.openHtmlModal("ticket-createSuccess", {
              onshow: function() {

                document.getElementById("createSuccess--ticketNumber").innerText = ticketNumber;

                document.getElementById("createSuccess--editTicketButton").setAttribute(
                  "href",
                  "/tickets/" + responseJSON.ticketID + "/edit"
                );

                document.getElementById("createSuccess--newTicketButton").setAttribute(
                  "href",
                  "/tickets/new/" + responseJSON.nextTicketNumber
                );

              }
            });

          }

        }
      );

    });

  }

  if (!isCreate) {

    document.getElementById("is-delete-ticket-button").addEventListener("click", function(clickEvent) {

      clickEvent.preventDefault();

      pts.confirmModal(
        "Delete Ticket?",
        "Are you sure you want to delete this ticket record?",
        "Yes, Delete Ticket",
        "danger",
        function() {

          pts.postJSON(
            "/tickets/doDeleteTicket", {
              ticketID: ticketID
            },
            function(responseJSON) {

              if (responseJSON.success) {

                window.location.href = "/tickets";

              }

            }

          );

        }
      );

    });

  }

  /*
   * Location Lookup
   */

  pts.getDefaultConfigProperty("locationClasses", function(locationClassesList) {

    let locationLookupCloseModalFn;
    const locationClassMap = {};
    let locationList = {};

    for (let index = 0; index < locationClassesList.length; index += 1) {

      const locationClassObj = locationClassesList[index];
      locationClassMap[locationClassObj.locationClassKey] = locationClassObj;

    }

    const setLocationFn = function(clickEvent) {

      clickEvent.preventDefault();

      const locationObj = locationList[parseInt(clickEvent.currentTarget.getAttribute("data-index"))];

      document.getElementById("ticket--locationKey").value = locationObj.locationKey;
      document.getElementById("ticket--locationName").value = locationObj.locationName;

      locationLookupCloseModalFn();

      locationList = [];

    };

    const populateLocationsFn = function() {

      pts.postJSON("/offences/doGetAllLocations", {}, function(locationListRes) {

        locationList = locationListRes;

        const listEle = document.createElement("div");
        listEle.className = "list is-hoverable";

        for (let index = 0; index < locationList.length; index += 1) {

          const locationObj = locationList[index];

          const locationClassObj = locationClassMap[locationObj.locationClassKey];

          const linkEle = document.createElement("a");
          linkEle.className = "list-item";
          linkEle.setAttribute("data-index", index);
          linkEle.setAttribute("href", "#");
          linkEle.addEventListener("click", setLocationFn);
          linkEle.innerHTML =
            "<div class=\"level\">" +
            "<div class=\"level-left\">" + pts.escapeHTML(locationObj.locationName) + "</div>" +
            (locationClassObj ?
              "<div class=\"level-right\">" +
              "<span class=\"tag is-primary\">" + pts.escapeHTML(locationClassObj.locationClass) + "</span>" +
              "</div>" :
              "") +
            "</div>";

          listEle.insertAdjacentElement("beforeend", linkEle);

        }

        const containerEle = document.getElementById("container--parkingLocations");
        pts.clearElement(containerEle);
        containerEle.insertAdjacentElement("beforeend", listEle);

      });

    };

    const openLocationLookupModalFn = function(clickEvent) {

      clickEvent.preventDefault();

      pts.openHtmlModal("ticket-setLocation", {
        onshown: function(modalEle, closeModalFn) {

          locationLookupCloseModalFn = closeModalFn;
          populateLocationsFn();

        },
        onremoved: function() {

          document.getElementById("is-location-lookup-button").focus();

        }
      });

    };

    document.getElementById("is-location-lookup-button").addEventListener("click", openLocationLookupModalFn);
    document.getElementById("ticket--locationName").addEventListener("dblclick", openLocationLookupModalFn);

  });

  /*
   * By-law / Offence Lookup
   */

  {

    let bylawLookupCloseModalFn;
    let offenceList = [];

    const setBylawOffenceFn = function(clickEvent) {

      clickEvent.preventDefault();

      const offenceObj = offenceList[parseInt(clickEvent.currentTarget.getAttribute("data-index"))];

      document.getElementById("ticket--bylawNumber").value = offenceObj.bylawNumber;

      const offenceAmountEle = document.getElementById("ticket--offenceAmount");

      offenceAmountEle.classList.add("is-readonly");
      offenceAmountEle.setAttribute("readonly", "readonly");
      offenceAmountEle.closest(".field").getElementsByClassName("is-unlock-field-button")[0].removeAttribute("disabled");
      offenceAmountEle.value = offenceObj.offenceAmount;

      document.getElementById("ticket--parkingOffence").value = offenceObj.bylawDescription;

      bylawLookupCloseModalFn();

      offenceList = [];

    };

    const populateBylawsFn = function() {

      const locationKey = document.getElementById("ticket--locationKey").value;
      const locationName = document.getElementById("ticket--locationName").value;

      pts.postJSON("/offences/doGetOffencesByLocation", {
        locationKey: locationKey
      }, function(offenceListRes) {

        offenceList = offenceListRes;

        const listEle = document.createElement("div");
        listEle.className = "list is-hoverable has-margin-bottom-20";

        for (let index = 0; index < offenceList.length; index += 1) {

          const offenceObj = offenceList[index];

          const linkEle = document.createElement("a");
          linkEle.className = "list-item";
          linkEle.setAttribute("data-index", index);
          linkEle.setAttribute("href", "#");
          linkEle.addEventListener("click", setBylawOffenceFn);
          linkEle.innerHTML =
            "<div class=\"columns\">" +
            ("<div class=\"column\">" +
              pts.escapeHTML(offenceObj.bylawNumber) + "<br />" +
              "<small>" + pts.escapeHTML(offenceObj.bylawDescription) + "</small>" +
              "</div>") +
            ("<div class=\"column is-narrow\">" +
              "$ " + offenceObj.offenceAmount.toFixed(2) +
              "</div>") +
            "</div>";

          listEle.insertAdjacentElement("beforeend", linkEle);

        }

        const containerEle = document.getElementById("container--bylawNumbers");
        pts.clearElement(containerEle);
        containerEle.appendChild(listEle);

      });

    };

    const openBylawLookupModalFn = function(clickEvent) {

      clickEvent.preventDefault();

      pts.openHtmlModal("ticket-setBylawOffence", {
        onshown: function(modalEle, closeModalFn) {

          bylawLookupCloseModalFn = closeModalFn;
          populateBylawsFn();

          document.getElementById("bylawLookup--searchStr").focus();

        },
        onremoved: function() {

          document.getElementById("is-bylaw-lookup-button").focus();

        }
      });

    };

    document.getElementById("is-bylaw-lookup-button").addEventListener("click", openBylawLookupModalFn);
    document.getElementById("ticket--bylawNumber").addEventListener("dblclick", openBylawLookupModalFn);

  }

  /*
   * Licence Plate Province Datalist
   */

  {

    const populateLicencePlateProvinceDatalistFn = function() {

      const datalistEle = document.getElementById("datalist--licencePlateProvince");
      pts.clearElement(datalistEle);

      const countryProperties = pts.getLicencePlateCountryProperties(document.getElementById("ticket--licencePlateCountry").value);

      if (countryProperties && countryProperties.provinces) {

        const provincesList = Object.values(countryProperties.provinces);

        for (let index = 0; index < provincesList.length; index += 1) {

          const optionEle = document.createElement("option");
          optionEle.setAttribute("value", provincesList[index].provinceShortName);
          datalistEle.appendChild(optionEle);

        }

      }

    };

    document.getElementById("ticket--licencePlateCountry")
      .addEventListener("change", populateLicencePlateProvinceDatalistFn);

    pts.loadDefaultConfigProperties(populateLicencePlateProvinceDatalistFn);

  }

  /*
   * Remarks
   */

  const clearPanelFn = function(panelEle) {

    const panelBlockEles = panelEle.getElementsByClassName("panel-block");

    while (panelBlockEles.length > 0) {

      panelBlockEles[0].remove();

    }

  };

  if (!isCreate) {

    const remarkPanelEle = document.getElementById("is-remark-panel");

    let remarkList = pts.ticketRemarksInit;
    delete pts.ticketRemarksInit;

    let getRemarksFn;

    const confirmDeleteRemarkFn = function(clickEvent) {

      const remarkIndex = clickEvent.currentTarget.getAttribute("data-remark-index");

      pts.confirmModal(
        "Delete Remark?",
        "Are you sure you want to delete this remark?",
        "Yes, Delete",
        "warning",
        function() {

          pts.postJSON("/tickets/doDeleteRemark", {
            ticketID: ticketID,
            remarkIndex: remarkIndex
          }, function(resultJSON) {

            if (resultJSON.success) {

              getRemarksFn();

            }

          });

        }
      );

    };

    const openEditRemarkModalFn = function(clickEvent) {

      clickEvent.preventDefault();

      let editRemarkCloseModalFn;

      const index = parseInt(clickEvent.currentTarget.getAttribute("data-index"));

      const remarkObj = remarkList[index];

      const submitFn = function(formEvent) {

        formEvent.preventDefault();

        pts.postJSON("/tickets/doUpdateRemark", formEvent.currentTarget, function(responseJSON) {

          if (responseJSON.success) {

            editRemarkCloseModalFn();
            getRemarksFn();

          }

        });

      };

      pts.openHtmlModal("ticket-editRemark", {

        onshow: function(modalEle) {

          document.getElementById("editRemark--ticketID").value = ticketID;
          document.getElementById("editRemark--remarkIndex").value = remarkObj.remarkIndex;
          document.getElementById("editRemark--remark").value = remarkObj.remark;
          document.getElementById("editRemark--remarkDateString").value = remarkObj.remarkDateString;
          document.getElementById("editRemark--remarkTimeString").value = remarkObj.remarkTimeString;

          modalEle.getElementsByTagName("form")[0].addEventListener("submit", submitFn);

        },
        onshown: function(modalEle, closeModalFn) {

          editRemarkCloseModalFn = closeModalFn;

        }

      });

    };

    const populateRemarksPanelFn = function() {

      clearPanelFn(remarkPanelEle);

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
            pts.escapeHTML(remarkObj.remark) +
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
            "<button class=\"button is-small is-edit-remark-button\" data-tooltip=\"Edit Remark\" data-index=\"" + index + "\" type=\"button\">" +
            "<span class=\"icon is-small\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
            " <span>Edit</span>" +
            "</button>" +
            "<button class=\"button is-small has-text-danger is-delete-remark-button\" data-tooltip=\"Delete Remark\" data-remark-index=\"" + remarkObj.remarkIndex + "\" type=\"button\">" +
            "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
            "<span class=\"sr-only\">Delete</span>" +
            "</button>" +
            "</div>" +
            "</div>" :
            "") +
          "</div>";

        if (remarkObj.canUpdate) {

          panelBlockEle.getElementsByClassName("is-edit-remark-button")[0].addEventListener("click", openEditRemarkModalFn);
          panelBlockEle.getElementsByClassName("is-delete-remark-button")[0].addEventListener("click", confirmDeleteRemarkFn);

        }

        remarkPanelEle.appendChild(panelBlockEle);

      }

    };

    getRemarksFn = function() {

      clearPanelFn(remarkPanelEle);

      remarkPanelEle.insertAdjacentHTML(
        "beforeend",
        "<div class=\"panel-block is-block\">" +
        "<p class=\"has-text-centered has-text-grey-lighter\">" +
        "<i class=\"fas fa-2x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
        "<em>Loading remarks..." +
        "</p>" +
        "</div>"
      );

      pts.postJSON("/tickets/doGetRemarks", {
        ticketID: ticketID
      }, function(resultList) {

        remarkList = resultList;
        populateRemarksPanelFn();

      });

    };

    document.getElementById("is-add-remark-button").addEventListener("click", function(clickEvent) {

      clickEvent.preventDefault();

      let addRemarkCloseModalFn;

      const submitFn = function(formEvent) {

        formEvent.preventDefault();

        pts.postJSON("/tickets/doAddRemark", formEvent.currentTarget, function(responseJSON) {

          if (responseJSON.success) {

            addRemarkCloseModalFn();
            getRemarksFn();

          }

        });

      };

      pts.openHtmlModal("ticket-addRemark", {

        onshow: function(modalEle) {

          document.getElementById("addRemark--ticketID").value = ticketID;
          modalEle.getElementsByTagName("form")[0].addEventListener("submit", submitFn);

        },
        onshown: function(modalEle, closeModalFn) {

          addRemarkCloseModalFn = closeModalFn;

        }

      });

    });

    populateRemarksPanelFn();

  }

  /*
   * Statuses
   */

  if (!isCreate) {

    const statusPanelEle = document.getElementById("is-status-panel");

    let statusList = pts.ticketStatusLogInit;
    delete pts.ticketStatusLogInit;

    let getStatusesFn;

    const confirmResolveTicketFn = function(clickEvent) {

      clickEvent.preventDefault();

      pts.confirmModal(
        "Mark Ticket as Resolved?",
        "Once resolved, you will no longer be able to make changes to the ticket.",
        "Yes, Resolve Ticket",
        "info",
        function() {

          pts.postJSON(
            "/tickets/doResolveTicket", {
              ticketID: ticketID
            },
            function(responseJSON) {

              if (responseJSON.success) {

                window.location.href = "/tickets/" + ticketID;

              }

            }
          );

        }
      );

    };

    const confirmDeleteStatusFn = function(clickEvent) {

      const statusIndex = clickEvent.currentTarget.getAttribute("data-status-index");

      pts.confirmModal(
        "Delete Remark?",
        "Are you sure you want to delete this status?",
        "Yes, Delete",
        "warning",
        function() {

          pts.postJSON("/tickets/doDeleteStatus", {
            ticketID: ticketID,
            statusIndex: statusIndex
          }, function(resultJSON) {

            if (resultJSON.success) {

              getStatusesFn();

            }

          });

        }
      );

    };

    const openEditStatusModalFn = function(clickEvent) {

    };

    const populateStatusesPanelFn = function() {

      clearPanelFn(statusPanelEle);

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

      for (let index = 0; index < statusList.length; index += 1) {

        const statusObj = statusList[index];
        const statusDefinitionObj = pts.getTicketStatus(statusObj.statusKey);


        if (index === 0 && statusDefinitionObj && statusDefinitionObj.isFinalStatus) {

          const finalizePanelBlockEle = document.createElement("div");
          finalizePanelBlockEle.className = "panel-block is-block";

          finalizePanelBlockEle.innerHTML = "<div class=\"message is-info is-clearfix\">" +
            "<div class=\"message-body\">" +

            "<div class=\"columns\">" +

            "<div class=\"column\">" +
            "<strong>This ticket is able to be marked as resolved.</strong>" +
            "</div>" +

            "<div class=\"column is-narrow\">" +
            "<button class=\"button is-info\" type=\"button\">" +
            "<span class=\"icon is-small\"><i class=\"fas fa-check\" aria-hidden=\"true\"></i></span>" +
            "<span>Resolve Ticket</span>" +
            "</button>" +
            "</div>" +

            "</div>" +
            "</div>" +
            "</div>";

          finalizePanelBlockEle.getElementsByTagName("button")[0].addEventListener("click", confirmResolveTicketFn);

          statusPanelEle.appendChild(finalizePanelBlockEle);

        }


        const panelBlockEle = document.createElement("div");
        panelBlockEle.className = "panel-block is-block";


        panelBlockEle.innerHTML = "<div class=\"columns\">" +
          ("<div class=\"column\">" +

            ("<div class=\"level has-margin-bottom-5\">" +
              "<div class=\"level-left\">" +
              "<strong>" + (statusDefinitionObj ? statusDefinitionObj.status : statusObj.statusKey) + "</strong>" +
              "</div>" +
              "<div class=\"level-right\">" + statusObj.statusDateString + "</div>" +
              "</div>") +

            (statusObj.statusField === "" ?
              "" :
              "<p class=\"is-size-7\">" +
              "<strong>" +
              (statusDefinitionObj && statusDefinitionObj.statusField ?
                statusDefinitionObj.statusField.fieldLabel :
                "") +
              ":</strong> " +
              statusObj.statusField +
              "</p>") +

            "<p class=\"is-size-7\">" + statusObj.statusNote + "</p>" +

            "</div>") +

          (statusObj.canUpdate && index === 0 ?
            "<div class=\"column is-narrow\">" +
            "<div class=\"buttons is-right has-addons\">" +
            "<button class=\"button is-small is-edit-status-button\" data-tooltip=\"Edit Status\" data-index=\"" + index + "\" type=\"button\">" +
            "<span class=\"icon is-small\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
            " <span>Edit</span>" +
            "</button>" +
            "<button class=\"button is-small has-text-danger is-delete-status-button\" data-tooltip=\"Delete Status\" data-status-index=\"" + statusObj.statusIndex + "\" type=\"button\">" +
            "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
            "<span class=\"sr-only\">Delete</span>" +
            "</button>" +
            "</div>" +
            "</div>" :
            "") +

          "</div>";

        if (statusObj.canUpdate && index === 0) {

          panelBlockEle.getElementsByClassName("is-edit-status-button")[0].addEventListener("click", openEditStatusModalFn);
          panelBlockEle.getElementsByClassName("is-delete-status-button")[0].addEventListener("click", confirmDeleteStatusFn);

        }

        statusPanelEle.appendChild(panelBlockEle);

      }

    };

    getStatusesFn = function() {

      clearPanelFn(statusPanelEle);

      statusPanelEle.insertAdjacentHTML(
        "beforeend",
        "<div class=\"panel-block is-block\">" +
        "<p class=\"has-text-centered has-text-grey-lighter\">" +
        "<i class=\"fas fa-2x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
        "<em>Loading statuses..." +
        "</p>" +
        "</div>"
      );

      pts.postJSON("/tickets/doGetStatuses", {
        ticketID: ticketID
      }, function(resultList) {

        statusList = resultList;
        populateStatusesPanelFn();

      });

    };

    document.getElementById("is-add-status-button").addEventListener("click", function(clickEvent) {

      clickEvent.preventDefault();

      let addStatusCloseModalFn;

      const submitFn = function(formEvent) {

        formEvent.preventDefault();

        const resolveTicket = document.getElementById("addStatus--resolveTicket").checked;

        pts.postJSON("/tickets/doAddStatus", formEvent.currentTarget, function(responseJSON) {

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

      const statusKeyChangeFn = function(changeEvent) {

        const statusObj = pts.getTicketStatus(changeEvent.currentTarget.value);

        const statusFieldEle = document.getElementById("addStatus--statusField");
        statusFieldEle.value = "";

        if (statusObj && statusObj.statusField) {

          const fieldEle = statusFieldEle.closest(".field");
          fieldEle.getElementsByTagName("label")[0].innerText = statusObj.statusField.fieldLabel;
          fieldEle.classList.remove("is-hidden");

        } else {

          statusFieldEle.closest(".field").classList.add("is-hidden");

        }

        const resolveTicketEle = document.getElementById("addStatus--resolveTicket");
        resolveTicketEle.checked = false;

        if (statusObj && statusObj.isFinalStatus) {

          resolveTicketEle.closest(".field").classList.remove("is-hidden");

        } else {

          resolveTicketEle.closest(".field").classList.add("is-hidden");

        }

      };

      pts.openHtmlModal("ticket-addStatus", {

        onshow: function(modalEle) {

          document.getElementById("addStatus--ticketID").value = ticketID;

          pts.getDefaultConfigProperty("parkingTicketStatuses", function(parkingTicketStatuses) {

            const statusKeyEle = document.getElementById("addStatus--statusKey");

            for (let index = 0; index < parkingTicketStatuses.length; index += 1) {

              const statusObj = parkingTicketStatuses[index];

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
        onshown: function(modalEle, closeModalFn) {

          addStatusCloseModalFn = closeModalFn;

        }

      });

    });

    pts.loadDefaultConfigProperties(populateStatusesPanelFn);

  }

  /*
   * Unlock Buttons
   */

  {

    const unlockFieldFn = function(unlockBtnClickEvent) {

      unlockBtnClickEvent.preventDefault();

      const unlockBtnEle = unlockBtnClickEvent.currentTarget;

      const inputTag = unlockBtnEle.getAttribute("data-unlock");

      const readOnlyEle = unlockBtnEle.closest(".field").getElementsByTagName(inputTag)[0];

      readOnlyEle.removeAttribute("readonly");
      readOnlyEle.classList.remove("is-readonly");

      readOnlyEle.focus();

      unlockBtnEle.setAttribute("disabled", "disabled");

    };

    const unlockBtnEles = document.getElementsByClassName("is-unlock-field-button");

    for (let buttonIndex = 0; buttonIndex < unlockBtnEles.length; buttonIndex += 1) {

      unlockBtnEles[buttonIndex].addEventListener("click", unlockFieldFn);

    }

  }

}());
