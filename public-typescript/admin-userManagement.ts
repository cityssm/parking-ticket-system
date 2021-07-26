/* eslint-disable unicorn/filename-case */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { ptsGlobal } from "../types/publicTypes";

declare const cityssm: cityssmGlobal;
declare const pts: ptsGlobal;


(() => {

  /*
   * Create user
   */

  const createUserModalElement = document.querySelector("#is-create-user-modal") as HTMLElement;

  createUserModalElement.querySelector("form").addEventListener("submit", (formEvent) => {

    formEvent.preventDefault();

    cityssm.postJSON(
      "/admin/doCreateUser",
      formEvent.currentTarget,
      (responseJSON: { success: boolean }) => {

        if (responseJSON.success) {
          window.location.reload();
        }
      }
    );
  });

  document.querySelector("#is-create-user-button").addEventListener("click", () => {
    cityssm.showModal(createUserModalElement);
  });

  let cancelButtonElements = createUserModalElement.querySelectorAll(".is-cancel-button");

  for (const cancelButtonElement of cancelButtonElements) {
    cancelButtonElement.addEventListener("click", cityssm.hideModal);
  }

  // Existing users

  const userContainerElement = document.querySelector("#container--users") as HTMLElement;

  /*
   * Delete users
   */

  const deleteUserFunction = (clickEvent: Event) => {

    clickEvent.preventDefault();

    const deleteButtonElement = clickEvent.currentTarget as HTMLButtonElement;

    const userNameToDelete = deleteButtonElement.getAttribute("data-user-name");
    const trElement = deleteButtonElement.closest("tr");

    const doDeleteFunction = () => {

      cityssm.postJSON("/admin/doDeleteUser", {
        userName: userNameToDelete
      }, (resultJSON: { success: boolean }) => {

        if (resultJSON.success) {
          trElement.remove();
        }

      });

    };

    cityssm.confirmModal(
      "Delete User?",
      `Are you sure you want to delete <em>${userNameToDelete}/em>?<br />`,
      "Yes, Delete",
      "warning",
      doDeleteFunction
    );
  };

  const deleteUserButtonElements = userContainerElement.querySelectorAll(".is-delete-user-button");

  for (const deleteUserButtonElement of deleteUserButtonElements) {
    deleteUserButtonElement.addEventListener("click", deleteUserFunction);
  }

  /*
   * Update user
   */

  const updateUserModalElement = document.querySelector("#is-update-user-modal") as HTMLElement;

  const updateUserUserNameSpanElements =
    updateUserModalElement.querySelectorAll(".container--userName") as NodeListOf<HTMLSpanElement>;

  pts.initializeTabs(updateUserModalElement.querySelector(".tabs ul"));

  const submitFunction_updateUserSetting = (formEvent: Event) => {

    formEvent.preventDefault();

    const formElement = formEvent.currentTarget as HTMLFormElement;

    cityssm.postJSON(
      "/admin/doUpdateUserProperty",
      formElement,
      (responseJSON: { success: boolean }) => {

        if (responseJSON.success) {

          const inputElement = formElement.querySelector(".input");

          inputElement.classList.add("is-success");
          inputElement.classList.remove("is-danger");

          const submitButtonElement = formElement.querySelector("button");

          submitButtonElement.classList.add("is-success");
          submitButtonElement.classList.remove("is-danger");
        }
      }
    );
  };

  const keyupFunction_markSettingUnsaved = (keyupEvent: Event) => {

    const inputElement = keyupEvent.currentTarget as HTMLInputElement;

    inputElement.classList.add("is-danger");
    inputElement.classList.remove("is-primary");
    inputElement.classList.remove("is-success");

    const submitButtonElement = inputElement.closest(".field").querySelector("button");

    submitButtonElement.classList.add("is-danger");
    submitButtonElement.classList.remove("is-primary");
    submitButtonElement.classList.remove("is-success");
  };

  const clickFunction_updateUser = (clickEvent: Event) => {

    const linkElement = clickEvent.currentTarget as HTMLAnchorElement;

    const userName = linkElement.getAttribute("data-user-name");
    const firstName = linkElement.getAttribute("data-first-name");
    const lastName = linkElement.getAttribute("data-last-name");

    // Spans

    for (const updateUserUserNameSpanElement of updateUserUserNameSpanElements) {
      updateUserUserNameSpanElement.textContent = userName;
    }

    // Name form

    (document.querySelector("#updateUser--userName") as HTMLInputElement).value = userName;
    (document.querySelector("#updateUser--firstName") as HTMLInputElement).value = firstName;
    (document.querySelector("#updateUser--lastName") as HTMLInputElement).value = lastName;

    // Properties form

    const userPropertiesContainerElement = document.querySelector("#container--userProperties") as HTMLElement;

    cityssm.clearElement(userPropertiesContainerElement);

    cityssm.postJSON(
      "/admin/doGetUserProperties", {
        userName
      },
      (userPropertiesJSON: { [propertyName: string]: string }) => {

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
      }
    );


    // Password form
    (document.querySelector("#resetPassword--userName") as HTMLInputElement).value = userName;

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

  // User name

  document.querySelector("#tab--updateUser-name form")
    .addEventListener("submit", (formEvent) => {

      formEvent.preventDefault();

      cityssm.postJSON(
        "/admin/doUpdateUser",
        formEvent.currentTarget,
        (responseJSON: { success: boolean }) => {

          if (responseJSON.success) {
            window.location.reload();
          }
        }
      );
    });

  // Reset password

  document.querySelector("#tab--updateUser-password form")
    .addEventListener("submit", (formEvent) => {

      formEvent.preventDefault();

      cityssm.postJSON(
        "/admin/doResetPassword",
        formEvent.currentTarget,
        (responseJSON: { success: boolean; newPassword?: string }) => {

          if (responseJSON.success) {

            const newPasswordElement = document.querySelector("#resetPassword--newPassword");

            newPasswordElement.textContent = responseJSON.newPassword;

            newPasswordElement.closest(".message").removeAttribute("hidden");
          }
        }
      );
    });
})();
