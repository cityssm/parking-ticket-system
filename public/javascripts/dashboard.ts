import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;


(() => {

  const changePasswordModalEle = document.getElementById("is-change-password-modal");

  if (changePasswordModalEle) {

    changePasswordModalEle.getElementsByTagName("form")[0].addEventListener("submit", (formEvent) => {

      formEvent.preventDefault();

      const formEle = formEvent.currentTarget;

      cityssm.postJSON(
        "/dashboard/doChangePassword",
        formEle,
        (responseJSON: { success: boolean }) => {

          if (responseJSON.success) {

            cityssm.hideModal(changePasswordModalEle);
            cityssm.alertModal("Password Updated Successfully", "", "OK", "success");
          }
        }
      );
    });


    document.getElementsByClassName("is-change-password-button")[0].addEventListener("click", () => {

      changePasswordModalEle.getElementsByTagName("form")[0].reset();
      cityssm.showModal(changePasswordModalEle);
      document.getElementById("changePassword--oldPassword").focus();

    });

    const toggleVisibilityFn = (buttonEvent: Event) => {

      const inputEle =
        (buttonEvent.currentTarget as HTMLButtonElement).closest(".field").getElementsByClassName("input")[0];

      inputEle.setAttribute(
        "type",
        inputEle.getAttribute("type") === "text" ? "password" : "text"
      );
    };

    const toggleVisibilityButtonEles = changePasswordModalEle.getElementsByClassName("is-toggle-visibility-button");

    for (const toggleVisibilityButtonEle of toggleVisibilityButtonEles) {
      toggleVisibilityButtonEle.addEventListener("click", toggleVisibilityFn);
    }

    const cancelButtonEles = changePasswordModalEle.getElementsByClassName("is-cancel-button");

    for (const cancelButtonEle of cancelButtonEles) {
      cancelButtonEle.addEventListener("click", cityssm.hideModal);
    }
  }

})();
