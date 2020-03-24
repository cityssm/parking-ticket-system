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


pts.dateToString = function(dateObj) {

  return dateObj.getFullYear() + "-" +
    ("0" + (dateObj.getMonth() + 1)).slice(-2) + "-" +
    ("0" + (dateObj.getDate())).slice(-2);

};


// FETCH HELPERS

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


// CONFIG DEFAULTS

(function() {

  let defaultConfigProperties = {};
  let defaultConfigPropertiesIsLoaded = false;

  const loadConfigPropertiesFromStorage = function() {

    try {

      const defaultConfigPropertiesString = window.localStorage.getItem("defaultConfigProperties");

      if (defaultConfigPropertiesString) {

        defaultConfigProperties = JSON.parse(defaultConfigPropertiesString);
        defaultConfigPropertiesIsLoaded = true;

        return true;

      }

    } catch (e) {
      // Ignore
    }

    return false;

  };

  pts.loadDefaultConfigProperties = function(callbackFn) {

    if (defaultConfigPropertiesIsLoaded) {

      callbackFn();
      return;

    }

    if (loadConfigPropertiesFromStorage()) {

      callbackFn();
      return;

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

    if (loadConfigPropertiesFromStorage()) {

      propertyValueCallbackFn(defaultConfigProperties[propertyName]);
      return;

    }

    // Populate local storage

    pts.loadDefaultConfigProperties(function() {

      propertyValueCallbackFn(defaultConfigProperties[propertyName]);

    });

  };

  pts.getLicencePlateCountryProperties = function(originalLicencePlateCountry) {

    if (!defaultConfigPropertiesIsLoaded) {

      return {};

    }

    const licencePlateCountryAlias =
      defaultConfigProperties.licencePlateCountryAliases[originalLicencePlateCountry.toUpperCase()] ||
      originalLicencePlateCountry;

    if (defaultConfigProperties.licencePlateProvinces.hasOwnProperty(licencePlateCountryAlias)) {

      return defaultConfigProperties.licencePlateProvinces[licencePlateCountryAlias];

    }

    return {};

  };

  pts.getLicencePlateLocationProperties =
    function(originalLicencePlateCountry, originalLicencePlateProvince) {

      const licencePlateProvinceDefault = {
        provinceShortName: originalLicencePlateProvince,
        color: "#000",
        backgroundColor: "#fff"
      };

      if (!defaultConfigPropertiesIsLoaded) {

        return {
          licencePlateCountryAlias: originalLicencePlateCountry,
          licencePlateProvinceAlias: originalLicencePlateProvince,
          licencePlateProvince: licencePlateProvinceDefault
        };

      }

      // Get the country alias

      const licencePlateCountryAlias =
        defaultConfigProperties.licencePlateCountryAliases[originalLicencePlateCountry.toUpperCase()] ||
        originalLicencePlateCountry;

      // Get the province alias

      let licencePlateProvinceAlias = originalLicencePlateProvince;

      if (defaultConfigProperties.licencePlateProvinceAliases.hasOwnProperty(licencePlateCountryAlias)) {

        licencePlateProvinceAlias =
          defaultConfigProperties.licencePlateProvinceAliases[licencePlateCountryAlias][originalLicencePlateProvince.toUpperCase()] ||
          originalLicencePlateProvince;

      }

      // Get the province object

      let licencePlateProvince = licencePlateProvinceDefault;

      if (defaultConfigProperties.licencePlateProvinces.hasOwnProperty(licencePlateCountryAlias)) {

        licencePlateProvince =
          defaultConfigProperties.licencePlateProvinces[licencePlateCountryAlias].provinces[licencePlateProvinceAlias] || licencePlateProvinceDefault;

      }

      // Return

      return {
        licencePlateCountryAlias: licencePlateCountryAlias,
        licencePlateProvinceAlias: licencePlateProvinceAlias,
        licencePlateProvince: licencePlateProvince
      };

    };

  const ticketStatusKeyToObject = new Map();
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
        ticketStatusKeyToObject.set(ticketStatusObj.statusKey, ticketStatusObj);

      }

      ticketStatusKeyToObjectIsLoaded = true;

    }

    return ticketStatusKeyToObject.has(statusKey) ? ticketStatusKeyToObject.get(statusKey) : noResult;

  };

}());


// TABS

pts.initializeTabs = function(tabsListEle, callbackFns) {

  if (!tabsListEle) {

    return;

  }

  const isPanelOrMenuListTabs =
    tabsListEle.classList.contains("panel-tabs") || tabsListEle.classList.contains("menu-list");


  const listItemEles = tabsListEle.getElementsByTagName(isPanelOrMenuListTabs ? "a" : "li");
  const tabLinkEles = (isPanelOrMenuListTabs ? listItemEles : tabsListEle.getElementsByTagName("a"));

  function tabClickFn(clickEvent) {

    clickEvent.preventDefault();

    const tabLinkEle = clickEvent.currentTarget;
    const tabContentEle = document.getElementById(tabLinkEle.getAttribute("href").substring(1));

    for (let index = 0; index < listItemEles.length; index += 1) {

      listItemEles[index].classList.remove("is-active");
      tabLinkEles[index].setAttribute("aria-selected", "false");

    }

    // Add is-active to the selected tab
    (isPanelOrMenuListTabs ? tabLinkEle : tabLinkEle.parentNode).classList.add("is-active");
    tabLinkEle.setAttribute("aria-selected", "true");

    const tabContentEles = tabContentEle.parentNode.getElementsByClassName("tab-content");

    for (let index = 0; index < tabContentEles.length; index += 1) {

      tabContentEles[index].classList.remove("is-active");

    }

    tabContentEle.classList.add("is-active");

    if (callbackFns && callbackFns.onshown) {

      callbackFns.onshown(tabContentEle);

    }

  }

  for (let index = 0; index < listItemEles.length; index += 1) {

    (isPanelOrMenuListTabs ?
      listItemEles[index] :
      listItemEles[index].getElementsByTagName("a")[0]).addEventListener("click", tabClickFn);

  }

};


// MODAL TOGGLES

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


// ALERT / CONFIRM MODALS

(function() {

  function confirmModalFn(modalOptions) {

    const modalEle = document.createElement("div");
    modalEle.className = "modal is-active";

    const contextualColorName = modalOptions.contextualColorName || "info";

    const titleString = modalOptions.titleString || "";
    const bodyHTML = modalOptions.bodyHTML || "";

    const cancelButtonHTML = modalOptions.cancelButtomHTML || "Cancel";
    const okButtonHTML = modalOptions.okButtonHTML || "OK";

    modalEle.innerHTML = "<div class=\"modal-background\"></div>" +
      "<div class=\"modal-content\">" +
      "<div class=\"message is-" + contextualColorName + "\">" +

      ("<header class=\"message-header\">" +
        "<span class=\"is-size-5\"></span>" +
        "</header>") +

      ("<section class=\"message-body\">" +
        (bodyHTML === "" ? "" : "<div class=\"has-margin-bottom-10\">" + bodyHTML + "</div>") +

        ("<div class=\"buttons justify-flex-end\">" +
          (modalOptions.hideCancelButton ?
            "" :
            "<button class=\"button is-cancel-button\" type=\"button\" aria-label=\"Cancel\">" +
            cancelButtonHTML +
            "</button>") +
          ("<button class=\"button is-ok-button is-" + contextualColorName + "\" type=\"button\" aria-label=\"OK\">" +
            okButtonHTML +
            "</button>") +
          "</div>") +

        "</section>") +

      "</div>" +
      "</div>";

    modalEle.getElementsByClassName("message-header")[0].getElementsByTagName("span")[0].innerText = titleString;

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

}());


// NAV BLOCKER

(function() {

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

}());


// SIDE MENU INIT

(function() {

  const collapseButtonEle = document.getElementById("is-sidemenu-collapse-button");
  const collapseSidemenuEle = document.getElementById("is-sidemenu-collapsed");

  const expandButtonEle = document.getElementById("is-sidemenu-expand-button");
  const expandSidemenuEle = document.getElementById("is-sidemenu-expanded");

  if (collapseButtonEle && collapseSidemenuEle && expandButtonEle && expandSidemenuEle) {

    collapseButtonEle.addEventListener("click", function() {

      expandSidemenuEle.classList.add("is-hidden");
      collapseSidemenuEle.classList.remove("is-hidden");

    });

    expandButtonEle.addEventListener("click", function() {

      collapseSidemenuEle.classList.add("is-hidden");
      expandSidemenuEle.classList.remove("is-hidden");

    });

  }

}());

(function() {

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
