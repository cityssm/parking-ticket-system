"use strict";

(function() {

  /*
   * Create user
   */

  const createUserModalEle = document.getElementById("is-create-user-modal");

  createUserModalEle.getElementsByTagName("form")[0].addEventListener("submit", function(formEvent) {

    formEvent.preventDefault();

    pts.postJSON(
      "/admin/doCreateUser",
      formEvent.currentTarget,
      function(responseJSON) {

        if (responseJSON.success) {

          window.location.reload(true);

        }

      }
    );

  });

  document.getElementById("is-create-user-button").addEventListener("click", function() {

    pts.showModal(createUserModalEle);

  });

  let cancelButtonEles = createUserModalEle.getElementsByClassName("is-cancel-button");

  for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {

    cancelButtonEles[buttonIndex].addEventListener("click", pts.hideModal);

  }

  // Existing users

  const userContainerEle = document.getElementById("container--users");

  /*
   * Delete users
   */

  function deleteUserFn(clickEvent) {

    clickEvent.preventDefault();

    const userNameToDelete = clickEvent.currentTarget.getAttribute("data-user-name");
    const trEle = clickEvent.currentTarget.closest("tr");

    const doDeleteFn = function() {

      pts.postJSON("/admin/doDeleteUser", {
        userName: userNameToDelete
      }, function(resultJSON) {

        if (resultJSON.success) {

          trEle.remove();

        }

      });

    };

    pts.confirmModal(
      "Delete User?",
      "Are you sure you want to delete <em>" + pts.escapeHTML(userNameToDelete) + "</em>?<br />",
      "Yes, Delete",
      "warning",
      doDeleteFn
    );

  }

  const deleteUserButtonEles = userContainerEle.getElementsByClassName("is-delete-user-button");

  for (let buttonIndex = 0; buttonIndex < deleteUserButtonEles.length; buttonIndex += 1) {

    deleteUserButtonEles[buttonIndex].addEventListener("click", deleteUserFn);

  }

  /*
   * Update user
   */

  const updateUserModalEle = document.getElementById("is-update-user-modal");
  const updateUserUserNameSpanEles = updateUserModalEle.getElementsByClassName("container--userName");

  pts.initializeTabs(updateUserModalEle.getElementsByClassName("tabs")[0].getElementsByTagName("ul")[0]);

  function submitFn_updateUserSetting(formEvent) {

    formEvent.preventDefault();

    const formEle = formEvent.currentTarget;

    pts.postJSON(
      "/admin/doUpdateUserProperty",
      formEle,
      function(responseJSON) {

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

  }

  function keyupFn_markSettingUnsaved(keyupEvent) {

    const inputEle = keyupEvent.currentTarget;

    inputEle.classList.add("is-danger");
    inputEle.classList.remove("is-primary");
    inputEle.classList.remove("is-success");

    const submitBtnEle = inputEle.closest(".field").getElementsByTagName("button")[0];

    submitBtnEle.classList.add("is-danger");
    submitBtnEle.classList.remove("is-primary");
    submitBtnEle.classList.remove("is-success");

  }

  function clickFn_updateUser(clickEvent) {

    const linkEle = clickEvent.currentTarget;

    const userName = linkEle.getAttribute("data-user-name");
    const firstName = linkEle.getAttribute("data-first-name");
    const lastName = linkEle.getAttribute("data-last-name");

    // Spans

    for (let index = 0; index < updateUserUserNameSpanEles.length; index += 1) {

      updateUserUserNameSpanEles[index].innerText = userName;

    }

    // Name form

    document.getElementById("updateUser--userName").value = userName;
    document.getElementById("updateUser--firstName").value = firstName;
    document.getElementById("updateUser--lastName").value = lastName;

    // Properties form

    const userPropertiesContainerEle = document.getElementById("container--userProperties");

    pts.clearElement(userPropertiesContainerEle);

    pts.postJSON(
      "/admin/doGetUserProperties", {
        userName: userName
      },
      function(userPropertiesJSON) {

        let propertyIndex = 0;

        for (const propertyName in userPropertiesJSON) {

          if (userPropertiesJSON.hasOwnProperty(propertyName)) {

            propertyIndex += 1;

            const propertyValue = userPropertiesJSON[propertyName];

            const formEle = document.createElement("form");

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
                  " type=\"text\" value=\"" + pts.escapeHTML(propertyValue) + "\"" +
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

      }
    );


    // Password form
    document.getElementById("resetPassword--userName").value = userName;

    document.getElementById("resetPassword--newPassword")
      .closest(".message")
      .setAttribute("hidden", "hidden");

    pts.showModal(updateUserModalEle);

  }

  const updateUserButtonEles = userContainerEle.getElementsByClassName("is-update-user-button");

  for (let buttonIndex = 0; buttonIndex < updateUserButtonEles.length; buttonIndex += 1) {

    updateUserButtonEles[buttonIndex].addEventListener("click", clickFn_updateUser);

  }

  cancelButtonEles = updateUserModalEle.getElementsByClassName("is-cancel-button");

  for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {

    cancelButtonEles[buttonIndex].addEventListener("click", pts.hideModal);

  }

  // User name

  document.getElementById("tab--updateUser-name").getElementsByTagName("form")[0]
    .addEventListener("submit", function(formEvent) {

      formEvent.preventDefault();

      pts.postJSON(
        "/admin/doUpdateUser",
        formEvent.currentTarget,
        function(responseJSON) {

          if (responseJSON.success) {

            window.location.reload(true);

          }

        }
      );

    });

  // Reset password

  document.getElementById("tab--updateUser-password").getElementsByTagName("form")[0]
    .addEventListener("submit", function(formEvent) {

      formEvent.preventDefault();

      pts.postJSON(
        "/admin/doResetPassword",
        formEvent.currentTarget,
        function(responseJSON) {

          if (responseJSON.success) {

            const newPasswordEle = document.getElementById("resetPassword--newPassword");

            newPasswordEle.innerText = responseJSON.newPassword;

            newPasswordEle.closest(".message").removeAttribute("hidden");

          }

        }
      );

    });

}());
