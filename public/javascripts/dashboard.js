"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var changePasswordModalEle = document.getElementById("is-change-password-modal");
    if (changePasswordModalEle) {
        changePasswordModalEle.getElementsByTagName("form")[0].addEventListener("submit", function (formEvent) {
            formEvent.preventDefault();
            var formEle = formEvent.currentTarget;
            cityssm.postJSON("/dashboard/doChangePassword", formEle, function (responseJSON) {
                if (responseJSON.success) {
                    cityssm.hideModal(changePasswordModalEle);
                    cityssm.alertModal("Password Updated Successfully", "", "OK", "success");
                }
            });
        });
        document.getElementsByClassName("is-change-password-button")[0].addEventListener("click", function () {
            changePasswordModalEle.getElementsByTagName("form")[0].reset();
            cityssm.showModal(changePasswordModalEle);
            document.getElementById("changePassword--oldPassword").focus();
        });
        var toggleVisibilityFn = function (buttonEvent) {
            var inputEle = buttonEvent.currentTarget.closest(".field").getElementsByClassName("input")[0];
            inputEle.setAttribute("type", inputEle.getAttribute("type") === "text" ? "password" : "text");
        };
        var toggleVisibilityButtonEles = changePasswordModalEle.getElementsByClassName("is-toggle-visibility-button");
        for (var buttonIndex = 0; buttonIndex < toggleVisibilityButtonEles.length; buttonIndex += 1) {
            toggleVisibilityButtonEles[buttonIndex].addEventListener("click", toggleVisibilityFn);
        }
        var cancelButtonEles = changePasswordModalEle.getElementsByClassName("is-cancel-button");
        for (var buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
            cancelButtonEles[buttonIndex].addEventListener("click", cityssm.hideModal);
        }
    }
}());
