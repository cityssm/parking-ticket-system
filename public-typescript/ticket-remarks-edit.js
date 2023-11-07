"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const ticketID = document.querySelector('#ticket--ticketID').value;
    const remarkPanelElement = document.querySelector('#is-remark-panel');
    let remarkList = exports.ticketRemarks;
    delete exports.ticketRemarks;
    const clearRemarkPanelFunction = () => {
        const panelBlockElements = remarkPanelElement.querySelectorAll('.panel-block');
        for (const panelBlockElement of panelBlockElements) {
            panelBlockElement.remove();
        }
    };
    const confirmDeleteRemarkFunction = (clickEvent) => {
        const remarkIndex = clickEvent.currentTarget.dataset
            .remarkIndex;
        cityssm.confirmModal('Delete Remark?', 'Are you sure you want to delete this remark?', 'Yes, Delete', 'warning', () => {
            cityssm.postJSON('/tickets/doDeleteRemark', {
                ticketID,
                remarkIndex
            }, (resultJSON) => {
                if (resultJSON.success) {
                    getRemarksFunction();
                }
            });
        });
    };
    const openEditRemarkModalFunction = (clickEvent) => {
        clickEvent.preventDefault();
        let editRemarkCloseModalFunction;
        const index = Number.parseInt(clickEvent.currentTarget.dataset.index, 10);
        const remarkObject = remarkList[index];
        const submitFunction = (formEvent) => {
            formEvent.preventDefault();
            cityssm.postJSON('/tickets/doUpdateRemark', formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    editRemarkCloseModalFunction();
                    getRemarksFunction();
                }
            });
        };
        cityssm.openHtmlModal('ticket-editRemark', {
            onshow(modalElement) {
                ;
                document.querySelector('#editRemark--ticketID').value = ticketID;
                document.querySelector('#editRemark--remarkIndex').value = remarkObject.remarkIndex.toString();
                document.querySelector('#editRemark--remark').value = remarkObject.remark;
                document.querySelector('#editRemark--remarkDateString').value = remarkObject.remarkDateString;
                document.querySelector('#editRemark--remarkTimeString').value = remarkObject.remarkTimeString;
                modalElement
                    .querySelector('form')
                    .addEventListener('submit', submitFunction);
            },
            onshown(_modalElement, closeModalFunction) {
                editRemarkCloseModalFunction = closeModalFunction;
            }
        });
    };
    const populateRemarksPanelFunction = () => {
        clearRemarkPanelFunction();
        if (remarkList.length === 0) {
            remarkPanelElement.insertAdjacentHTML('beforeend', '<div class="panel-block is-block">' +
                '<div class="message is-info">' +
                '<p class="message-body">' +
                'There are no remarks associated with this ticket.' +
                '</p>' +
                '</div>' +
                '</div>');
            return;
        }
        for (const [index, remarkObject] of remarkList.entries()) {
            const panelBlockElement = document.createElement('div');
            panelBlockElement.className = 'panel-block is-block';
            panelBlockElement.innerHTML =
                '<div class="columns">' +
                    ('<div class="column">' +
                        '<p class="has-newline-chars">' +
                        cityssm.escapeHTML(remarkObject.remark) +
                        '</p>' +
                        '<p class="is-size-7">' +
                        (remarkObject.recordCreate_timeMillis ===
                            remarkObject.recordUpdate_timeMillis
                            ? ''
                            : '<i class="fas fa-pencil-alt" aria-hidden="true"></i> ') +
                        remarkObject.recordUpdate_userName +
                        ' - ' +
                        remarkObject.remarkDateString +
                        ' ' +
                        remarkObject.remarkTimeString +
                        '</p>' +
                        '</div>') +
                    (remarkObject.canUpdate
                        ? '<div class="column is-narrow">' +
                            '<div class="buttons is-right has-addons">' +
                            ('<button class="button is-small is-edit-remark-button"' +
                                ' data-cy="edit-remark"' +
                                ' data-tooltip="Edit Remark" data-index="' +
                                index.toString() +
                                '" type="button">' +
                                '<span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>' +
                                ' <span>Edit</span>' +
                                '</button>') +
                            ('<button class="button is-small has-text-danger is-delete-remark-button"' +
                                ' data-cy="delete-remark"' +
                                ' data-tooltip="Delete Remark"' +
                                ' data-remark-index="' +
                                remarkObject.remarkIndex.toString() +
                                '" type="button">' +
                                '<i class="fas fa-trash" aria-hidden="true"></i>' +
                                '<span class="sr-only">Delete</span>' +
                                '</button>') +
                            '</div>' +
                            '</div>'
                        : '') +
                    '</div>';
            if (remarkObject.canUpdate) {
                panelBlockElement
                    .querySelector('.is-edit-remark-button')
                    .addEventListener('click', openEditRemarkModalFunction);
                panelBlockElement
                    .querySelector('.is-delete-remark-button')
                    .addEventListener('click', confirmDeleteRemarkFunction);
            }
            remarkPanelElement.append(panelBlockElement);
        }
    };
    const getRemarksFunction = () => {
        clearRemarkPanelFunction();
        remarkPanelElement.insertAdjacentHTML('beforeend', '<div class="panel-block is-block">' +
            '<p class="has-text-centered has-text-grey-lighter">' +
            '<i class="fas fa-2x fa-circle-notch fa-spin" aria-hidden="true"></i><br />' +
            '<em>Loading remarks...' +
            '</p>' +
            '</div>');
        cityssm.postJSON('/tickets/doGetRemarks', {
            ticketID
        }, (responseRemarkList) => {
            remarkList = responseRemarkList;
            populateRemarksPanelFunction();
        });
    };
    document
        .querySelector('#is-add-remark-button')
        .addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        let addRemarkCloseModalFunction;
        const submitFunction = (formEvent) => {
            formEvent.preventDefault();
            cityssm.postJSON('/tickets/doAddRemark', formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    addRemarkCloseModalFunction();
                    getRemarksFunction();
                }
            });
        };
        cityssm.openHtmlModal('ticket-addRemark', {
            onshow(modalElement) {
                ;
                document.querySelector('#addRemark--ticketID').value = ticketID;
                modalElement
                    .querySelector('form')
                    .addEventListener('submit', submitFunction);
            },
            onshown(_modalElement, closeModalFunction) {
                addRemarkCloseModalFunction = closeModalFunction;
            }
        });
    });
    populateRemarksPanelFunction();
})();
