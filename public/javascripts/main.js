"use strict";

window.pts = {};


/*
 * HELPERS
 */


/**
 * Clears the content of an element.
 *
 * @param {HTMLElement} ele Element to clear
 */
pts.clearElement = function(ele) {

  while (ele.firstChild) {

    ele.removeChild(ele.firstChild);

  }

};


/**
 * Escapes a potentially unsafe string.
 *
 * @param  {string} str A string potentially containing characters unsafe for writing on a webpage.
 * @returns {string}    A string with unsafe characters escaped.
 */
pts.escapeHTML = function(str) {

  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

};


/*
 * FETCH HELPERS
 */

pts.responseToJSON = function(response) {

  return response.json();

};

/**
 * @param {string} fetchUrl
 * @param {Element | Object} formEleOrObj
 * @param {function} responseFn
 */
pts.postJSON = function(fetchUrl, formEleOrObj, responseFn) {

  const fetchOptions = {
    method: "POST",
    credentials: "include"
  };


  if (formEleOrObj) {

    if (formEleOrObj.tagName && formEleOrObj.tagName === "FORM") {

      fetchOptions.body = new URLSearchParams(new FormData(formEleOrObj));

    } else if (formEleOrObj.constructor === Object) {

      fetchOptions.headers = {
        "Content-Type": "application/json"
      };

      fetchOptions.body = JSON.stringify(formEleOrObj);

    }

  }


  window.fetch(fetchUrl, fetchOptions)
    .then(pts.responseToJSON)
    .then(responseFn);

};


/*
 * CONFIG DEFAULTS
 */


(function() {

  let defaultConfigProperties = {};
  let defaultConfigPropertiesIsLoaded = false;

  pts.loadDefaultConfigProperties = function(callbackFn) {

    if (defaultConfigPropertiesIsLoaded) {

      callbackFn();

    }

    pts.postJSON(
      "/dashboard/doGetDefaultConfigProperties", {},
      function(defaultConfigPropertiesResult) {

        defaultConfigProperties = defaultConfigPropertiesResult;
        defaultConfigPropertiesIsLoaded = true;

        try {

          window.localStorage.setItem("defaultConfigProperties", JSON.stringify(defaultConfigProperties));

        } catch (e) {
          // Ignore
        }

        callbackFn();

      }
    );

  };

  pts.getDefaultConfigProperty = function(propertyName, propertyValueCallbackFn) {

    // Check memory

    if (defaultConfigPropertiesIsLoaded) {

      propertyValueCallbackFn(defaultConfigProperties[propertyName]);
      return;

    }

    // Check local storage

    try {

      const defaultConfigPropertiesString = window.localStorage.getItem("defaultConfigProperties");

      if (defaultConfigPropertiesString) {

        defaultConfigProperties = JSON.parse(defaultConfigPropertiesString);
        defaultConfigPropertiesIsLoaded = true;

        propertyValueCallbackFn(defaultConfigProperties[propertyName]);

        return;

      }

    } catch (e) {
      // Ignore
    }

    // Populate local storage

    pts.loadDefaultConfigProperties(function() {

      propertyValueCallbackFn(defaultConfigProperties[propertyName]);

    });

  };


  pts.getLicencePlateLocationProperties =
    function(originalLicencePlateCountry, originalLicencePlateProvince) {

      if (!defaultConfigPropertiesIsLoaded) {

        return {
          licencePlateCountryAlias: originalLicencePlateCountry,
          licencePlateProvinceAlias: originalLicencePlateProvince,
          licencePlateProvince: {
            color: "#000",
            backgroundColor: "#fff"
          }
        };

      }

      // Get the country alias

      const licencePlateCountryAlias =
        defaultConfigProperties.licencePlateCountryAliases[originalLicencePlateCountry] ||
        originalLicencePlateCountry;

      // Get the province alias

      let licencePlateProvinceAlias = originalLicencePlateProvince;

      if (defaultConfigProperties.licencePlateProvinceAliases.hasOwnProperty(licencePlateCountryAlias)) {

        licencePlateProvinceAlias =
          defaultConfigProperties.licencePlateProvinceAliases[licencePlateCountryAlias][originalLicencePlateProvince] ||
          originalLicencePlateProvince;

      }

      // Get the province object

      let licencePlateProvince = {
        color: "#000",
        backgroundColor: "#fff"
      };

      if (defaultConfigProperties.licencePlateProvinces.hasOwnProperty(licencePlateCountryAlias)) {

        licencePlateProvince =
          defaultConfigProperties.licencePlateProvinces[licencePlateCountryAlias][licencePlateProvinceAlias] || {
            color: "#000",
            backgroundColor: "#fff"
          };

      }

      // Return

      return {
        licencePlateCountryAlias: licencePlateCountryAlias,
        licencePlateProvinceAlias: licencePlateProvinceAlias,
        licencePlateProvince: licencePlateProvince
      };

    };

  const ticketStatusKeyToObject = {};
  let ticketStatusKeyToObjectIsLoaded = false;

  pts.getTicketStatus = function(statusKey) {

    const noResult = {
      statusKey: statusKey,
      status: statusKey
    };

    if (!defaultConfigPropertiesIsLoaded) {

      return noResult;

    }

    if (!ticketStatusKeyToObjectIsLoaded) {

      for (let index = 0; index < defaultConfigProperties.parkingTicketStatuses.length; index += 1) {

        const ticketStatusObj = defaultConfigProperties.parkingTicketStatuses[index];
        ticketStatusKeyToObject[ticketStatusObj.statusKey] = ticketStatusObj;

      }

      ticketStatusKeyToObjectIsLoaded = true;

    }

    return ticketStatusKeyToObject[statusKey] || noResult;

  };

}());


/*
 * MODAL TOGGLES
 */

pts.showModal = function(modalEle) {

  modalEle.classList.add("is-active");

};

pts.hideModal = function(internalEle_or_internalEvent) {

  const internalEle = internalEle_or_internalEvent.currentTarget || internalEle_or_internalEvent;

  const modalEle = (internalEle.classList.contains("modal") ? internalEle : internalEle.closest(".modal"));

  modalEle.classList.remove("is-active");

};

pts.openHtmlModal = function(htmlFileName, callbackFns) {

  // eslint-disable-next-line capitalized-comments
  /*
   * callbackFns
   *
   * - onshow(modalEle)
   *     loaded, part of DOM, not yet visible
   * - onshown(modalEle, closeModalFn)
   *     use closeModalFn() to close the modal properly when not using the close buttons
   * - onhide(modalEle)
   *     return false to cancel hide
   * - onhidden(modalEle)
   *     hidden, but still part of the DOM
   * - onremoved()
   *     no longer part of the DOM
   */

  window.fetch("/html/" + htmlFileName + ".html")
    .then(function(response) {

      return response.text();

    })
    .then(function(modalHTML) {

      // Append the modal to the end of the body

      const modalContainerEle = document.createElement("div");
      modalContainerEle.innerHTML = modalHTML;

      const modalEle = modalContainerEle.getElementsByClassName("modal")[0];

      document.body.insertAdjacentElement("beforeend", modalContainerEle);

      // Call onshow()

      if (callbackFns && callbackFns.onshow) {

        callbackFns.onshow(modalEle);

      }

      // Show the modal

      modalEle.classList.add("is-active");

      const closeModalFn = function() {

        const modalWasShown = modalEle.classList.contains("is-active");

        if (callbackFns && callbackFns.onhide && modalWasShown) {

          const doHide = callbackFns.onhide(modalEle);

          if (doHide) {

            return;

          }

        }

        modalEle.classList.remove("is-active");

        if (callbackFns && callbackFns.onhidden && modalWasShown) {

          callbackFns.onhidden(modalEle);

        }

        modalContainerEle.remove();

        if (callbackFns && callbackFns.onremoved) {

          callbackFns.onremoved();

        }

      };

      // Call onshown()

      if (callbackFns && callbackFns.onshown) {

        callbackFns.onshown(modalEle, closeModalFn);

      }

      // Set up close buttons

      const closeModalBtnEles = modalEle.getElementsByClassName("is-close-modal-button");

      for (let btnIndex = 0; btnIndex < closeModalBtnEles.length; btnIndex += 1) {

        closeModalBtnEles[btnIndex].addEventListener("click", closeModalFn);

      }

    });

};


(function() {


  /*
   * CONFIRM MODAL
   */

  function confirmModalFn(modalOptions) {

    const modalEle = document.createElement("div");
    modalEle.className = "modal is-active";

    const contextualColorName = modalOptions.contextualColorName || "info";

    const titleString = modalOptions.titleString || "";
    const bodyHTML = modalOptions.bodyHTML || "";

    const cancelButtonHTML = modalOptions.cancelButtomHTML || "Cancel";
    const okButtonHTML = modalOptions.okButtonHTML || "OK";

    const contextualColorIsDark = !(contextualColorName === "warning");

    modalEle.innerHTML = "<div class=\"modal-background\"></div>" +
      "<div class=\"modal-card\">" +
      ("<header class=\"modal-card-head has-background-" + contextualColorName + "\">" +
        "<h3 class=\"modal-card-title" + (contextualColorIsDark ? " has-text-white" : "") + "\"></h3>" +
        "</header>") +
      (bodyHTML === "" ?
        "" :
        "<section class=\"modal-card-body\">" + bodyHTML + "</section>") +
      ("<footer class=\"modal-card-foot justify-flex-end\">" +
        (modalOptions.hideCancelButton ?
          "" :
          "<button class=\"button is-cancel-button\" type=\"button\" aria-label=\"Cancel\">" +
          cancelButtonHTML +
          "</button>") +
        ("<button class=\"button is-ok-button is-" + contextualColorName + "\" type=\"button\" aria-label=\"OK\">" +
          okButtonHTML +
          "</button>") +
        "</footer>") +
      "</div>";

    modalEle.getElementsByClassName("modal-card-title")[0].innerText = titleString;

    if (!modalOptions.hideCancelButton) {

      modalEle.getElementsByClassName("is-cancel-button")[0].addEventListener("click", function() {

        modalEle.remove();

      });

    }

    const okButtonEle = modalEle.getElementsByClassName("is-ok-button")[0];
    okButtonEle.addEventListener("click", function() {

      modalEle.remove();
      if (modalOptions.callbackFn) {

        modalOptions.callbackFn();

      }

    });

    document.body.insertAdjacentElement("beforeend", modalEle);

    okButtonEle.focus();

  }

  pts.confirmModal = function(titleString, bodyHTML, okButtonHTML, contextualColorName, callbackFn) {

    confirmModalFn({
      contextualColorName: contextualColorName,
      titleString: titleString,
      bodyHTML: bodyHTML,
      okButtonHTML: okButtonHTML,
      callbackFn: callbackFn
    });

  };

  pts.alertModal = function(titleString, bodyHTML, okButtonHTML, contextualColorName) {

    confirmModalFn({
      contextualColorName: contextualColorName,
      titleString: titleString,
      bodyHTML: bodyHTML,
      hideCancelButton: true,
      okButtonHTML: okButtonHTML
    });

  };


  /*
   * NAV BLOCKER
   */

  let isNavBlockerEnabled = false;

  function navBlockerEventFn(e) {

    const confirmationMessage = "You have unsaved changes that may be lost.";
    e.returnValue = confirmationMessage;
    return confirmationMessage;

  }

  pts.enableNavBlocker = function() {

    if (!isNavBlockerEnabled) {

      window.addEventListener("beforeunload", navBlockerEventFn);
      isNavBlockerEnabled = true;

    }

  };

  pts.disableNavBlocker = function() {

    if (isNavBlockerEnabled) {

      window.removeEventListener("beforeunload", navBlockerEventFn);
      isNavBlockerEnabled = false;

    }

  };


  /*
   * NAVBAR TOGGLE
   */

  document.getElementById("navbar-burger--main").addEventListener("click", function(clickEvent) {

    clickEvent.currentTarget.classList.toggle("is-active");
    document.getElementById("navbar-menu--main").classList.toggle("is-active");

  });


  /*
   * LOGOUT MODAL
   */


  function openLogoutModal(clickEvent) {

    clickEvent.preventDefault();
    pts.confirmModal(
      "Log Out?",
      "<p>Are you sure you want to log out?</p>",
      "<span class=\"icon\"><i class=\"fas fa-sign-out-alt\" aria-hidden=\"true\"></i></span><span>Log Out</span>",
      "warning",
      function() {

        window.localStorage.clear();
        window.location.href = "/logout";

      }
    );

  }


  const logoutBtnEles = document.getElementsByClassName("is-logout-button");

  for (let logoutBtnIndex = 0; logoutBtnIndex < logoutBtnEles.length; logoutBtnIndex += 1) {

    logoutBtnEles[logoutBtnIndex].addEventListener("click", openLogoutModal);

  }

}());
