"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var createUserModalEle = document.getElementById("is-create-user-modal");
    createUserModalEle.getElementsByTagName("form")[0].addEventListener("submit", function (formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON("/admin/doCreateUser", formEvent.currentTarget, function (responseJSON) {
            if (responseJSON.success) {
                window.location.reload(true);
            }
        });
    });
    document.getElementById("is-create-user-button").addEventListener("click", function () {
        cityssm.showModal(createUserModalEle);
    });
    var cancelButtonEles = createUserModalEle.getElementsByClassName("is-cancel-button");
    for (var buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
        cancelButtonEles[buttonIndex].addEventListener("click", cityssm.hideModal);
    }
    var userContainerEle = document.getElementById("container--users");
    function deleteUserFn(clickEvent) {
        clickEvent.preventDefault();
        var deleteButtonEle = clickEvent.currentTarget;
        var userNameToDelete = deleteButtonEle.getAttribute("data-user-name");
        var trEle = deleteButtonEle.closest("tr");
        var doDeleteFn = function () {
            cityssm.postJSON("/admin/doDeleteUser", {
                userName: userNameToDelete
            }, function (resultJSON) {
                if (resultJSON.success) {
                    trEle.remove();
                }
            });
        };
        cityssm.confirmModal("Delete User?", "Are you sure you want to delete <em>" + cityssm.escapeHTML(userNameToDelete) + "</em>?<br />", "Yes, Delete", "warning", doDeleteFn);
    }
    var deleteUserButtonEles = userContainerEle.getElementsByClassName("is-delete-user-button");
    for (var buttonIndex = 0; buttonIndex < deleteUserButtonEles.length; buttonIndex += 1) {
        deleteUserButtonEles[buttonIndex].addEventListener("click", deleteUserFn);
    }
    var updateUserModalEle = document.getElementById("is-update-user-modal");
    var updateUserUserNameSpanEles = updateUserModalEle.getElementsByClassName("container--userName");
    pts.initializeTabs(updateUserModalEle.getElementsByClassName("tabs")[0].getElementsByTagName("ul")[0]);
    function submitFn_updateUserSetting(formEvent) {
        formEvent.preventDefault();
        var formEle = formEvent.currentTarget;
        cityssm.postJSON("/admin/doUpdateUserProperty", formEle, function (responseJSON) {
            if (responseJSON.success) {
                var inputEle = formEle.getElementsByClassName("input")[0];
                inputEle.classList.add("is-success");
                inputEle.classList.remove("is-danger");
                var submitBtnEle = formEle.getElementsByTagName("button")[0];
                submitBtnEle.classList.add("is-success");
                submitBtnEle.classList.remove("is-danger");
            }
        });
    }
    function keyupFn_markSettingUnsaved(keyupEvent) {
        var inputEle = keyupEvent.currentTarget;
        inputEle.classList.add("is-danger");
        inputEle.classList.remove("is-primary");
        inputEle.classList.remove("is-success");
        var submitBtnEle = inputEle.closest(".field").getElementsByTagName("button")[0];
        submitBtnEle.classList.add("is-danger");
        submitBtnEle.classList.remove("is-primary");
        submitBtnEle.classList.remove("is-success");
    }
    function clickFn_updateUser(clickEvent) {
        var linkEle = clickEvent.currentTarget;
        var userName = linkEle.getAttribute("data-user-name");
        var firstName = linkEle.getAttribute("data-first-name");
        var lastName = linkEle.getAttribute("data-last-name");
        for (var index = 0; index < updateUserUserNameSpanEles.length; index += 1) {
            updateUserUserNameSpanEles[index].innerText = userName;
        }
        document.getElementById("updateUser--userName").value = userName;
        document.getElementById("updateUser--firstName").value = firstName;
        document.getElementById("updateUser--lastName").value = lastName;
        var userPropertiesContainerEle = document.getElementById("container--userProperties");
        cityssm.clearElement(userPropertiesContainerEle);
        cityssm.postJSON("/admin/doGetUserProperties", {
            userName: userName
        }, function (userPropertiesJSON) {
            var propertyIndex = 0;
            for (var propertyName in userPropertiesJSON) {
                if (userPropertiesJSON.hasOwnProperty(propertyName)) {
                    propertyIndex += 1;
                    var propertyValue = userPropertiesJSON[propertyName];
                    var formEle = document.createElement("form");
                    formEle.innerHTML =
                        "<input name=\"userName\" type=\"hidden\" value=\"" + userName + "\" />" +
                            "<input name=\"propertyName\" type=\"hidden\" value=\"" + propertyName + "\" />" +
                            "<div class=\"columns\">" +
                            ("<div class=\"column is-4\">" +
                                "<label class=\"label\" for=\"userProperties--propertyValue-" + propertyIndex + "\">" +
                                propertyName +
                                "</label>" +
                                "</div>") +
                            ("<div class=\"column\">" +
                                "<div class=\"field has-addons\">" +
                                "<div class=\"control is-expanded\">" +
                                ("<input class=\"input is-primary\"" +
                                    " id=\"userProperties--propertyValue-" + propertyIndex + "\" name=\"propertyValue\"" +
                                    " type=\"text\" value=\"" + cityssm.escapeHTML(propertyValue) + "\"" +
                                    " placeholder=\"(Use Default)\" />") +
                                "</div>" +
                                "<div class=\"control\">" +
                                "<button class=\"button is-outlined is-primary\" type=\"submit\">" +
                                "Save" +
                                "</button>" +
                                "</div>" +
                                "</div>" +
                                "</div>") +
                            "</div>";
                    formEle.getElementsByClassName("input")[0].addEventListener("keyup", keyupFn_markSettingUnsaved);
                    formEle.addEventListener("submit", submitFn_updateUserSetting);
                    userPropertiesContainerEle.insertAdjacentElement("beforeend", formEle);
                }
            }
        });
        document.getElementById("resetPassword--userName").value = userName;
        document.getElementById("resetPassword--newPassword")
            .closest(".message")
            .setAttribute("hidden", "hidden");
        cityssm.showModal(updateUserModalEle);
    }
    var updateUserButtonEles = userContainerEle.getElementsByClassName("is-update-user-button");
    for (var buttonIndex = 0; buttonIndex < updateUserButtonEles.length; buttonIndex += 1) {
        updateUserButtonEles[buttonIndex].addEventListener("click", clickFn_updateUser);
    }
    cancelButtonEles = updateUserModalEle.getElementsByClassName("is-cancel-button");
    for (var buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
        cancelButtonEles[buttonIndex].addEventListener("click", cityssm.hideModal);
    }
    document.getElementById("tab--updateUser-name").getElementsByTagName("form")[0]
        .addEventListener("submit", function (formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON("/admin/doUpdateUser", formEvent.currentTarget, function (responseJSON) {
            if (responseJSON.success) {
                window.location.reload(true);
            }
        });
    });
    document.getElementById("tab--updateUser-password").getElementsByTagName("form")[0]
        .addEventListener("submit", function (formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON("/admin/doResetPassword", formEvent.currentTarget, function (responseJSON) {
            if (responseJSON.success) {
                var newPasswordEle = document.getElementById("resetPassword--newPassword");
                newPasswordEle.innerText = responseJSON.newPassword;
                newPasswordEle.closest(".message").removeAttribute("hidden");
            }
        });
    });
}());
