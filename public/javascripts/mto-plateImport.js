"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
(_a = document
    .querySelector('#mtoImport--importFile')) === null || _a === void 0 ? void 0 : _a.addEventListener('change', (fileChangeEvent) => {
    var _a;
    const fileNameElement = document.querySelector('#mtoImport--importFileName');
    const messageElement = document.querySelector('#mtoImport--importFileMessage');
    const fileInputElement = fileChangeEvent.currentTarget;
    if (((_a = fileInputElement.files) !== null && _a !== void 0 ? _a : []).length > 0) {
        const fileName = fileInputElement.files[0].name;
        fileNameElement.textContent = fileName;
        if (/^\d+\.txt$/gim.test(fileName)) {
            cityssm.clearElement(messageElement);
        }
        else {
            messageElement.innerHTML = `<div class="tag is-warning">
          <span class="icon"><i class="fas fa-exclamation-triangle" aria-hidden="true"></i></span>
          <span>MTO file names are generally a number with a ".txt" extension.</span>
          </div>`;
        }
    }
});
(_b = document
    .querySelector('#form--mtoImport')) === null || _b === void 0 ? void 0 : _b.addEventListener('submit', (formEvent) => {
    var _a, _b;
    formEvent.preventDefault();
    const formElement = formEvent.currentTarget;
    const uploadStepItemElement = document.querySelector('#step-item--upload');
    uploadStepItemElement.classList.add('is-completed');
    uploadStepItemElement.classList.add('is-success');
    uploadStepItemElement.classList.remove('is-active');
    uploadStepItemElement.querySelector('.icon').innerHTML =
        '<i class="fas fa-check" aria-hidden="true"></i>';
    const updateStepItemElement = document.querySelector('#step-item--update');
    updateStepItemElement.classList.add('is-active');
    updateStepItemElement.querySelector('.step-marker').innerHTML = `<span class="icon">
      <i class="fas fa-cogs" aria-hidden="true"></i>
      </span>`;
    (_a = document.querySelector('#step--upload')) === null || _a === void 0 ? void 0 : _a.classList.add('is-hidden');
    (_b = document.querySelector('#step--update')) === null || _b === void 0 ? void 0 : _b.classList.remove('is-hidden');
    cityssm.postJSON(`${pts.urlPrefix}/plates-ontario/doMTOImportUpload`, formElement, (responseJSON) => {
        var _a, _b, _c, _d;
        updateStepItemElement.classList.add('is-completed');
        updateStepItemElement.classList.remove('is-active');
        const resultsMessageElement = document.querySelector('#mtoImport--message');
        if (responseJSON.success) {
            updateStepItemElement.classList.add('is-success');
            updateStepItemElement.querySelector('.icon').innerHTML =
                '<i class="fas fa-check" aria-hidden="true"></i>';
            resultsMessageElement.classList.add('is-success');
            resultsMessageElement.innerHTML = `<div class="message-body">
            <p><strong>The file was imported successfully.</strong></p>
            </div>`;
        }
        else {
            updateStepItemElement.classList.add('is-danger');
            updateStepItemElement.querySelector('.icon').innerHTML =
                '<i class="fas fa-exclamation" aria-hidden="true"></i>';
            resultsMessageElement.classList.add('is-danger');
            resultsMessageElement.innerHTML = `<div class="message-body">
            <p><strong>An error occurred while importing the file.</strong></p>
            <p>${cityssm.escapeHTML((_a = responseJSON.message) !== null && _a !== void 0 ? _a : '')}</p>
            </div>`;
        }
        (_b = document
            .querySelector('#step-item--results')) === null || _b === void 0 ? void 0 : _b.classList.add('is-active');
        (_c = document.querySelector('#step--update')) === null || _c === void 0 ? void 0 : _c.classList.add('is-hidden');
        (_d = document.querySelector('#step--results')) === null || _d === void 0 ? void 0 : _d.classList.remove('is-hidden');
    });
});
