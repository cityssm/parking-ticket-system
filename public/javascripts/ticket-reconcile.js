"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    pts.initializeToggleHiddenLinks(document.querySelector('main'));
    function acknowledgeError(clickEvent) {
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        buttonElement.setAttribute('disabled', 'disabled');
        const batchId = buttonElement.dataset.batchId;
        const logIndex = buttonElement.dataset.logIndex;
        cityssm.postJSON(`${pts.urlPrefix}/tickets/doAcknowledgeLookupError`, {
            batchId,
            logIndex
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                const tdElement = buttonElement.closest('td');
                cityssm.clearElement(tdElement);
                tdElement.innerHTML = `<span class="tag is-light is-warning">
            <span class="icon is-small"><i class="fas fa-check" aria-hidden="true"></i></span>
            <span>Acknowledged</span>
            </span>`;
            }
            else {
                buttonElement.removeAttribute('disabled');
            }
        });
    }
    const acknowledgeButtonElements = document.querySelectorAll('.is-acknowledge-error-button');
    for (const acknowledgeButtonElement of acknowledgeButtonElements) {
        acknowledgeButtonElement.addEventListener('click', acknowledgeError);
    }
    function clearStatus(clickEvent) {
        clickEvent.preventDefault();
        const anchorElement = clickEvent.currentTarget;
        const optionsTdElement = anchorElement.closest('td');
        const trElement = optionsTdElement.closest('tr');
        function doClear() {
            cityssm.postJSON(`${pts.urlPrefix}/tickets/doDeleteStatus`, {
                ticketId: trElement.dataset.ticketId,
                statusIndex: anchorElement.dataset.statusIndex
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    cityssm.clearElement(optionsTdElement);
                    optionsTdElement.classList.remove('has-width-200');
                    optionsTdElement.innerHTML = `<button class="button is-success is-ownership-match-button" type="button">
                <span class="icon"><i class="fas fa-check" aria-hidden="true"></i></span>
                <span>Match</span>
              </button>
              <button class="button is-danger is-ownership-error-button" type="button">
                <i class="fas fa-times" aria-hidden="true"></i>
                <span class="sr-only">Error</span>
              </button>`;
                    optionsTdElement
                        .querySelector('.is-ownership-match-button')
                        ?.addEventListener('click', markAsMatch);
                    optionsTdElement
                        .querySelector('.is-ownership-error-button')
                        ?.addEventListener('click', markAsError);
                }
            });
        }
        bulmaJS.confirm({
            title: 'Clear Status',
            message: 'Are you sure you want to undo this status?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Remove the Status',
                callbackFunction: doClear
            }
        });
    }
    function markAsMatch(clickEvent) {
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        const optionsTdElement = buttonElement.closest('td');
        const trElement = optionsTdElement.closest('tr');
        function doMatch() {
            buttonElement.setAttribute('disabled', 'disabled');
            const licencePlateCountry = trElement.dataset.licencePlateCountry;
            const licencePlateProvince = trElement.dataset.licencePlateProvince;
            const licencePlateNumber = trElement.dataset.licencePlateNumber;
            const ticketId = trElement.dataset.ticketId;
            const recordDate = trElement.dataset.recordDate;
            cityssm.postJSON(`${pts.urlPrefix}/tickets/doReconcileAsMatch`, {
                licencePlateCountry,
                licencePlateProvince,
                licencePlateNumber,
                ticketId,
                recordDate
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    cityssm.clearElement(optionsTdElement);
                    optionsTdElement.innerHTML = `<div class="tags has-addons">
              <span class="tag is-light is-success">
                <span class="icon is-small"><i class="fas fa-check" aria-hidden="true"></i></span>
                <span>Match</span>
              </span>
              <a class="tag" data-tooltip="Remove Match" data-status-index="${responseJSON.statusIndex.toString()}" data-tooltip="Remove Match" href="#">
                <i class="far fa-trash-alt" aria-hidden="true"></i>
                <span class="sr-only">Remove Match</span>
              </a>
              </div>`;
                    optionsTdElement
                        .querySelector('a')
                        ?.addEventListener('click', clearStatus);
                }
                else {
                    buttonElement.removeAttribute('disabled');
                    bulmaJS.alert({
                        title: 'Record Not Updated',
                        message: responseJSON.message ?? '',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        if ((trElement.dataset.isVehicleMakeMatch ?? '') !== '' &&
            (trElement.dataset.isLicencePlateExpiryDateMatch ?? '') !== '') {
            doMatch();
        }
        else {
            const ticketVehicle = trElement.dataset.ticketVehicle ?? '';
            const ticketExpiryDate = trElement.dataset.ticketExpiryDate ?? '';
            const ownerVehicle = trElement.dataset.ownerVehicle ?? '';
            const ownerExpiryDate = trElement.dataset.ownerExpiryDate ?? '';
            const confirmHTML = `<p class="has-text-centered">
        Are you sure the details on the parking ticket match the details on the ownership record?
        </p>
        <div class="columns mt-1">
        <div class="column has-text-centered">
          <strong>Parking Ticket</strong><br />
          <span class="is-size-4">
          ${cityssm.escapeHTML(ticketVehicle)}
          </span><br />
          <span class="is-size-5">
          ${ticketExpiryDate === ''
                ? '(Not Set)'
                : cityssm.escapeHTML(ticketExpiryDate)}
          </span>
        </div>
        <div class="column has-text-centered">
          <strong>Ownership Record</strong><br />
          <span class="is-size-4">
            ${cityssm.escapeHTML(ownerVehicle)}
          </span><br />
          <span class="is-size-5">
            ${cityssm.escapeHTML(ownerExpiryDate)}
          </span>
        </div>
        </div>`;
            bulmaJS.confirm({
                title: 'Confirm Match',
                message: confirmHTML,
                messageIsHtml: true,
                contextualColorName: 'warning',
                okButton: {
                    text: 'Yes, Confirm Match',
                    callbackFunction: doMatch
                }
            });
        }
    }
    function markAsError(clickEvent) {
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        const optionsTdElement = buttonElement.closest('td');
        const trElement = optionsTdElement.closest('tr');
        function doError() {
            buttonElement.setAttribute('disabled', 'disabled');
            const licencePlateCountry = trElement.dataset.licencePlateCountry;
            const licencePlateProvince = trElement.dataset.licencePlateProvince;
            const licencePlateNumber = trElement.dataset.licencePlateNumber;
            const ticketId = trElement.dataset.ticketId;
            const recordDate = trElement.dataset.recordDate;
            cityssm.postJSON(`${pts.urlPrefix}/tickets/doReconcileAsError`, {
                licencePlateCountry,
                licencePlateProvince,
                licencePlateNumber,
                ticketId,
                recordDate
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    cityssm.clearElement(optionsTdElement);
                    optionsTdElement.innerHTML = `<div class="tags has-addons">
              <span class="tag is-light is-danger">
                <span class="icon is-small"><i class="fas fa-times" aria-hidden="true"></i></span>
                <span>Match Error</span>
              </span>
              <a class="tag" data-tooltip="Remove Match" data-status-index="${responseJSON.statusIndex.toString()}" data-tooltip="Remove Match" href="#">
                <i class="far fa-trash-alt" aria-hidden="true"></i>
                <span class="sr-only">Remove Match</span>
              </a>
              </div>`;
                    optionsTdElement
                        .querySelector('a')
                        ?.addEventListener('click', clearStatus);
                }
                else {
                    buttonElement.removeAttribute('disabled');
                    bulmaJS.alert({
                        title: 'Record Not Updated',
                        message: responseJSON.message ?? '',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        if ((trElement.dataset.isVehicleMakeMatch ?? '') !== '' ||
            (trElement.dataset.isLicencePlateExpiryDateMatch ?? '') !== '') {
            const ticketVehicle = trElement.dataset.ticketVehicle ?? '';
            const ticketExpiryDate = trElement.dataset.ticketExpiryDate ?? '';
            const ownerVehicle = trElement.dataset.ownerVehicle ?? '';
            const ownerExpiryDate = trElement.dataset.ownerExpiryDate ?? '';
            const confirmHTML = `<p class="has-text-centered">
        Are you sure you want to mark an error between the details on the parking ticket and the details on the ownership record?
        </p>
        <div class="columns mt-1">
          <div class="column has-text-centered">
            <strong>Parking Ticket</strong><br />
            <span class="is-size-4">
            ${cityssm.escapeHTML(ticketVehicle)}
            </span><br />
            <span class="is-size-5">
            ${ticketExpiryDate === ''
                ? '(Not Set)'
                : cityssm.escapeHTML(ticketExpiryDate)}
            </span>
          </div>
          <div class="column has-text-centered">
            <strong>Ownership Record</strong><br />
            <span class="is-size-4">
              ${cityssm.escapeHTML(ownerVehicle)}
            </span><br />
            <span class="is-size-5">
              ${cityssm.escapeHTML(ownerExpiryDate)}
            </span>
          </div>
        </div>`;
            bulmaJS.confirm({
                title: 'Confirm Error',
                message: confirmHTML,
                messageIsHtml: true,
                contextualColorName: 'warning',
                okButton: {
                    text: 'Yes, Confirm Error',
                    callbackFunction: doError
                }
            });
        }
        else {
            doError();
        }
    }
    const matchButtonElements = document.querySelectorAll('.is-ownership-match-button');
    for (const matchButtonElement of matchButtonElements) {
        matchButtonElement.addEventListener('click', markAsMatch);
    }
    const errorButtonElements = document.querySelectorAll('.is-ownership-error-button');
    for (const errorButtonElement of errorButtonElements) {
        errorButtonElement.addEventListener('click', markAsError);
    }
    document
        .querySelector('#is-quick-reconcile-matches-button')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        let loadingCloseModalFunction;
        function doReconcile() {
            cityssm.postJSON(`${pts.urlPrefix}/tickets/doQuickReconcileMatches`, {}, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                loadingCloseModalFunction();
                if (responseJSON.success) {
                    bulmaJS.alert({
                        title: 'Quick Reconcile Complete',
                        message: responseJSON.statusRecords.length === 1
                            ? 'One record was successfully reconciled as a match.'
                            : `${responseJSON.statusRecords.length.toString()} records were successfully reconciled as matches.`,
                        contextualColorName: 'success'
                    });
                    for (const statusRecord of responseJSON.statusRecords) {
                        const optionsTdElement = document.querySelector(`#is-options-cell--${statusRecord.ticketId.toString()}`);
                        if (optionsTdElement !== null) {
                            cityssm.clearElement(optionsTdElement);
                            optionsTdElement.innerHTML = `<div class="tags has-addons">
                    <span class="tag is-light is-success">
                      <span class="icon is-small"><i class="fas fa-check" aria-hidden="true"></i></span>
                      <span>Match</span>
                    </span>
                    <a class="tag" data-tooltip="Remove Match" data-status-index="${statusRecord.statusIndex.toString()}" data-tooltip="Remove Match" href="#">
                      <i class="far fa-trash-alt" aria-hidden="true"></i>
                      <span class="sr-only">Remove Match</span>
                    </a>
                    </div>`;
                            optionsTdElement
                                .querySelector('a')
                                ?.addEventListener('click', clearStatus);
                        }
                    }
                }
            });
        }
        function doLoading() {
            cityssm.openHtmlModal('loading', {
                onshown(_modalElement, closeModalFunction) {
                    ;
                    document.querySelector('#is-loading-modal-message').textContent = 'Reconciling matches...';
                    loadingCloseModalFunction = closeModalFunction;
                    doReconcile();
                }
            });
        }
        bulmaJS.confirm({
            title: 'Quick Reconcile Matches',
            message: 'Are you sure you want to mark all parking tickets with matching vehicle makes and plate expiry dates as matched?',
            contextualColorName: 'info',
            okButton: {
                text: 'Yes, Mark All Matches as Matched',
                callbackFunction: doLoading
            }
        });
    });
})();
