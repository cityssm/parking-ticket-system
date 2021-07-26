import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;


(() => {

  const changePasswordModalElement = document.querySelector("#is-change-password-modal") as HTMLElement;

  if (changePasswordModalElement) {

    changePasswordModalElement.querySelector("form").addEventListener("submit", (formEvent) => {

      formEvent.preventDefault();

      const formElement = formEvent.currentTarget;

      cityssm.postJSON(
        "/dashboard/doChangePassword",
        formElement,
        (responseJSON: { success: boolean }) => {

          if (responseJSON.success) {

            cityssm.hideModal(changePasswordModalElement);
            cityssm.alertModal("Password Updated Successfully", "", "OK", "success");
          }
        }
      );
    });


    document.querySelector(".is-change-password-button").addEventListener("click", () => {

      changePasswordModalElement.querySelector("form").reset();
      cityssm.showModal(changePasswordModalElement);
      (document.querySelector("#changePassword--oldPassword") as HTMLInputElement).focus();

    });

    const toggleVisibilityFunction = (buttonEvent: Event) => {

      const inputElement =
        (buttonEvent.currentTarget as HTMLButtonElement).closest(".field").querySelector(".input");

      inputElement.setAttribute(
        "type",
        inputElement.getAttribute("type") === "text" ? "password" : "text"
      );
    };

    const toggleVisibilityButtonElements = changePasswordModalElement.querySelectorAll(".is-toggle-visibility-button");

    for (const toggleVisibilityButtonElement of toggleVisibilityButtonElements) {
      toggleVisibilityButtonElement.addEventListener("click", toggleVisibilityFunction);
    }

    const cancelButtonElements = changePasswordModalElement.querySelectorAll(".is-cancel-button");

    for (const cancelButtonElement of cancelButtonElements) {
      cancelButtonElement.addEventListener("click", cityssm.hideModal);
    }
  }
})();
