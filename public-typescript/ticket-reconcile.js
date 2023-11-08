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
        cityssm.postJSON('/tickets/doAcknowledgeLookupError', {
            batchId,
            logIndex
        }, (responseJSON) => {
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
        function clearFunction() {
            cityssm.postJSON('/tickets/doDeleteStatus', {
                ticketId: trElement.dataset.ticketId,
                statusIndex: anchorElement.dataset.statusIndex
            }, (responseJSON) => {
                var _a, _b;
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
                    (_a = optionsTdElement
                        .querySelector('.is-ownership-match-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', markAsMatch);
                    (_b = optionsTdElement
                        .querySelector('.is-ownership-error-button')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', markAsError);
                }
            });
        }
        cityssm.confirmModal('Clear Status', 'Are you sure you want to undo this status?', 'Yes, Remove the Status', 'warning', clearFunction);
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
            cityssm.postJSON('/tickets/doReconcileAsMatch', {
                licencePlateCountry,
                licencePlateProvince,
                licencePlateNumber,
                ticketId,
                recordDate
            }, (responseJSON) => {
                var _a, _b;
                if (responseJSON.success) {
                    cityssm.clearElement(optionsTdElement);
                    optionsTdElement.innerHTML =
                        '<div class="tags has-addons">' +
                            ('<span class="tag is-light is-success">' +
                                '<span class="icon is-small"><i class="fas fa-check" aria-hidden="true"></i></span>' +
                                '<span>Match</span>' +
                                '</span>') +
                            '<a class="tag" data-tooltip="Remove Match"' +
                            ' data-status-index="' +
                            responseJSON.statusIndex.toString() +
                            '" data-tooltip="Remove Match" href="#">' +
                            '<i class="far fa-trash-alt" aria-hidden="true"></i>' +
                            '<span class="sr-only">Remove Match</span>' +
                            '</a>' +
                            '</div>';
                    (_a = optionsTdElement
                        .querySelector('a')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', clearStatus);
                }
                else {
                    buttonElement.removeAttribute('disabled');
                    cityssm.alertModal('Record Not Updated', (_b = responseJSON.message) !== null && _b !== void 0 ? _b : '', 'OK', 'danger');
                }
            });
        }
        if (trElement.hasAttribute('data-is-vehicle-make-match') &&
            trElement.hasAttribute('data-is-licence-plate-expiry-date-match')) {
            doMatch();
        }
        else {
            const ticketVehicle = trElement.dataset.ticketVehicle;
            const ticketExpiryDate = trElement.dataset.ticketExpiryDate;
            const ownerVehicle = trElement.dataset.ownerVehicle;
            const ownerExpiryDate = trElement.dataset.ownerExpiryDate;
            cityssm.confirmModal('Confirm Match', '<p class="has-text-centered">' +
                'Are you sure the details on the parking ticket match the details on the ownership record?' +
                '</p>' +
                '<div class="columns mt-1">' +
                ('<div class="column has-text-centered">' +
                    '<strong>Parking Ticket</strong><br />' +
                    '<span class="is-size-4">' +
                    cityssm.escapeHTML(ticketVehicle) +
                    '</span><br />' +
                    '<span class="is-size-5">' +
                    (ticketExpiryDate === ''
                        ? '(Not Set)'
                        : cityssm.escapeHTML(ticketExpiryDate)) +
                    '</span>' +
                    '</div>') +
                ('<div class="column has-text-centered">' +
                    '<strong>Ownership Record</strong><br />' +
                    '<span class="is-size-4">' +
                    cityssm.escapeHTML(ownerVehicle) +
                    '</span><br />' +
                    '<span class="is-size-5">' +
                    cityssm.escapeHTML(ownerExpiryDate) +
                    '</span>' +
                    '</div>') +
                '</div>', 'Yes, Confirm Match', 'warning', doMatch);
        }
    }
    function markAsError(clickEvent) {
        var _a, _b, _c, _d;
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        const optionsTdElement = buttonElement.closest('td');
        const trElement = optionsTdElement.closest('tr');
        const errorFunction = () => {
            buttonElement.setAttribute('disabled', 'disabled');
            const licencePlateCountry = trElement.dataset.licencePlateCountry;
            const licencePlateProvince = trElement.dataset.licencePlateProvince;
            const licencePlateNumber = trElement.dataset.licencePlateNumber;
            const ticketId = trElement.dataset.ticketId;
            const recordDate = trElement.dataset.recordDate;
            cityssm.postJSON('/tickets/doReconcileAsError', {
                licencePlateCountry,
                licencePlateProvince,
                licencePlateNumber,
                ticketId,
                recordDate
            }, (responseJSON) => {
                var _a, _b;
                if (responseJSON.success) {
                    cityssm.clearElement(optionsTdElement);
                    optionsTdElement.innerHTML =
                        '<div class="tags has-addons">' +
                            ('<span class="tag is-light is-danger">' +
                                '<span class="icon is-small"><i class="fas fa-times" aria-hidden="true"></i></span>' +
                                '<span>Match Error</span>' +
                                '</span>') +
                            '<a class="tag" data-tooltip="Remove Match"' +
                            ' data-status-index="' +
                            responseJSON.statusIndex.toString() +
                            '"' +
                            ' data-tooltip="Remove Match" href="#">' +
                            '<i class="far fa-trash-alt" aria-hidden="true"></i>' +
                            '<span class="sr-only">Remove Match</span>' +
                            '</a>' +
                            '</div>';
                    (_a = optionsTdElement
                        .querySelector('a')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', clearStatus);
                }
                else {
                    buttonElement.removeAttribute('disabled');
                    cityssm.alertModal('Record Not Updated', (_b = responseJSON.message) !== null && _b !== void 0 ? _b : '', 'OK', 'danger');
                }
            });
        };
        if (trElement.hasAttribute('data-is-vehicle-make-match') ||
            trElement.hasAttribute('data-is-licence-plate-expiry-date-match')) {
            const ticketVehicle = (_a = trElement.dataset.ticketVehicle) !== null && _a !== void 0 ? _a : '';
            const ticketExpiryDate = (_b = trElement.dataset.ticketExpiryDate) !== null && _b !== void 0 ? _b : '';
            const ownerVehicle = (_c = trElement.dataset.ownerVehicle) !== null && _c !== void 0 ? _c : '';
            const ownerExpiryDate = (_d = trElement.dataset.ownerExpiryDate) !== null && _d !== void 0 ? _d : '';
            cityssm.confirmModal('Confirm Error', '<p class="has-text-centered">' +
                'Are you sure you want to mark an error between the details on the parking ticket' +
                ' and the details on the ownership record?' +
                '</p>' +
                '<div class="columns mt-1">' +
                ('<div class="column has-text-centered">' +
                    '<strong>Parking Ticket</strong><br />' +
                    '<span class="is-size-4">' +
                    cityssm.escapeHTML(ticketVehicle) +
                    '</span><br />' +
                    '<span class="is-size-5">' +
                    (ticketExpiryDate === ''
                        ? '(Not Set)'
                        : cityssm.escapeHTML(ticketExpiryDate)) +
                    '</span>' +
                    '</div>') +
                ('<div class="column has-text-centered">' +
                    '<strong>Ownership Record</strong><br />' +
                    '<span class="is-size-4">' +
                    cityssm.escapeHTML(ownerVehicle) +
                    '</span><br />' +
                    '<span class="is-size-5">' +
                    cityssm.escapeHTML(ownerExpiryDate) +
                    '</span>' +
                    '</div>') +
                '</div>', 'Yes, Confirm Error', 'warning', errorFunction);
        }
        else {
            errorFunction();
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
    const quickReconcilieButtonElement = document.querySelector('#is-quick-reconcile-matches-button');
    if (quickReconcilieButtonElement) {
        quickReconcilieButtonElement.addEventListener('click', (clickEvent) => {
            clickEvent.preventDefault();
            let loadingCloseModalFunction;
            function doReconcile() {
                cityssm.postJSON('/tickets/doQuickReconcileMatches', {}, (responseJSON) => {
                    var _a;
                    loadingCloseModalFunction();
                    if (responseJSON.success) {
                        cityssm.alertModal('Quick Reconcile Complete', responseJSON.statusRecords.length === 1
                            ? 'One record was successfully reconciled as a match.'
                            : responseJSON.statusRecords.length.toString() +
                                ' records were successfully reconciled as matches.', 'OK', 'success');
                        for (const statusRecord of responseJSON.statusRecords) {
                            const optionsTdElement = document.querySelector('#is-options-cell--' + statusRecord.ticketId.toString());
                            if (optionsTdElement) {
                                cityssm.clearElement(optionsTdElement);
                                optionsTdElement.innerHTML =
                                    '<div class="tags has-addons">' +
                                        ('<span class="tag is-light is-success">' +
                                            '<span class="icon is-small"><i class="fas fa-check" aria-hidden="true"></i></span>' +
                                            '<span>Match</span>' +
                                            '</span>') +
                                        '<a class="tag" data-tooltip="Remove Match"' +
                                        ' data-status-index="' +
                                        statusRecord.statusIndex.toString() +
                                        '"' +
                                        ' data-tooltip="Remove Match" href="#">' +
                                        '<i class="far fa-trash-alt" aria-hidden="true"></i>' +
                                        '<span class="sr-only">Remove Match</span>' +
                                        '</a>' +
                                        '</div>';
                                (_a = optionsTdElement
                                    .querySelector('a')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', clearStatus);
                            }
                        }
                    }
                });
            }
            const loadingFunction = () => {
                cityssm.openHtmlModal('loading', {
                    onshown(_modalElement, closeModalFunction) {
                        document.querySelector('#is-loading-modal-message').textContent =
                            'Reconciling matches...';
                        loadingCloseModalFunction = closeModalFunction;
                        doReconcile();
                    }
                });
            };
            cityssm.confirmModal('Quick Reconcile Matches', 'Are you sure you want to mark all parking tickets' +
                ' with matching vehicle makes and plate expiry dates as matched?', 'Yes, Mark All Matches as Matched', 'info', loadingFunction);
        });
    }
})();
