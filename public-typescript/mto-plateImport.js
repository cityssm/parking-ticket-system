"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
document.querySelector("#mtoImport--importFile").addEventListener("change", (fileChangeEvent) => {
    const fileNameElement = document.querySelector("#mtoImport--importFileName");
    const messageElement = document.querySelector("#mtoImport--importFileMessage");
    const fileInputElement = fileChangeEvent.currentTarget;
    if (fileInputElement.files.length > 0) {
        const fileName = fileInputElement.files[0].name;
        fileNameElement.textContent = fileName;
        if (/^\d+\.txt$/gim.test(fileName)) {
            cityssm.clearElement(messageElement);
        }
        else {
            messageElement.innerHTML = "<div class=\"tag is-warning\">" +
                "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
                "<span>MTO file names are generally a number with a \".txt\" extension.</span>" +
                "</div>";
        }
    }
});
document.querySelector("#form--mtoImport").addEventListener("submit", (formEvent) => {
    formEvent.preventDefault();
    const formElement = formEvent.currentTarget;
    const uploadStepItemElement = document.querySelector("#step-item--upload");
    uploadStepItemElement.classList.add("is-completed");
    uploadStepItemElement.classList.add("is-success");
    uploadStepItemElement.classList.remove("is-active");
    uploadStepItemElement.querySelector(".icon").innerHTML =
        "<i class=\"fas fa-check\" aria-hidden=\"true\"></i>";
    const updateStepItemElement = document.querySelector("#step-item--update");
    updateStepItemElement.classList.add("is-active");
    updateStepItemElement.querySelector(".step-marker").innerHTML = "<span class=\"icon\">" +
        "<i class=\"fas fa-cogs\" aria-hidden=\"true\"></i>" +
        "</span>";
    document.querySelector("#step--upload").classList.add("is-hidden");
    document.querySelector("#step--update").classList.remove("is-hidden");
    cityssm.postJSON("/plates-ontario/doMTOImportUpload", formElement, (responseJSON) => {
        updateStepItemElement.classList.add("is-completed");
        updateStepItemElement.classList.remove("is-active");
        const resultsMessageElement = document.querySelector("#mtoImport--message");
        if (responseJSON.success) {
            updateStepItemElement.classList.add("is-success");
            updateStepItemElement.querySelector(".icon").innerHTML =
                "<i class=\"fas fa-check\" aria-hidden=\"true\"></i>";
            resultsMessageElement.classList.add("is-success");
            resultsMessageElement.innerHTML = "<div class=\"message-body\">" +
                "<p><strong>The file was imported successfully.</strong></p>" +
                "</div>";
        }
        else {
            updateStepItemElement.classList.add("is-danger");
            updateStepItemElement.querySelector(".icon").innerHTML =
                "<i class=\"fas fa-exclamation\" aria-hidden=\"true\"></i>";
            resultsMessageElement.classList.add("is-danger");
            resultsMessageElement.innerHTML = "<div class=\"message-body\">" +
                "<p><strong>An error occurred while importing the file.</strong></p>" +
                "<p>" + cityssm.escapeHTML(responseJSON.message) + "</p>" +
                "</div>";
        }
        document.querySelector("#step-item--results").classList.add("is-active");
        document.querySelector("#step--update").classList.add("is-hidden");
        document.querySelector("#step--results").classList.remove("is-hidden");
    });
});
