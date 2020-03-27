"use strict";

(function() {

  document.getElementById("mtoImport--importFile").addEventListener("change", function(fileChangeEvent) {

    const fileNameEle = document.getElementById("mtoImport--importFileName");
    const messageEle = document.getElementById("mtoImport--importFileMessage");

    if (fileChangeEvent.currentTarget.files.length > 0) {

      const fileName = fileChangeEvent.currentTarget.files[0].name

      fileNameEle.innerText = fileName;

      if (/^\d+[.]txt$/igm.test(fileName)) {

        pts.clearElement(messageEle);

      } else {

        messageEle.innerHTML = "<div class=\"tag is-warning\">" +
          "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
          "<span>MTO file names are generally a number with a \".txt\" extension.</span>" +
          "</div>";

      }

    }

  });

  document.getElementById("form--mtoImport").addEventListener("submit", function(formEvent) {

    formEvent.preventDefault();

    const formEle = formEvent.currentTarget;

    const uploadStepItemEle = document.getElementById("step-item--upload");
    uploadStepItemEle.classList.add("is-completed");
    uploadStepItemEle.classList.add("is-success");
    uploadStepItemEle.classList.remove("is-active");
    uploadStepItemEle.getElementsByClassName("icon")[0].innerHTML =
      "<i class=\"fas fa-check\" aria-hidden=\"true\"></i>";

    document.getElementById("step-item--update").classList.add("is-active");

    document.getElementById("step--upload").classList.add("is-hidden");
    document.getElementById("step--update").classList.remove("is-hidden");

    pts.postJSON("/plates/mto_doImportUpload", formEle, function(responseJSON) {

      console.log(responseJSON);

    });

  });

}());
