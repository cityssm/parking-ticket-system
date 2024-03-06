"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const canUpdate = document.querySelector('main')?.dataset.canUpdate === 'true';
    let currentBatch = exports.currentBatch;
    delete exports.currentBatch;
    let convictableTickets = exports.convictableTickets;
    delete exports.convictableTickets;
    const ticketFilterElement = document.querySelector('#filter--parkingTicket');
    const convictableTicketsContainerElement = document.querySelector('#convictable-tickets-container');
    let displayedTicketIds = [];
    function addTicketToBatchByIndex(clickEvent) {
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        buttonElement.setAttribute('disabled', 'disabled');
        const index = Number.parseInt(buttonElement.dataset.index ?? '-1', 10);
        const ticketId = convictableTickets[index].ticketId;
        cityssm.postJSON(`${pts.urlPrefix}/tickets/doAddTicketToConvictionBatch`, {
            batchId: currentBatch.batchId,
            ticketId
        }, (rawResponseJSON) => {
            const resultJSON = rawResponseJSON;
            if (resultJSON.success) {
                currentBatch = resultJSON.batch;
                renderCurrentBatch();
                convictableTickets.splice(index, 1);
                renderConvictableTicketsFunction();
            }
            else {
                buttonElement.removeAttribute('disabled');
                bulmaJS.alert({
                    title: 'Ticket Not Added',
                    message: resultJSON.message ?? 'Please try again.',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    function addAllTicketsToBatchFunction(clickEvent) {
        clickEvent.preventDefault();
        let loadingCloseModalFunction;
        function addFunction() {
            cityssm.postJSON(`${pts.urlPrefix}/tickets-ontario/doAddAllTicketsToConvictionBatch`, {
                batchId: currentBatch.batchId,
                ticketIds: displayedTicketIds
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                loadingCloseModalFunction();
                if (responseJSON.batch) {
                    currentBatch = responseJSON.batch;
                    renderCurrentBatch();
                }
                if (responseJSON.tickets) {
                    convictableTickets = responseJSON.tickets;
                    renderConvictableTicketsFunction();
                }
                if (responseJSON.successCount === 0) {
                    bulmaJS.alert({
                        title: 'Results',
                        message: responseJSON.message ?? 'No tickets were added to the batch.',
                        contextualColorName: 'warning'
                    });
                }
            });
        }
        cityssm.openHtmlModal('loading', {
            onshow() {
                ;
                document.querySelector('#is-loading-modal-message').textContent = `Adding ${displayedTicketIds.length.toString()}
          ticket${displayedTicketIds.length === 1 ? '' : 's'}...`;
            },
            onshown(_modalElement, closeModalFunction) {
                loadingCloseModalFunction = closeModalFunction;
                addFunction();
            }
        });
    }
    function renderConvictableTicketsFunction() {
        cityssm.clearElement(convictableTicketsContainerElement);
        displayedTicketIds = [];
        if (!currentBatch) {
            convictableTicketsContainerElement.innerHTML = `<div class="message is-warning">
        <div class="message-body">Select a target batch to get started.</div>
        </div>`;
            return;
        }
        if (!canUpdate) {
            convictableTicketsContainerElement.innerHTML = `<div class="message is-warning">
        <div class="message-body">Parking tickets can only be added by users with update permissions.</div>
        </div>`;
            return;
        }
        if (currentBatch.lockDate) {
            convictableTicketsContainerElement.innerHTML = `<div class="message is-warning">
        <div class="message-body">The target batch is locked and cannot accept additional tickets.</div>
        </div>`;
            return;
        }
        if (convictableTickets.length === 0) {
            convictableTicketsContainerElement.innerHTML = `<div class="message is-info">
        <div class="message-body">There are no parking tickets currently eligible for conviction.</div>
        </div>`;
            return;
        }
        const ticketFilter = ticketFilterElement.value.trim().toLowerCase();
        const tbodyElement = document.createElement('tbody');
        for (const [index, ticket] of convictableTickets.entries()) {
            if (!ticket.ticketNumber.toLowerCase().includes(ticketFilter) &&
                !ticket.licencePlateNumber.toLowerCase().includes(ticketFilter)) {
                continue;
            }
            displayedTicketIds.push(ticket.ticketId);
            const trElement = document.createElement('tr');
            trElement.innerHTML = `<td>
          <a data-tooltip="View Ticket (Opens in New Window)" href="${pts.urlPrefix}/tickets/${ticket.ticketId.toString()}" target="_blank">
          ${cityssm.escapeHTML(ticket.ticketNumber)}
          </a>
        </td>
        <td>${ticket.issueDateString}</td>
        <td>
          <span class="licence-plate-number is-size-6">
          ${cityssm.escapeHTML(ticket.licencePlateNumber)}
          </span><br />
          <span class="has-tooltip-right is-size-7" data-tooltip="Primary Owner">
          ${cityssm.escapeHTML(ticket.licencePlateOwner_ownerName1 ?? '')}
          </span>
        </td>
        <td class="has-text-right">
          <button class="button is-small" data-index="${index.toString()}" type="button">
            <span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>
            <span>Add</span>
          </button>
        </td>`;
            trElement
                .querySelector('button')
                ?.addEventListener('click', addTicketToBatchByIndex);
            tbodyElement.append(trElement);
        }
        if (displayedTicketIds.length === 0) {
            convictableTicketsContainerElement.innerHTML = `<div class="message is-info">
        <div class="message-body">There are no parking tickets that meet the search criteria.</div>
        </div>`;
            return;
        }
        const addAllButtonElement = document.createElement('button');
        addAllButtonElement.className = 'button is-fullwidth mb-3';
        addAllButtonElement.innerHTML = `<span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>
      <span>
        Add ${displayedTicketIds.length.toString()}
        Parking Ticket${displayedTicketIds.length === 1 ? '' : 's'}
      </span>`;
        addAllButtonElement.addEventListener('click', addAllTicketsToBatchFunction);
        convictableTicketsContainerElement.append(addAllButtonElement);
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-striped is-hoverable is-fullwidth';
        tableElement.innerHTML = `<thead><tr>
      <th>Ticket Number</th>
      <th>Issue Date</th>
      <th>Licence Plate</th>
      <th></th>
      </tr></thead>`;
        tableElement.append(tbodyElement);
        convictableTicketsContainerElement.append(tableElement);
    }
    ticketFilterElement.addEventListener('keyup', renderConvictableTicketsFunction);
    const batchEntriesContainerElement = document.querySelector('#batch-entries-container');
    function removeTicketFromBatchByIndex(clickEvent) {
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        buttonElement.setAttribute('disabled', 'disabled');
        const index = Number.parseInt(buttonElement.dataset.index ?? '-1', 10);
        const ticketId = currentBatch.batchEntries[index].ticketId;
        cityssm.postJSON(`${pts.urlPrefix}/tickets-ontario/doRemoveTicketFromConvictionBatch`, {
            batchId: currentBatch.batchId,
            ticketId
        }, (rawResponseJSON) => {
            const resultJSON = rawResponseJSON;
            if (resultJSON.success) {
                currentBatch.batchEntries.splice(index, 1);
                renderCurrentBatch();
                convictableTickets = resultJSON.tickets;
                renderConvictableTicketsFunction();
            }
            else {
                buttonElement.removeAttribute('disabled');
            }
        });
    }
    function clearBatch(clickEvent) {
        clickEvent.preventDefault();
        function doClear() {
            cityssm.postJSON(`${pts.urlPrefix}/tickets-ontario/doClearConvictionBatch`, {
                batchId: currentBatch.batchId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (!responseJSON.success) {
                    cityssm.alertModal('Batch Not Cleared', responseJSON.message ?? '', 'OK', 'danger');
                }
                if (responseJSON.batch) {
                    currentBatch = responseJSON.batch;
                    renderCurrentBatch();
                }
                if (responseJSON.tickets) {
                    convictableTickets = responseJSON.tickets;
                    renderConvictableTicketsFunction();
                }
            });
        }
        bulmaJS.confirm({
            title: 'Clear Batch',
            message: 'Are you sure you want to remove all the parking tickets from the batch?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Clear the Batch',
                callbackFunction: doClear
            }
        });
    }
    function doLock() {
        cityssm.postJSON(`${pts.urlPrefix}/tickets/doLockConvictionBatch`, {
            batchId: currentBatch.batchId
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                currentBatch.lockDate = responseJSON.lockDate;
                currentBatch.lockDateString = responseJSON.lockDateString;
                renderCurrentBatch();
                renderConvictableTicketsFunction();
            }
        });
    }
    function lockBatch(clickEvent) {
        clickEvent.preventDefault();
        bulmaJS.confirm({
            title: 'Lock Batch',
            message: `<strong>Are you sure you want to lock this batch?</strong><br />
        Once locked, no further changes to the batch will be allowed.
        The option to download the batch will become available.`,
            messageIsHtml: true,
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Lock the Batch',
                callbackFunction: doLock
            }
        });
    }
    function doUnlock() {
        cityssm.postJSON(`${pts.urlPrefix}/tickets/doUnlockConvictionBatch`, {
            batchId: currentBatch.batchId
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                currentBatch.lockDate = undefined;
                currentBatch.lockDateString = undefined;
                renderCurrentBatch();
                renderConvictableTicketsFunction();
            }
        });
    }
    function unlockBatch(clickEvent) {
        clickEvent.preventDefault();
        bulmaJS.confirm({
            title: 'Unlock Batch',
            message: `<strong>Are you sure you want to unlock this batch?</strong><br />
        Once unlocked, changes to the batch will be allowed.`,
            messageIsHtml: true,
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Unlock the Batch',
                callbackFunction: doUnlock
            }
        });
    }
    function downloadBatch(clickEvent) {
        clickEvent.preventDefault();
        function doDownload() {
            window.open(`/tickets/convict/${currentBatch.batchId.toString()}/print`);
        }
        function doMarkAsSent() {
            cityssm.postJSON(`${pts.urlPrefix}/tickets/doMarkConvictionBatchSent`, {
                batchId: currentBatch.batchId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                currentBatch = responseJSON.batch;
                renderCurrentBatch();
            });
            doDownload();
        }
        if ((currentBatch.sentDate ?? -1) === -1) {
            bulmaJS.confirm({
                title: 'Download Batch',
                message: `<strong>You are about to download the batch for the first time.</strong><br />
          Once downloaded, the date will be tracked, and the batch will no longer be able to be unlocked.`,
                messageIsHtml: true,
                contextualColorName: 'warning',
                okButton: {
                    text: 'Yes, Download the Batch',
                    callbackFunction: doMarkAsSent
                }
            });
        }
        else {
            doDownload();
        }
    }
    function renderCurrentBatch() {
        ;
        document.querySelector('#batchSelector--batchId').textContent = `Batch #${currentBatch.batchId.toString()}`;
        document.querySelector('#batchSelector--batchDetails').innerHTML = `<span class="has-tooltip-left" data-tooltip="Batch Date">
        <span class="icon"><i class="fas fa-star" aria-hidden="true"></i></span>
        ${currentBatch.batchDateString}
      </span>
      ${(currentBatch.lockDate ?? -1) === -1
            ? ''
            : `<br />
            <span class="has-tooltip-left" data-tooltip="Lock Date">
              <span class="icon"><i class="fas fa-lock" aria-hidden="true"></i></span>
              ${currentBatch.lockDateString}
            </span>`}`;
        cityssm.clearElement(batchEntriesContainerElement);
        if (currentBatch.batchEntries.length === 0) {
            batchEntriesContainerElement.innerHTML = `<div class="message is-info">
        <div class="message-body">There are no parking tickets in this batch.</div>
        </div>`;
            return;
        }
        const tbodyElement = document.createElement('tbody');
        const canRemove = canUpdate && !currentBatch.lockDate;
        for (const [index, batchEntry] of (currentBatch.batchEntries ?? []).entries()) {
            const trElement = document.createElement('tr');
            trElement.innerHTML = `<td>
          <a href="${pts.urlPrefix}/tickets/${batchEntry.ticketId.toString()}" target="_blank">
            ${batchEntry.ticketNumber}
          </a>
        </td>
        <td>${batchEntry.issueDateString}</td>
        <td>
          <span class="licence-plate-number is-size-6">
            ${cityssm.escapeHTML(batchEntry.licencePlateNumber)}
          </span>
        </td>
        ${canRemove
                ? `<td class="has-text-right">
              <button class="button is-small" data-index="${index.toString()}" type="button">
              <span class="icon is-small"><i class="fas fa-minus" aria-hidden="true"></i></span>
              <span>Remove</span>
              </button>
              </td>`
                : ''}`;
            if (canRemove) {
                trElement
                    .querySelector('button')
                    ?.addEventListener('click', removeTicketFromBatchByIndex);
            }
            tbodyElement.append(trElement);
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        tableElement.innerHTML = `<thead><tr>
      <th>Ticket Number</th>
      <th>Issue Date</th>
      <th>Licence Plate</th>
      ${canRemove ? '<th></th>' : ''}
      </tr></thead>`;
        tableElement.append(tbodyElement);
        batchEntriesContainerElement.append(tableElement);
        if (canUpdate && !currentBatch.lockDate) {
            const lockButtonElement = document.createElement('button');
            lockButtonElement.className = 'button is-fullwidth mb-3';
            lockButtonElement.innerHTML = `<span class="icon is-small">
        <i class="fas fa-lock" aria-hidden="true"></i>
        </span>
        <span>Lock Batch</span>`;
            lockButtonElement.addEventListener('click', lockBatch);
            batchEntriesContainerElement.prepend(lockButtonElement);
            const clearButtonElement = document.createElement('button');
            clearButtonElement.className = 'button is-fullwidth mb-3';
            clearButtonElement.innerHTML = `<span class="icon is-small">
        <i class="fas fa-broom" aria-hidden="true"></i>
        </span>
        <span>Clear Batch</span>`;
            clearButtonElement.addEventListener('click', clearBatch);
            tableElement.before(clearButtonElement);
        }
        if (canUpdate && currentBatch.lockDate && !currentBatch.sentDate) {
            const unlockButtonElement = document.createElement('button');
            unlockButtonElement.className = 'button is-fullwidth mb-3';
            unlockButtonElement.innerHTML = `<span class="icon is-small"><i class="fas fa-unlock" aria-hidden="true"></i></span>
        <span>Unlock Batch</span>`;
            unlockButtonElement.addEventListener('click', unlockBatch);
            batchEntriesContainerElement.prepend(unlockButtonElement);
        }
        if (currentBatch.lockDate) {
            const downloadButtonElement = document.createElement('button');
            downloadButtonElement.className = 'button is-fullwidth mb-3';
            downloadButtonElement.innerHTML = `<span class="icon is-small">
        <i class="fas fa-download" aria-hidden="true"></i>
        </span>
        <span>Download Report for Provincial Offences</span>`;
            downloadButtonElement.addEventListener('click', downloadBatch);
            tableElement.before(downloadButtonElement);
        }
    }
    function confirmCreateBatch() {
        function doCreate() {
            cityssm.postJSON(`${pts.urlPrefix}/tickets/doCreateConvictionBatch`, {}, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    currentBatch = responseJSON.batch;
                    renderCurrentBatch();
                    renderConvictableTicketsFunction();
                }
            });
        }
        bulmaJS.confirm({
            title: 'Create a New Batch',
            message: 'Are you sure you want to create a new conviction batch?',
            contextualColorName: 'info',
            okButton: {
                text: 'Yes, Create Batch',
                callbackFunction: doCreate
            }
        });
    }
    document
        .querySelector('#is-select-batch-button')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        let selectBatchCloseModalFunction;
        function doSelectBatch(clickEvent) {
            clickEvent.preventDefault();
            const batchId = clickEvent.currentTarget.dataset
                .batchId;
            cityssm.postJSON(`${pts.urlPrefix}/tickets/doGetConvictionBatch`, {
                batchId
            }, (rawResponseJSON) => {
                const batchObject = rawResponseJSON;
                currentBatch = batchObject;
                renderCurrentBatch();
                renderConvictableTicketsFunction();
            });
            selectBatchCloseModalFunction();
        }
        cityssm.openHtmlModal('mto-selectBatch', {
            onshow(modalElement) {
                if (canUpdate) {
                    const createButtonElement = modalElement.querySelector('.is-create-batch-button');
                    createButtonElement.classList.remove('is-hidden');
                    createButtonElement.addEventListener('click', (clickEvent) => {
                        clickEvent.preventDefault();
                        selectBatchCloseModalFunction();
                        confirmCreateBatch();
                    });
                }
                cityssm.postJSON(`${pts.urlPrefix}/tickets/doGetRecentConvictionBatches`, {}, (rawResponseJSON) => {
                    const batchList = rawResponseJSON;
                    const resultsContainerElement = modalElement.querySelector('.is-results-container');
                    cityssm.clearElement(resultsContainerElement);
                    if (batchList.length === 0) {
                        resultsContainerElement.className = 'message is-info';
                        resultsContainerElement.innerHTML =
                            '<div class="message-body">There are no recent conviction batches.</div>';
                        return;
                    }
                    resultsContainerElement.className = 'list is-hoverable';
                    for (const batch of batchList) {
                        const batchListItemElement = document.createElement('a');
                        batchListItemElement.className = 'list-item';
                        batchListItemElement.dataset.batchId = batch.batchId.toString();
                        batchListItemElement.href = '#';
                        batchListItemElement.innerHTML = `<div class="columns">
                  <div class="column is-narrow">#${batch.batchId.toString()}</div>
                  <div class="column has-text-right">
                  ${batch.batchDateString}
                  ${batch.lockDate
                            ? `<br />
                        <div class="tags justify-flex-end">
                          <span class="tag">
                            <span class="icon is-small"><i class="fas fa-lock" aria-hidden="true"></i></span>
                            <span>Locked</span>
                          </span>
                        </div>`
                            : ''}</div>
                </div>`;
                        batchListItemElement.addEventListener('click', doSelectBatch);
                        resultsContainerElement.append(batchListItemElement);
                    }
                });
            },
            onshown(_modalElement, closeModalFunction) {
                selectBatchCloseModalFunction = closeModalFunction;
            }
        });
    });
    if (currentBatch) {
        renderCurrentBatch();
    }
    renderConvictableTicketsFunction();
})();
