"use strict";

(function() {

  const changePasswordModalEle = document.getElementById("is-change-password-modal");

  if (changePasswordModalEle) {

    changePasswordModalEle.getElementsByTagName("form")[0].addEventListener("submit", function(formEvent) {

      formEvent.preventDefault();

      const formEle = formEvent.currentTarget;

      cityssm.postJSON(
        "/dashboard/doChangePassword",
        formEle,
        function(responseJSON) {

          if (responseJSON.success) {

            cityssm.hideModal(changePasswordModalEle);
            cityssm.alertModal("Password Updated Successfully", "", "OK", "success");

          }

        }
      );

    });


    document.getElementsByClassName("is-change-password-button")[0].addEventListener("click", function() {

      changePasswordModalEle.getElementsByTagName("form")[0].reset();
      cityssm.showModal(changePasswordModalEle);
      document.getElementById("changePassword--oldPassword").focus();

    });

    const toggleVisibilityFn = function(buttonEvent) {

      const inputEle = buttonEvent.currentTarget.closest(".field").getElementsByClassName("input")[0];

      inputEle.setAttribute(
        "type",
        inputEle.getAttribute("type") === "text" ? "password" : "text"
      );

    };

    const toggleVisibilityButtonEles = changePasswordModalEle.getElementsByClassName("is-toggle-visibility-button");

    for (let buttonIndex = 0; buttonIndex < toggleVisibilityButtonEles.length; buttonIndex += 1) {

      toggleVisibilityButtonEles[buttonIndex].addEventListener("click", toggleVisibilityFn);

    }

    const cancelButtonEles = changePasswordModalEle.getElementsByClassName("is-cancel-button");

    for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {

      cancelButtonEles[buttonIndex].addEventListener("click", cityssm.hideModal);

    }

  }

}());
