"use strict";

(function() {

  let clickFn_markAsMatch;
  let clickFn_markAsError;

  function clickFn_clearStatus(clickEvent) {

    clickEvent.preventDefault();

    const anchorEle = clickEvent.currentTarget;

    const optionsTdEle = anchorEle.closest("td");
    const trEle = optionsTdEle.closest("tr");

    const clearFn = function() {

      pts.postJSON(
        "/tickets/doDeleteStatus", {
          ticketID: trEle.getAttribute("data-ticket-id"),
          statusIndex: anchorEle.getAttribute("data-status-index")
        },
        function(responseJSON) {

          if (responseJSON.success) {

            pts.clearElement(optionsTdEle);

            optionsTdEle.classList.remove("has-width-200");

            optionsTdEle.innerHTML = "<button class=\"button is-success is-ownership-match-button\" type=\"button\">" +
              "<span class=\"icon\"><i class=\"fas fa-check\" aria-hidden=\"true\"></i></span>" +
              "<span>Match</span>" +
              "</button>" +
              " <button class=\"button is-danger is-ownership-error-button\" type=\"button\">" +
              "<i class=\"fas fa-times\" aria-hidden=\"true\"></i>" +
              "<span class=\"sr-only\">Error</span>" +
              "</button>";

            optionsTdEle.getElementsByClassName("is-ownership-match-button")[0].addEventListener("click", clickFn_markAsMatch);
            optionsTdEle.getElementsByClassName("is-ownership-error-button")[0].addEventListener("click", clickFn_markAsError);

          }

        }
      );

    };

    pts.confirmModal(
      "Clear Status",
      "Are you sure you want to undo this status?",
      "Yes, Remove the Status",
      "warning",
      clearFn
    );

  }

  clickFn_markAsMatch = function(clickEvent) {

    clickEvent.preventDefault();

    const buttonEle = clickEvent.currentTarget;

    const optionsTdEle = buttonEle.closest("td");
    const trEle = optionsTdEle.closest("tr");

    const matchFn = function() {

      buttonEle.setAttribute("disabled", "disabled");

      const licencePlateCountry = trEle.getAttribute("data-licence-plate-country");
      const licencePlateProvince = trEle.getAttribute("data-licence-plate-province");
      const licencePlateNumber = trEle.getAttribute("data-licence-plate-number");

      const ticketID = trEle.getAttribute("data-ticket-id");
      const recordDate = trEle.getAttribute("data-record-date");

      pts.postJSON("/tickets/doReconcileAsMatch", {
        licencePlateCountry: licencePlateCountry,
        licencePlateProvince: licencePlateProvince,
        licencePlateNumber: licencePlateNumber,
        ticketID: ticketID,
        recordDate: recordDate
      }, function(responseJSON) {

        if (responseJSON.success) {

          pts.clearElement(optionsTdEle);

          optionsTdEle.innerHTML =
            "<div class=\"tags has-addons\">" +
            ("<span class=\"tag is-light is-success\">" +
              "<span class=\"icon is-small\"><i class=\"fas fa-check\" aria-hidden=\"true\"></i></span><span>Match</span>" +
              "</span>") +
            "<a class=\"tag\" data-tooltip=\"Remove Match\" data-status-index=\"" + responseJSON.statusIndex + "\" data-tooltip=\"Remove Match\" href=\"#\">" +
            "<i class=\"far fa-trash-alt\" aria-hidden=\"true\"></i>" +
            "<span class=\"sr-only\">Remove Match</span>" +
            "</a>" +
            "</div>";

          optionsTdEle.getElementsByTagName("a")[0].addEventListener("click", clickFn_clearStatus);

        } else {

          buttonEle.removeAttribute("disabled");

          pts.alertModal(
            "Record Not Updated",
            responseJSON.message,
            "OK",
            "danger"
          );

        }

      });

    };

    if (trEle.hasAttribute("data-is-probable-match")) {

      matchFn();

    } else {

      const ticketVehicle = trEle.getAttribute("data-ticket-vehicle");
      const ownerVehicle = trEle.getAttribute("data-owner-vehicle");

      pts.confirmModal(
        "Confirm Match",
        "<p>Are you sure the details on the parking ticket match the details on the ownership record?</p>" +
        "<div class=\"columns has-margin-top-5\">" +
        ("<div class=\"column has-text-centered\">" +
          "<strong>Parking Ticket</strong><br />" +
          "<span class=\"is-size-4\">" + pts.escapeHTML(ticketVehicle) + "</span>" +
          "</div>") +
        ("<div class=\"column has-text-centered\">" +
          "<strong>Ownership Record</strong><br />" +
          "<span class=\"is-size-4\">" + pts.escapeHTML(ownerVehicle) + "</span>" +
          "</div>") +
        "</div>",
        "Yes, Confirm Match",
        "warning",
        matchFn
      );

    }

  };

  clickFn_markAsError = function(clickEvent) {

    clickEvent.preventDefault();

    const buttonEle = clickEvent.currentTarget;

    const optionsTdEle = buttonEle.closest("td");
    const trEle = optionsTdEle.closest("tr");

    const errorFn = function() {

      buttonEle.setAttribute("disabled", "disabled");

      const licencePlateCountry = trEle.getAttribute("data-licence-plate-country");
      const licencePlateProvince = trEle.getAttribute("data-licence-plate-province");
      const licencePlateNumber = trEle.getAttribute("data-licence-plate-number");

      const ticketID = trEle.getAttribute("data-ticket-id");
      const recordDate = trEle.getAttribute("data-record-date");

      pts.postJSON("/tickets/doReconcileAsError", {
        licencePlateCountry: licencePlateCountry,
        licencePlateProvince: licencePlateProvince,
        licencePlateNumber: licencePlateNumber,
        ticketID: ticketID,
        recordDate: recordDate
      }, function(responseJSON) {

        if (responseJSON.success) {

          pts.clearElement(optionsTdEle);

          optionsTdEle.innerHTML =
            "<div class=\"tags has-addons\">" +
            ("<span class=\"tag is-light is-danger\">" +
              "<span class=\"icon is-small\"><i class=\"fas fa-times\" aria-hidden=\"true\"></i></span><span>Match Error</span>" +
              "</span>") +
            "<a class=\"tag\" data-tooltip=\"Remove Match\" data-status-index=\"" + responseJSON.statusIndex + "\" data-tooltip=\"Remove Match\" href=\"#\">" +
            "<i class=\"far fa-trash-alt\" aria-hidden=\"true\"></i>" +
            "<span class=\"sr-only\">Remove Match</span>" +
            "</a>" +
            "</div>";

          optionsTdEle.getElementsByTagName("a")[0].addEventListener("click", clickFn_clearStatus);

        } else {

          buttonEle.removeAttribute("disabled");

          pts.alertModal(
            "Record Not Updated",
            responseJSON.message,
            "OK",
            "danger"
          );

        }

      });

    };

    if (trEle.hasAttribute("data-is-probable-match")) {

      const ticketVehicle = trEle.getAttribute("data-ticket-vehicle");
      const ownerVehicle = trEle.getAttribute("data-owner-vehicle");

      pts.confirmModal(
        "Confirm Error",
        "<p>Are you sure you want to mark an error between the details on the parking ticket and the details on the ownership record?</p>" +
        "<div class=\"columns has-margin-top-5\">" +
        ("<div class=\"column has-text-centered\">" +
          "<strong>Parking Ticket</strong><br />" +
          "<span class=\"is-size-4\">" + pts.escapeHTML(ticketVehicle) + "</span>" +
          "</div>") +
        ("<div class=\"column has-text-centered\">" +
          "<strong>Ownership Record</strong><br />" +
          "<span class=\"is-size-4\">" + pts.escapeHTML(ownerVehicle) + "</span>" +
          "</div>") +
        "</div>",
        "Yes, Confirm Error",
        "warning",
        errorFn
      );

    } else {

      errorFn();

    }

  };


  const matchButtonEles = document.getElementsByClassName("is-ownership-match-button");

  for (let index = 0; index < matchButtonEles.length; index += 1) {

    matchButtonEles[index].addEventListener("click", clickFn_markAsMatch);

  }

  const errorButtonEles = document.getElementsByClassName("is-ownership-error-button");

  for (let index = 0; index < errorButtonEles.length; index += 1) {

    errorButtonEles[index].addEventListener("click", clickFn_markAsError);

  }

  document.getElementById("is-quick-reconcile-matches-button").addEventListener("click", function(clickEvent) {

    const reconcileFn = function() {

    };

    pts.confirmModal("Quick Reconcile Matches",
      "Are you sure you want to mark all parking tickets with matching vehicle makes as matched?",
      "Yes, Mark All Matches as Matched",
      "info",
      reconcileFn);

  });

}());
