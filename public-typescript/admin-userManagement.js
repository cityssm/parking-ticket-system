"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const createUserModalElement = document.querySelector("#is-create-user-modal");
    createUserModalElement.querySelector("form").addEventListener("submit", (formEvent) => {
        formEvent.preventDefault();
        cityssm.postJSON("/admin/doCreateUser", formEvent.currentTarget, (responseJSON) => {
            if (responseJSON.success) {
                window.location.reload();
            }
        });
    });
    document.querySelector("#is-create-user-button").addEventListener("click", () => {
        cityssm.showModal(createUserModalElement);
    });
    let cancelButtonElements = createUserModalElement.querySelectorAll(".is-cancel-button");
    for (const cancelButtonElement of cancelButtonElements) {
        cancelButtonElement.addEventListener("click", cityssm.hideModal);
    }
    const userContainerElement = document.querySelector("#container--users");
    const deleteUserFunction = (clickEvent) => {
        clickEvent.preventDefault();
        const deleteButtonElement = clickEvent.currentTarget;
        const userNameToDelete = deleteButtonElement.getAttribute("data-user-name");
        const trElement = deleteButtonElement.closest("tr");
        const doDeleteFunction = () => {
            cityssm.postJSON("/admin/doDeleteUser", {
                userName: userNameToDelete
            }, (resultJSON) => {
                if (resultJSON.success) {
                    trElement.remove();
                }
            });
        };
        cityssm.confirmModal("Delete User?", `Are you sure you want to delete <em>${userNameToDelete}/em>?<br />`, "Yes, Delete", "warning", doDeleteFunction);
    };
    const deleteUserButtonElements = userContainerElement.querySelectorAll(".is-delete-user-button");
    for (const deleteUserButtonElement of deleteUserButtonElements) {
        deleteUserButtonElement.addEventListener("click", deleteUserFunction);
    }
    const updateUserModalElement = document.querySelector("#is-update-user-modal");
    const updateUserUserNameSpanElements = updateUserModalElement.querySelectorAll(".container--userName");
    pts.initializeTabs(updateUserModalElement.querySelector(".tabs ul"));
    const submitFunction_updateUserSetting = (formEvent) => {
        formEvent.preventDefault();
        const formElement = formEvent.currentTarget;
        cityssm.postJSON("/admin/doUpdateUserProperty", formElement, (responseJSON) => {
            if (responseJSON.success) {
                const inputElement = formElement.querySelector(".input");
                inputElement.classList.add("is-success");
                inputElement.classList.remove("is-danger");
                const submitButtonElement = formElement.querySelector("button");
                submitButtonElement.classList.add("is-success");
                submitButtonElement.classList.remove("is-danger");
            }
        });
    };
    const keyupFunction_markSettingUnsaved = (keyupEvent) => {
        const inputElement = keyupEvent.currentTarget;
        inputElement.classList.add("is-danger");
        inputElement.classList.remove("is-primary");
        inputElement.classList.remove("is-success");
        const submitButtonElement = inputElement.closest(".field").querySelector("button");
        submitButtonElement.classList.add("is-danger");
        submitButtonElement.classList.remove("is-primary");
        submitButtonElement.classList.remove("is-success");
    };
    const clickFunction_updateUser = (clickEvent) => {
        const linkElement = clickEvent.currentTarget;
        const userName = linkElement.getAttribute("data-user-name");
        const firstName = linkElement.getAttribute("data-first-name");
        const lastName = linkElement.getAttribute("data-last-name");
        for (const updateUserUserNameSpanElement of updateUserUserNameSpanElements) {
            updateUserUserNameSpanElement.textContent = userName;
        }
        document.querySelector("#updateUser--userName").value = userName;
        document.querySelector("#updateUser--firstName").value = firstName;
        document.querySelector("#updateUser--lastName").value = lastName;
        const userPropertiesContainerElement = document.querySelector("#container--userProperties");
        cityssm.clearElement(userPropertiesContainerElement);
        cityssm.postJSON("/admin/doGetUserProperties", {
            userName
        }, (userPropertiesJSON) => {
            let propertyIndex = 0;
            for (const propertyName in userPropertiesJSON) {
                if (Object.prototype.hasOwnProperty.call(userPropertiesJSON, propertyName)) {
                    propertyIndex += 1;
                    const propertyValue = userPropertiesJSON[propertyName];
                    const formElement = document.createElement("form");
                    formElement.innerHTML =
                        `<input name="userName" type="hidden" value="${userName}" />
              <input name="propertyName" type="hidden" value="${propertyName}" />
              <div class="columns">
              <div class="column is-4">
                <label class="label" for="userProperties--propertyValue-${propertyIndex.toString()}">
                ${propertyName}
                </label>
                </div>
              <div class="column">
                <div class="field has-addons">
                <div class="control is-expanded">
                <input class="input is-primary" +
                  id="userProperties--propertyValue-${propertyIndex.toString()}"
                  name="propertyValue"
                  type="text"
                  value="${cityssm.escapeHTML(propertyValue)}"
                  placeholder="(Use Default)" />
                </div>
                <div class="control">
                <button class="button is-outlined is-primary" type="submit">Save</button>
                </div>
                </div>
                </div>
              </div>`;
                    formElement.querySelector(".input").addEventListener("keyup", keyupFunction_markSettingUnsaved);
                    formElement.addEventListener("submit", submitFunction_updateUserSetting);
                    userPropertiesContainerElement.append(formElement);
                }
            }
        });
        document.querySelector("#resetPassword--userName").value = userName;
        document.querySelector("#resetPassword--newPassword")
            .closest(".message")
            .setAttribute("hidden", "hidden");
        cityssm.showModal(updateUserModalElement);
    };
    const updateUserButtonElements = userContainerElement.querySelectorAll(".is-update-user-button");
    for (const updateUserButtonElement of updateUserButtonElements) {
        updateUserButtonElement.addEventListener("click", clickFunction_updateUser);
    }
    cancelButtonElements = updateUserModalElement.querySelectorAll(".is-cancel-button");
    for (const cancelButtonElement of cancelButtonElements) {
        cancelButtonElement.addEventListener("click", cityssm.hideModal);
    }
    document.querySelector("#tab--updateUser-name form")
        .addEventListener("submit", (formEvent) => {
        formEvent.preventDefault();
        cityssm.postJSON("/admin/doUpdateUser", formEvent.currentTarget, (responseJSON) => {
            if (responseJSON.success) {
                window.location.reload();
            }
        });
    });
    document.querySelector("#tab--updateUser-password form")
        .addEventListener("submit", (formEvent) => {
        formEvent.preventDefault();
        cityssm.postJSON("/admin/doResetPassword", formEvent.currentTarget, (responseJSON) => {
            if (responseJSON.success) {
                const newPasswordElement = document.querySelector("#resetPassword--newPassword");
                newPasswordElement.textContent = responseJSON.newPassword;
                newPasswordElement.closest(".message").removeAttribute("hidden");
            }
        });
    });
})();
