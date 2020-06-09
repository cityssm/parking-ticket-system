"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    document.getElementById("mtoImport--importFile").addEventListener("change", function (fileChangeEvent) {
        var fileNameEle = document.getElementById("mtoImport--importFileName");
        var messageEle = document.getElementById("mtoImport--importFileMessage");
        var fileInputEle = fileChangeEvent.currentTarget;
        if (fileInputEle.files.length > 0) {
            var fileName = fileInputEle.files[0].name;
            fileNameEle.innerText = fileName;
            if (/^\d+[.]txt$/igm.test(fileName)) {
                cityssm.clearElement(messageEle);
            }
            else {
                messageEle.innerHTML = "<div class=\"tag is-warning\">" +
                    "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
                    "<span>MTO file names are generally a number with a \".txt\" extension.</span>" +
                    "</div>";
            }
        }
    });
    document.getElementById("form--mtoImport").addEventListener("submit", function (formEvent) {
        formEvent.preventDefault();
        var formEle = formEvent.currentTarget;
        var uploadStepItemEle = document.getElementById("step-item--upload");
        uploadStepItemEle.classList.add("is-completed");
        uploadStepItemEle.classList.add("is-success");
        uploadStepItemEle.classList.remove("is-active");
        uploadStepItemEle.getElementsByClassName("icon")[0].innerHTML =
            "<i class=\"fas fa-check\" aria-hidden=\"true\"></i>";
        var updateStepItemEle = document.getElementById("step-item--update");
        updateStepItemEle.classList.add("is-active");
        updateStepItemEle.getElementsByClassName("step-marker")[0].innerHTML = "<span class=\"icon\">" +
            "<i class=\"fas fa-cogs\" aria-hidden=\"true\"></i>" +
            "</span>";
        document.getElementById("step--upload").classList.add("is-hidden");
        document.getElementById("step--update").classList.remove("is-hidden");
        cityssm.postJSON("/plates-ontario/doMTOImportUpload", formEle, function (responseJSON) {
            updateStepItemEle.classList.add("is-completed");
            updateStepItemEle.classList.remove("is-active");
            var resultsMessageEle = document.getElementById("mtoImport--message");
            if (responseJSON.success) {
                updateStepItemEle.classList.add("is-success");
                updateStepItemEle.getElementsByClassName("icon")[0].innerHTML =
                    "<i class=\"fas fa-check\" aria-hidden=\"true\"></i>";
                resultsMessageEle.classList.add("is-success");
                resultsMessageEle.innerHTML = "<div class=\"message-body\">" +
                    "<p><strong>The file was imported successfully.</strong></p>" +
                    "</div>";
            }
            else {
                updateStepItemEle.classList.add("is-danger");
                updateStepItemEle.getElementsByClassName("icon")[0].innerHTML =
                    "<i class=\"fas fa-exclamation\" aria-hidden=\"true\"></i>";
                resultsMessageEle.classList.add("is-danger");
                resultsMessageEle.innerHTML = "<div class=\"message-body\">" +
                    "<p><strong>An error occurred while importing the file.</strong></p>" +
                    "<p>" + cityssm.escapeHTML(responseJSON.message) + "</p>" +
                    "</div>";
            }
            document.getElementById("step-item--results").classList.add("is-active");
            document.getElementById("step--update").classList.add("is-hidden");
            document.getElementById("step--results").classList.remove("is-hidden");
        });
    });
}());
