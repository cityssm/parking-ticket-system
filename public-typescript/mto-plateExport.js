"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a, _b, _c;
    const canUpdate = ((_a = document.querySelector('main')) === null || _a === void 0 ? void 0 : _a.dataset.canUpdate) === 'true';
    let batchId = -1;
    let batchIsLocked = true;
    let batchIncludesLabels = false;
    let batchIsSent = false;
    const availableIssueDaysAgoElement = document.querySelector('#available--issueDaysAgo');
    const availableTicketsContainerElement = document.querySelector('#is-available-tickets-container');
    const licencePlateNumberFilterElement = document.querySelector('#available--licencePlateNumber');
    let availableTicketsList = [];
    let batchEntriesList = [];
    function addParkingTicketToBatch(clickEvent) {
        var _a;
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        buttonElement.setAttribute('disabled', 'disabled');
        const recordIndex = Number.parseInt((_a = buttonElement.dataset.index) !== null && _a !== void 0 ? _a : '-1', 10);
        const ticketRecord = availableTicketsList[recordIndex];
        const ticketContainerElement = buttonElement.closest('.is-ticket-container');
        cityssm.postJSON('/plates/doAddLicencePlateToLookupBatch', {
            batchId,
            licencePlateCountry: 'CA',
            licencePlateProvince: 'ON',
            licencePlateNumber: ticketRecord.licencePlateNumber,
            ticketId: ticketRecord.ticketId
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                ticketContainerElement.remove();
                availableTicketsList[recordIndex] = undefined;
                populateBatchView(responseJSON.batch);
            }
            else {
                buttonElement.removeAttribute('disabled');
            }
        });
    }
    function removeParkingTicketFromBatch(clickEvent) {
        var _a;
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        buttonElement.setAttribute('disabled', 'disabled');
        const recordIndex = Number.parseInt((_a = buttonElement.dataset.index) !== null && _a !== void 0 ? _a : '-1', 10);
        const batchEntry = batchEntriesList[recordIndex];
        const entryContainerElement = buttonElement.closest('.is-entry-container');
        cityssm.postJSON('/plates/doRemoveLicencePlateFromLookupBatch', {
            batchId,
            ticketId: batchEntry.ticketId,
            licencePlateCountry: 'CA',
            licencePlateProvince: 'ON',
            licencePlateNumber: batchEntry.licencePlateNumber
        }, (responseJSON) => {
            if (responseJSON.success) {
                entryContainerElement.remove();
                refreshAvailableTickets();
            }
            else {
                buttonElement.removeAttribute('disabled');
            }
        });
    }
    function clearBatch(clickEvent) {
        clickEvent.preventDefault();
        function clearFunction() {
            cityssm.postJSON('/plates/doClearLookupBatch', {
                batchId
            }, (responseJSON) => {
                if (responseJSON.success) {
                    populateBatchView(responseJSON.batch);
                    refreshAvailableTickets();
                }
            });
        }
        cityssm.confirmModal('Clear Batch?', 'Are you sure you want to remove all licence plates from the batch?', 'Yes, Clear the Batch', 'warning', clearFunction);
    }
    function downloadBatch(clickEvent) {
        clickEvent.preventDefault();
        function downloadFunction() {
            window.open(`/plates-ontario/mtoExport/${batchId.toString()}`);
            batchIsSent = true;
        }
        if (batchIsSent) {
            downloadFunction();
            return;
        }
        cityssm.confirmModal('Download Batch?', '<strong>You are about to download this batch for the first time.</strong><br />' +
            'The date of this download will be tracked as part of the batch record.', 'OK, Download the File', 'warning', downloadFunction);
    }
    function populateAvailableTicketsView() {
        var _a;
        cityssm.clearElement(availableTicketsContainerElement);
        const resultsPanelElement = document.createElement('div');
        resultsPanelElement.className = 'panel';
        const filterStringSplit = licencePlateNumberFilterElement.value
            .toLowerCase()
            .trim()
            .split(' ');
        const includedTicketIds = [];
        for (const [recordIndex, ticketRecord] of availableTicketsList.entries()) {
            if (!ticketRecord) {
                continue;
            }
            let displayRecord = true;
            const licencePlateNumberLowerCase = ticketRecord.licencePlateNumber.toLowerCase();
            for (const searchStringPiece of filterStringSplit) {
                if (!licencePlateNumberLowerCase.includes(searchStringPiece)) {
                    displayRecord = false;
                    break;
                }
            }
            if (!displayRecord) {
                continue;
            }
            includedTicketIds.push(ticketRecord.ticketId);
            const resultElement = document.createElement('div');
            resultElement.className = 'panel-block is-block is-ticket-container';
            resultElement.innerHTML =
                '<div class="level is-marginless">' +
                    ('<div class="level-left">' +
                        '<div class="licence-plate">' +
                        '<div class="licence-plate-number">' +
                        cityssm.escapeHTML(ticketRecord.licencePlateNumber) +
                        '</div>' +
                        '</div>' +
                        '</div>') +
                    ('<div class="level-right">' +
                        '<button class="button is-small" data-index="' +
                        recordIndex.toString() +
                        '"' +
                        ' data-cy="add-ticket"' +
                        ' data-tooltip="Add to Batch" type="button">' +
                        '<span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>' +
                        '<span>Add</span>' +
                        '</button>' +
                        '</div>') +
                    '</div>' +
                    '<div class="level">' +
                    '<div class="level-left"><div class="tags">' +
                    '<a class="tag has-tooltip-bottom" data-tooltip="View Ticket (Opens in New Window)"' +
                    ' href="/tickets/' +
                    encodeURIComponent(ticketRecord.ticketId) +
                    '" target="_blank">' +
                    cityssm.escapeHTML(ticketRecord.ticketNumber) +
                    '</a>' +
                    '</div></div>' +
                    '<div class="level-right is-size-7">' +
                    ticketRecord.issueDateString +
                    '</div>' +
                    '</div>';
            (_a = resultElement
                .querySelector('button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', addParkingTicketToBatch);
            resultsPanelElement.append(resultElement);
        }
        if (includedTicketIds.length > 0) {
            const addAllButtonElement = document.createElement('button');
            addAllButtonElement.className = 'button is-fullwidth mb-3';
            addAllButtonElement.dataset.cy = 'add-tickets';
            addAllButtonElement.innerHTML =
                '<span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>' +
                    ('<span>' +
                        'Add ' +
                        includedTicketIds.length.toString() +
                        ' Parking Ticket' +
                        (includedTicketIds.length === 1 ? '' : 's') +
                        '</span>');
            addAllButtonElement.addEventListener('click', () => {
                cityssm.openHtmlModal('loading', {
                    onshown(_modalElement, closeModalFunction) {
                        document.querySelector('#is-loading-modal-message').textContent = `Adding
              ${includedTicketIds.length.toString()}
              Parking Ticket${includedTicketIds.length === 1 ? '' : 's'}...`;
                        cityssm.postJSON('/plates/doAddAllParkingTicketsToLookupBatch', {
                            batchId,
                            ticketIds: includedTicketIds
                        }, (resultJSON) => {
                            closeModalFunction();
                            if (resultJSON.success) {
                                populateBatchView(resultJSON.batch);
                                refreshAvailableTickets();
                            }
                        });
                    }
                });
            });
            availableTicketsContainerElement.append(addAllButtonElement);
            availableTicketsContainerElement.append(resultsPanelElement);
        }
        else {
            availableTicketsContainerElement.innerHTML = `<div class="message is-info">
        <div class="message-body">There are no parking tickets that meet your search criteria.</div>
        </div>`;
        }
    }
    function refreshAvailableTickets() {
        if (batchIsLocked) {
            availableTicketsContainerElement.innerHTML = `<div class="message is-info">
        <div class="message-body">Parking Tickets cannot be added to a locked batch.</div>
        </div>`;
            return;
        }
        availableTicketsContainerElement.innerHTML = `<p class="has-text-centered has-text-grey-lighter">
      <i class="fas fa-3x fa-circle-notch fa-spin" aria-hidden="true"></i><br />
      <em>Loading parking tickets...</em>
      </p>`;
        cityssm.postJSON('/plates-ontario/doGetParkingTicketsAvailableForMTOLookup', {
            batchId,
            issueDaysAgo: availableIssueDaysAgoElement.value
        }, (responseJSON) => {
            availableTicketsList = responseJSON.tickets;
            populateAvailableTicketsView();
        });
    }
    (_b = document
        .querySelector('#is-more-available-filters-toggle')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', (clickEvent) => {
        var _a;
        clickEvent.preventDefault();
        (_a = document
            .querySelector('#is-more-available-filters')) === null || _a === void 0 ? void 0 : _a.classList.toggle('is-hidden');
    });
    licencePlateNumberFilterElement.addEventListener('keyup', populateAvailableTicketsView);
    availableIssueDaysAgoElement.addEventListener('change', refreshAvailableTickets);
    const lockBatchButtonElement = document.querySelector('#is-lock-batch-button');
    const batchEntriesContainerElement = document.querySelector('#is-batch-entries-container');
    function populateBatchView(batch) {
        var _a;
        batchId = batch.batchId;
        batchEntriesList = batch.batchEntries;
        batchIsLocked = batch.lockDateString !== '';
        batchIsSent = batch.sentDateString !== '';
        batchIncludesLabels = batch.mto_includeLabels;
        if (canUpdate) {
            if (batchIsLocked) {
                lockBatchButtonElement.setAttribute('disabled', 'disabled');
            }
            else {
                lockBatchButtonElement.removeAttribute('disabled');
            }
        }
        document.querySelector('#batchSelector--batchId').innerHTML =
            'Batch #' +
                batch.batchId.toString() +
                '<br />' +
                (batchIncludesLabels
                    ? '<span class="tag is-light">' +
                        '<span class="icon is-small"><i class="fas fa-tag" aria-hidden="true"></i></span>' +
                        ' <span>Include Labels</span>' +
                        '</span>'
                    : '') +
                ' ' +
                (batchIsLocked
                    ? `<span class="tag is-light">
          <span class="icon is-small"><i class="fas fa-lock" aria-hidden="true"></i></span>
          <span>${batch.lockDateString}</span>
          </span>`
                    : '');
        document.querySelector('#batchSelector--batchDetails').innerHTML = `<span class="icon is-small"><i class="fas fa-calendar" aria-hidden="true"></i></span>
      <span>${batch.batchDateString}</span>`;
        cityssm.clearElement(batchEntriesContainerElement);
        if (batchEntriesList.length === 0) {
            batchEntriesContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no parking tickets included in the batch.</p>
        </div>`;
            return;
        }
        cityssm.clearElement(batchEntriesContainerElement);
        const panelElement = document.createElement('div');
        panelElement.className = 'panel';
        for (const [index, batchEntry] of batchEntriesList.entries()) {
            const panelBlockElement = document.createElement('div');
            panelBlockElement.className = 'panel-block is-block is-entry-container';
            panelBlockElement.innerHTML =
                '<div class="level mb-0">' +
                    ('<div class="level-left">' +
                        '<div class="licence-plate">' +
                        '<div class="licence-plate-number">' +
                        cityssm.escapeHTML(batchEntry.licencePlateNumber) +
                        '</div>' +
                        '</div>' +
                        '</div>') +
                    (batchIsLocked
                        ? ''
                        : '<div class="level-right">' +
                            '<button class="button is-small" data-index="' +
                            index.toString() +
                            '" data-cy="remove-ticket" type="button">' +
                            '<span class="icon is-small"><i class="fas fa-minus" aria-hidden="true"></i></span>' +
                            '<span>Remove</span>' +
                            '</button>' +
                            '</div>') +
                    '</div>' +
                    '<a class="tag has-tooltip-bottom" data-tooltip="View Ticket (Opens in New Window)"' +
                    ' href="/tickets/' +
                    encodeURIComponent(batchEntry.ticketId) +
                    '" target="_blank">' +
                    cityssm.escapeHTML(batchEntry.ticketNumber) +
                    '</a>';
            if (!batchIsLocked) {
                (_a = panelBlockElement
                    .querySelector('button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', removeParkingTicketFromBatch);
            }
            panelElement.append(panelBlockElement);
        }
        if (batchIsLocked) {
            const downloadFileButtonElement = document.createElement('button');
            downloadFileButtonElement.className = 'button is-fullwidth mb-3';
            downloadFileButtonElement.innerHTML = `<span class="icon is-small"><i class="fas fa-download" aria-hidden="true"></i></span>
        <span>Download File for MTO</span>`;
            downloadFileButtonElement.addEventListener('click', downloadBatch);
            batchEntriesContainerElement.append(downloadFileButtonElement);
            batchEntriesContainerElement.insertAdjacentHTML('beforeend', `<a class="button is-fullwidth mb-3" href="https://www.aris.mto.gov.on.ca/edtW/login/login.jsp" target="_blank" rel="noreferrer">
          <span class="icon is-small"><i class="fas fa-building" aria-hidden="true"></i></span>
          <span>MTO ARIS Login</span>
          </a>`);
        }
        else {
            const clearAllButtonElement = document.createElement('button');
            clearAllButtonElement.className = 'button is-fullwidth mb-3';
            clearAllButtonElement.dataset.cy = 'clear-batch';
            clearAllButtonElement.innerHTML = `<span class="icon is-small"><i class="fas fa-broom" aria-hidden="true"></i></span>
        <span>Clear Batch</span>`;
            clearAllButtonElement.addEventListener('click', clearBatch);
            batchEntriesContainerElement.append(clearAllButtonElement);
        }
        batchEntriesContainerElement.append(panelElement);
    }
    function refreshBatch() {
        cityssm.postJSON('/plates/doGetLookupBatch', {
            batchId
        }, (batch) => {
            populateBatchView(batch);
            refreshAvailableTickets();
        });
    }
    function openCreateBatchModal() {
        let createCloseModal;
        function createFunction(clickEvent) {
            clickEvent.preventDefault();
            const mto_includeLabels = clickEvent.currentTarget
                .dataset.includeLabels;
            cityssm.postJSON('/plates/doCreateLookupBatch', {
                mto_includeLabels
            }, (responseJSON) => {
                if (responseJSON.success) {
                    createCloseModal();
                    populateBatchView(responseJSON.batch);
                    refreshAvailableTickets();
                }
            });
        }
        cityssm.openHtmlModal('mto-createBatch', {
            onshow: (modalElement) => {
                const createBatchButtonElements = modalElement.querySelectorAll('.is-create-batch-button');
                for (const createBatchButtonElement of createBatchButtonElements) {
                    createBatchButtonElement.addEventListener('click', createFunction);
                }
            },
            onshown: (_modalElement, closeModalFunction) => {
                createCloseModal = closeModalFunction;
            }
        });
    }
    function openSelectBatchModal(clickEvent) {
        clickEvent.preventDefault();
        let selectBatchCloseModalFunction;
        let resultsContainerElement;
        function selectBatch(batchClickEvent) {
            var _a;
            batchClickEvent.preventDefault();
            batchId = Number.parseInt((_a = batchClickEvent.currentTarget.dataset.batchId) !== null && _a !== void 0 ? _a : '-1', 10);
            selectBatchCloseModalFunction();
            refreshBatch();
        }
        function loadBatches() {
            cityssm.postJSON('/plates/doGetUnreceivedLicencePlateLookupBatches', {}, (batchList) => {
                if (batchList.length === 0) {
                    resultsContainerElement.innerHTML = `<div class="message is-info">
              <p class="message-body">There are no unsent batches available.</p>
              </div>`;
                    return;
                }
                const listElement = document.createElement('div');
                listElement.className = 'panel';
                for (const batch of batchList) {
                    const linkElement = document.createElement('a');
                    linkElement.className = 'panel-block is-block';
                    linkElement.setAttribute('href', '#');
                    linkElement.dataset.batchId = batch.batchId.toString();
                    linkElement.innerHTML =
                        '<div class="columns">' +
                            '<div class="column is-narrow">#' +
                            batch.batchId.toString() +
                            '</div>' +
                            '<div class="column has-text-right">' +
                            batch.batchDateString +
                            '<br />' +
                            ('<div class="tags justify-flex-end">' +
                                (batch.mto_includeLabels
                                    ? '<span class="tag">' +
                                        '<span class="icon is-small"><i class="fas fa-tag" aria-hidden="true"></i></span>' +
                                        '<span>Includes Labels</span>' +
                                        '</span>'
                                    : '') +
                                (batch.lockDate
                                    ? '<span class="tag">' +
                                        '<span class="icon is-small"><i class="fas fa-lock" aria-hidden="true"></i></span>' +
                                        '<span>Locked</span>' +
                                        '</span>'
                                    : '') +
                                (batch.sentDate
                                    ? '<span class="tag">' +
                                        '<span class="icon is-small"><i class="fas fa-share" aria-hidden="true"></i></span>' +
                                        '<span>Sent to MTO</span>' +
                                        '</span>'
                                    : '') +
                                '</div>') +
                            '</div>' +
                            '</div>';
                    linkElement.addEventListener('click', selectBatch);
                    listElement.append(linkElement);
                }
                cityssm.clearElement(resultsContainerElement);
                resultsContainerElement.append(listElement);
            });
        }
        cityssm.openHtmlModal('mto-selectBatch', {
            onshow(modalElement) {
                resultsContainerElement = modalElement.querySelector('.is-results-container');
                loadBatches();
                if (canUpdate) {
                    const createBatchButtonElement = modalElement.querySelector('.is-create-batch-button');
                    createBatchButtonElement.classList.remove('is-hidden');
                    createBatchButtonElement.addEventListener('click', () => {
                        selectBatchCloseModalFunction();
                        openCreateBatchModal();
                    });
                }
            },
            onshown(_modalElement, closeModalFunction) {
                selectBatchCloseModalFunction = closeModalFunction;
            }
        });
    }
    (_c = document
        .querySelector('#is-select-batch-button')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', openSelectBatchModal);
    if (canUpdate) {
        lockBatchButtonElement === null || lockBatchButtonElement === void 0 ? void 0 : lockBatchButtonElement.addEventListener('click', () => {
            if (batchIsLocked) {
                return;
            }
            function lockFunction() {
                cityssm.postJSON('/plates/doLockLookupBatch', {
                    batchId
                }, (responseJSON) => {
                    if (responseJSON.success) {
                        populateBatchView(responseJSON.batch);
                    }
                });
            }
            cityssm.confirmModal('Lock Batch?', '<strong>Are you sure you want to lock the batch?</strong><br />' +
                'Once the batch is locked, no licence plates can be added or deleted from the batch.' +
                ' All tickets related to the licence plates in the batch will be updated with a "Pending Lookup" status.', 'Yes, Lock the Batch', 'info', lockFunction);
        });
    }
    if (exports.plateExportBatch) {
        populateBatchView(exports.plateExportBatch);
        delete exports.plateExportBatch;
        refreshAvailableTickets();
    }
})();
