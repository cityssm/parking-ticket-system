"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
(() => {
    var _a;
    const canUpdate = ((_a = document.querySelector('main')) === null || _a === void 0 ? void 0 : _a.dataset.canUpdate) === 'true';
    let batchID = -1;
    let batchIsLocked = true;
    let batchIncludesLabels = false;
    let batchIsSent = false;
    const availableIssueDaysAgoElement = document.querySelector('#available--issueDaysAgo');
    const availableTicketsContainerElement = document.querySelector('#is-available-tickets-container');
    const licencePlateNumberFilterElement = document.querySelector('#available--licencePlateNumber');
    let availableTicketsList = [];
    let batchEntriesList = [];
    function clickFunction_addParkingTicketToBatch(clickEvent) {
        var _a;
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        buttonElement.setAttribute('disabled', 'disabled');
        const recordIndex = Number.parseInt((_a = buttonElement.dataset.index) !== null && _a !== void 0 ? _a : '-1', 10);
        const ticketRecord = availableTicketsList[recordIndex];
        const ticketContainerElement = buttonElement.closest('.is-ticket-container');
        cityssm.postJSON('/plates/doAddLicencePlateToLookupBatch', {
            batchID,
            licencePlateCountry: 'CA',
            licencePlateProvince: 'ON',
            licencePlateNumber: ticketRecord.licencePlateNumber,
            ticketID: ticketRecord.ticketID
        }, (responseJSON) => {
            if (responseJSON.success) {
                ticketContainerElement.remove();
                availableTicketsList[recordIndex] = undefined;
                function_populateBatchView(responseJSON.batch);
            }
            else {
                buttonElement.removeAttribute('disabled');
            }
        });
    }
    function clickFunction_removeParkingTicketFromBatch(clickEvent) {
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        buttonElement.setAttribute('disabled', 'disabled');
        const recordIndex = Number.parseInt(buttonElement.dataset.index, 10);
        const batchEntry = batchEntriesList[recordIndex];
        const entryContainerElement = buttonElement.closest('.is-entry-container');
        cityssm.postJSON('/plates/doRemoveLicencePlateFromLookupBatch', {
            batchID,
            ticketID: batchEntry.ticketID,
            licencePlateCountry: 'CA',
            licencePlateProvince: 'ON',
            licencePlateNumber: batchEntry.licencePlateNumber
        }, (responseJSON) => {
            if (responseJSON.success) {
                entryContainerElement.remove();
                function_refreshAvailableTickets();
            }
            else {
                buttonElement.removeAttribute('disabled');
            }
        });
    }
    function clickFunction_clearBatch(clickEvent) {
        clickEvent.preventDefault();
        const clearFunction = () => {
            cityssm.postJSON('/plates/doClearLookupBatch', {
                batchID
            }, (responseJSON) => {
                if (responseJSON.success) {
                    function_populateBatchView(responseJSON.batch);
                    function_refreshAvailableTickets();
                }
            });
        };
        cityssm.confirmModal('Clear Batch?', 'Are you sure you want to remove all licence plates from the batch?', 'Yes, Clear the Batch', 'warning', clearFunction);
    }
    const clickFunction_downloadBatch = (clickEvent) => {
        clickEvent.preventDefault();
        const downloadFunction = () => {
            window.open('/plates-ontario/mtoExport/' + batchID.toString());
            batchIsSent = true;
        };
        if (batchIsSent) {
            downloadFunction();
            return;
        }
        cityssm.confirmModal('Download Batch?', '<strong>You are about to download this batch for the first time.</strong><br />' +
            'The date of this download will be tracked as part of the batch record.', 'OK, Download the File', 'warning', downloadFunction);
    };
    const function_populateAvailableTicketsView = () => {
        cityssm.clearElement(availableTicketsContainerElement);
        const resultsPanelElement = document.createElement('div');
        resultsPanelElement.className = 'panel';
        const filterStringSplit = licencePlateNumberFilterElement.value
            .toLowerCase()
            .trim()
            .split(' ');
        const includedTicketIDs = [];
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
            includedTicketIDs.push(ticketRecord.ticketID);
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
                    encodeURIComponent(ticketRecord.ticketID) +
                    '" target="_blank">' +
                    cityssm.escapeHTML(ticketRecord.ticketNumber) +
                    '</a>' +
                    '</div></div>' +
                    '<div class="level-right is-size-7">' +
                    ticketRecord.issueDateString +
                    '</div>' +
                    '</div>';
            resultElement
                .querySelector('button')
                .addEventListener('click', clickFunction_addParkingTicketToBatch);
            resultsPanelElement.append(resultElement);
        }
        if (includedTicketIDs.length > 0) {
            const addAllButtonElement = document.createElement('button');
            addAllButtonElement.className = 'button is-fullwidth mb-3';
            addAllButtonElement.dataset.cy = 'add-tickets';
            addAllButtonElement.innerHTML =
                '<span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>' +
                    ('<span>' +
                        'Add ' +
                        includedTicketIDs.length.toString() +
                        ' Parking Ticket' +
                        (includedTicketIDs.length === 1 ? '' : 's') +
                        '</span>');
            addAllButtonElement.addEventListener('click', () => {
                cityssm.openHtmlModal('loading', {
                    onshown(_modalElement, closeModalFunction) {
                        document.querySelector('#is-loading-modal-message').textContent =
                            'Adding ' +
                                includedTicketIDs.length.toString() +
                                ' Parking Ticket' +
                                (includedTicketIDs.length === 1 ? '' : 's') +
                                '...';
                        cityssm.postJSON('/plates/doAddAllParkingTicketsToLookupBatch', {
                            batchID,
                            ticketIDs: includedTicketIDs
                        }, (resultJSON) => {
                            closeModalFunction();
                            if (resultJSON.success) {
                                function_populateBatchView(resultJSON.batch);
                                function_refreshAvailableTickets();
                            }
                        });
                    }
                });
            });
            availableTicketsContainerElement.append(addAllButtonElement);
            availableTicketsContainerElement.append(resultsPanelElement);
        }
        else {
            availableTicketsContainerElement.innerHTML =
                '<div class="message is-info">' +
                    '<div class="message-body">There are no parking tickets that meet your search criteria.</div>' +
                    '</div>';
        }
    };
    const function_refreshAvailableTickets = () => {
        if (batchIsLocked) {
            availableTicketsContainerElement.innerHTML =
                '<div class="message is-info">' +
                    '<div class="message-body">Parking Tickets cannot be added to a locked batch.</div>' +
                    '</div>';
            return;
        }
        availableTicketsContainerElement.innerHTML =
            '<p class="has-text-centered has-text-grey-lighter">' +
                '<i class="fas fa-3x fa-circle-notch fa-spin" aria-hidden="true"></i><br />' +
                '<em>Loading parking tickets...' +
                '</p>';
        cityssm.postJSON('/plates-ontario/doGetParkingTicketsAvailableForMTOLookup', {
            batchID,
            issueDaysAgo: availableIssueDaysAgoElement.value
        }, (responseJSON) => {
            availableTicketsList = responseJSON.tickets;
            function_populateAvailableTicketsView();
        });
    };
    document
        .querySelector('#is-more-available-filters-toggle')
        .addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        document
            .querySelector('#is-more-available-filters')
            .classList.toggle('is-hidden');
    });
    licencePlateNumberFilterElement.addEventListener('keyup', function_populateAvailableTicketsView);
    availableIssueDaysAgoElement.addEventListener('change', function_refreshAvailableTickets);
    const lockBatchButtonElement = document.querySelector('#is-lock-batch-button');
    const batchEntriesContainerElement = document.querySelector('#is-batch-entries-container');
    const function_populateBatchView = (batch) => {
        batchID = batch.batchID;
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
        document.querySelector('#batchSelector--batchID').innerHTML =
            'Batch #' +
                batch.batchID.toString() +
                '<br />' +
                (batchIncludesLabels
                    ? '<span class="tag is-light">' +
                        '<span class="icon is-small"><i class="fas fa-tag" aria-hidden="true"></i></span>' +
                        ' <span>Include Labels</span>' +
                        '</span>'
                    : '') +
                ' ' +
                (batchIsLocked
                    ? '<span class="tag is-light">' +
                        '<span class="icon is-small"><i class="fas fa-lock" aria-hidden="true"></i></span>' +
                        ' <span>' +
                        batch.lockDateString +
                        '</span>' +
                        '</span>'
                    : '');
        document.querySelector('#batchSelector--batchDetails').innerHTML =
            '<span class="icon is-small"><i class="fas fa-calendar" aria-hidden="true"></i></span>' +
                '<span>' +
                batch.batchDateString +
                '</span>';
        cityssm.clearElement(batchEntriesContainerElement);
        if (batchEntriesList.length === 0) {
            batchEntriesContainerElement.innerHTML =
                '<div class="message is-info">' +
                    '<p class="message-body">There are no parking tickets included in the batch.</p>' +
                    '</div>';
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
                    encodeURIComponent(batchEntry.ticketID) +
                    '" target="_blank">' +
                    cityssm.escapeHTML(batchEntry.ticketNumber) +
                    '</a>';
            if (!batchIsLocked) {
                panelBlockElement
                    .querySelector('button')
                    .addEventListener('click', clickFunction_removeParkingTicketFromBatch);
            }
            panelElement.append(panelBlockElement);
        }
        if (batchIsLocked) {
            const downloadFileButtonElement = document.createElement('button');
            downloadFileButtonElement.className = 'button is-fullwidth mb-3';
            downloadFileButtonElement.innerHTML =
                '<span class="icon is-small"><i class="fas fa-download" aria-hidden="true"></i></span>' +
                    '<span>Download File for MTO</span>';
            downloadFileButtonElement.addEventListener('click', clickFunction_downloadBatch);
            batchEntriesContainerElement.append(downloadFileButtonElement);
            batchEntriesContainerElement.insertAdjacentHTML('beforeend', '<a class="button is-fullwidth mb-3" href="https://www.aris.mto.gov.on.ca/edtW/login/login.jsp"' +
                ' target="_blank" rel="noreferrer">' +
                '<span class="icon is-small"><i class="fas fa-building" aria-hidden="true"></i></span>' +
                '<span>MTO ARIS Login</span>' +
                '</a>');
        }
        else {
            const clearAllButtonElement = document.createElement('button');
            clearAllButtonElement.className = 'button is-fullwidth mb-3';
            clearAllButtonElement.dataset.cy = 'clear-batch';
            clearAllButtonElement.innerHTML =
                '<span class="icon is-small"><i class="fas fa-broom" aria-hidden="true"></i></span>' +
                    '<span>Clear Batch</span>';
            clearAllButtonElement.addEventListener('click', clickFunction_clearBatch);
            batchEntriesContainerElement.append(clearAllButtonElement);
        }
        batchEntriesContainerElement.append(panelElement);
    };
    const function_refreshBatch = () => {
        cityssm.postJSON('/plates/doGetLookupBatch', {
            batchID
        }, (batch) => {
            function_populateBatchView(batch);
            function_refreshAvailableTickets();
        });
    };
    const openCreateBatchModal = () => {
        let createCloseModal;
        const createFunction = (clickEvent) => {
            clickEvent.preventDefault();
            const mto_includeLabels = clickEvent.currentTarget
                .dataset.includeLabels;
            cityssm.postJSON('/plates/doCreateLookupBatch', {
                mto_includeLabels
            }, (responseJSON) => {
                if (responseJSON.success) {
                    createCloseModal();
                    function_populateBatchView(responseJSON.batch);
                    function_refreshAvailableTickets();
                }
            });
        };
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
    };
    const clickFunction_openSelectBatchModal = (clickEvent) => {
        clickEvent.preventDefault();
        let selectBatchCloseModalFunction;
        let resultsContainerElement;
        const clickFunction_selectBatch = (batchClickEvent) => {
            batchClickEvent.preventDefault();
            batchID = Number.parseInt(batchClickEvent.currentTarget.dataset.batchId, 10);
            selectBatchCloseModalFunction();
            function_refreshBatch();
        };
        const function_loadBatches = () => {
            cityssm.postJSON('/plates/doGetUnreceivedLicencePlateLookupBatches', {}, (batchList) => {
                if (batchList.length === 0) {
                    resultsContainerElement.innerHTML =
                        '<div class="message is-info">' +
                            '<p class="message-body">There are no unsent batches available.</p>' +
                            '</div>';
                    return;
                }
                const listElement = document.createElement('div');
                listElement.className = 'panel';
                for (const batch of batchList) {
                    const linkElement = document.createElement('a');
                    linkElement.className = 'panel-block is-block';
                    linkElement.setAttribute('href', '#');
                    linkElement.dataset.batchId = batch.batchID.toString();
                    linkElement.innerHTML =
                        '<div class="columns">' +
                            '<div class="column is-narrow">#' +
                            batch.batchID.toString() +
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
                    linkElement.addEventListener('click', clickFunction_selectBatch);
                    listElement.append(linkElement);
                }
                cityssm.clearElement(resultsContainerElement);
                resultsContainerElement.append(listElement);
            });
        };
        cityssm.openHtmlModal('mto-selectBatch', {
            onshow(modalElement) {
                resultsContainerElement = modalElement.querySelector('.is-results-container');
                function_loadBatches();
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
    };
    document
        .querySelector('#is-select-batch-button')
        .addEventListener('click', clickFunction_openSelectBatchModal);
    if (canUpdate) {
        lockBatchButtonElement.addEventListener('click', () => {
            if (batchIsLocked) {
                return;
            }
            const lockFunction = () => {
                cityssm.postJSON('/plates/doLockLookupBatch', {
                    batchID
                }, (responseJSON) => {
                    if (responseJSON.success) {
                        function_populateBatchView(responseJSON.batch);
                    }
                });
            };
            cityssm.confirmModal('Lock Batch?', '<strong>Are you sure you want to lock the batch?</strong><br />' +
                'Once the batch is locked, no licence plates can be added or deleted from the batch.' +
                ' All tickets related to the licence plates in the batch will be updated with a "Pending Lookup" status.', 'Yes, Lock the Batch', 'info', lockFunction);
        });
    }
    if (exports.plateExportBatch) {
        function_populateBatchView(exports.plateExportBatch);
        delete exports.plateExportBatch;
        function_refreshAvailableTickets();
    }
})();
