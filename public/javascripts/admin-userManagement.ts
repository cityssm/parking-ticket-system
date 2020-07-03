import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { ptsGlobal } from "./types";

declare const cityssm: cityssmGlobal;
declare const pts: ptsGlobal;


(() => {

  /*
   * Create user
   */

  const createUserModalEle = document.getElementById("is-create-user-modal");

  createUserModalEle.getElementsByTagName("form")[0].addEventListener("submit", (formEvent) => {

    formEvent.preventDefault();

    cityssm.postJSON(
      "/admin/doCreateUser",
      formEvent.currentTarget,
      (responseJSON: { success: boolean }) => {

        if (responseJSON.success) {
          window.location.reload(true);
        }
      }
    );
  });

  document.getElementById("is-create-user-button").addEventListener("click", () => {
    cityssm.showModal(createUserModalEle);
  });

  let cancelButtonEles = createUserModalEle.getElementsByClassName("is-cancel-button");

  for (const cancelButtonEle of cancelButtonEles) {
    cancelButtonEle.addEventListener("click", cityssm.hideModal);
  }

  // Existing users

  const userContainerEle = document.getElementById("container--users");

  /*
   * Delete users
   */

  const deleteUserFn = (clickEvent: Event) => {

    clickEvent.preventDefault();

    const deleteButtonEle = clickEvent.currentTarget as HTMLButtonElement;

    const userNameToDelete = deleteButtonEle.getAttribute("data-user-name");
    const trEle = deleteButtonEle.closest("tr");

    const doDeleteFn = () => {

      cityssm.postJSON("/admin/doDeleteUser", {
        userName: userNameToDelete
      }, (resultJSON: { success: boolean }) => {

        if (resultJSON.success) {
          trEle.remove();
        }

      });

    };

    cityssm.confirmModal(
      "Delete User?",
      `Are you sure you want to delete <em>${userNameToDelete}/em>?<br />`,
      "Yes, Delete",
      "warning",
      doDeleteFn
    );
  };

  const deleteUserButtonEles = userContainerEle.getElementsByClassName("is-delete-user-button");

  for (const deleteUserButtonEle of deleteUserButtonEles) {
    deleteUserButtonEle.addEventListener("click", deleteUserFn);
  }

  /*
   * Update user
   */

  const updateUserModalEle = document.getElementById("is-update-user-modal");
  const updateUserUserNameSpanEles =
    updateUserModalEle.getElementsByClassName("container--userName") as HTMLCollectionOf<HTMLSpanElement>;

  pts.initializeTabs(updateUserModalEle.getElementsByClassName("tabs")[0].getElementsByTagName("ul")[0]);

  const submitFn_updateUserSetting = (formEvent: Event) => {

    formEvent.preventDefault();

    const formEle = formEvent.currentTarget as HTMLFormElement;

    cityssm.postJSON(
      "/admin/doUpdateUserProperty",
      formEle,
      (responseJSON: { success: boolean }) => {

        if (responseJSON.success) {

          const inputEle = formEle.getElementsByClassName("input")[0];

          inputEle.classList.add("is-success");
          inputEle.classList.remove("is-danger");

          const submitBtnEle = formEle.getElementsByTagName("button")[0];

          submitBtnEle.classList.add("is-success");
          submitBtnEle.classList.remove("is-danger");

        }

      }
    );

  };

  const keyupFn_markSettingUnsaved = (keyupEvent: Event) => {

    const inputEle = keyupEvent.currentTarget as HTMLInputElement;

    inputEle.classList.add("is-danger");
    inputEle.classList.remove("is-primary");
    inputEle.classList.remove("is-success");

    const submitBtnEle = inputEle.closest(".field").getElementsByTagName("button")[0];

    submitBtnEle.classList.add("is-danger");
    submitBtnEle.classList.remove("is-primary");
    submitBtnEle.classList.remove("is-success");

  };

  const clickFn_updateUser = (clickEvent: Event) => {

    const linkEle = clickEvent.currentTarget as HTMLAnchorElement;

    const userName = linkEle.getAttribute("data-user-name");
    const firstName = linkEle.getAttribute("data-first-name");
    const lastName = linkEle.getAttribute("data-last-name");

    // Spans

    for (const updateUserUserNameSpanEle of updateUserUserNameSpanEles) {
      updateUserUserNameSpanEle.innerText = userName;
    }

    // Name form

    (document.getElementById("updateUser--userName") as HTMLInputElement).value = userName;
    (document.getElementById("updateUser--firstName") as HTMLInputElement).value = firstName;
    (document.getElementById("updateUser--lastName") as HTMLInputElement).value = lastName;

    // Properties form

    const userPropertiesContainerEle = document.getElementById("container--userProperties");

    cityssm.clearElement(userPropertiesContainerEle);

    cityssm.postJSON(
      "/admin/doGetUserProperties", {
        userName
      },
      (userPropertiesJSON: { [propertyName: string]: string }) => {

        let propertyIndex = 0;

        for (const propertyName in userPropertiesJSON) {

          if (userPropertiesJSON.hasOwnProperty(propertyName)) {

            propertyIndex += 1;

            const propertyValue = userPropertiesJSON[propertyName];

            const formEle = document.createElement("form");

            formEle.innerHTML =
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

            formEle.getElementsByClassName("input")[0].addEventListener("keyup", keyupFn_markSettingUnsaved);

            formEle.addEventListener("submit", submitFn_updateUserSetting);

            userPropertiesContainerEle.insertAdjacentElement("beforeend", formEle);
          }
        }
      }
    );


    // Password form
    (document.getElementById("resetPassword--userName") as HTMLInputElement).value = userName;

    document.getElementById("resetPassword--newPassword")
      .closest(".message")
      .setAttribute("hidden", "hidden");

    cityssm.showModal(updateUserModalEle);

  };

  const updateUserButtonEles = userContainerEle.getElementsByClassName("is-update-user-button");

  for (const updateUserButtonEle of updateUserButtonEles) {
    updateUserButtonEle.addEventListener("click", clickFn_updateUser);
  }

  cancelButtonEles = updateUserModalEle.getElementsByClassName("is-cancel-button");

  for (const cancelButtonEle of cancelButtonEles) {
    cancelButtonEle.addEventListener("click", cityssm.hideModal);
  }

  // User name

  document.getElementById("tab--updateUser-name").getElementsByTagName("form")[0]
    .addEventListener("submit", (formEvent) => {

      formEvent.preventDefault();

      cityssm.postJSON(
        "/admin/doUpdateUser",
        formEvent.currentTarget,
        (responseJSON: { success: boolean }) => {

          if (responseJSON.success) {
            window.location.reload(true);
          }
        }
      );
    });

  // Reset password

  document.getElementById("tab--updateUser-password").getElementsByTagName("form")[0]
    .addEventListener("submit", (formEvent) => {

      formEvent.preventDefault();

      cityssm.postJSON(
        "/admin/doResetPassword",
        formEvent.currentTarget,
        (responseJSON: { success: boolean; newPassword?: string }) => {

          if (responseJSON.success) {

            const newPasswordEle = document.getElementById("resetPassword--newPassword");

            newPasswordEle.innerText = responseJSON.newPassword;

            newPasswordEle.closest(".message").removeAttribute("hidden");
          }
        }
      );
    });
})();
