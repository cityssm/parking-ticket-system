"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a;
    const ticketId = document.querySelector('#ticket--ticketId').value;
    const remarkPanelElement = document.querySelector('#is-remark-panel');
    let remarkList = exports.ticketRemarks;
    delete exports.ticketRemarks;
    function clearRemarkPanel() {
        const panelBlockElements = remarkPanelElement.querySelectorAll('.panel-block');
        for (const panelBlockElement of panelBlockElements) {
            panelBlockElement.remove();
        }
    }
    function confirmDeleteRemark(clickEvent) {
        const remarkIndex = clickEvent.currentTarget.dataset
            .remarkIndex;
        cityssm.confirmModal('Delete Remark?', 'Are you sure you want to delete this remark?', 'Yes, Delete', 'warning', () => {
            cityssm.postJSON('/tickets/doDeleteRemark', {
                ticketId,
                remarkIndex
            }, (resultJSON) => {
                if (resultJSON.success) {
                    getRemarks();
                }
            });
        });
    }
    function openEditRemarkModal(clickEvent) {
        clickEvent.preventDefault();
        let editRemarkCloseModalFunction;
        const index = Number.parseInt(clickEvent.currentTarget.dataset.index, 10);
        const remarkObject = remarkList[index];
        function doSubmit(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON('/tickets/doUpdateRemark', formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    editRemarkCloseModalFunction();
                    getRemarks();
                }
            });
        }
        cityssm.openHtmlModal('ticket-editRemark', {
            onshow(modalElement) {
                var _a;
                ;
                document.querySelector('#editRemark--ticketId').value = ticketId;
                document.querySelector('#editRemark--remarkIndex').value = remarkObject.remarkIndex.toString();
                document.querySelector('#editRemark--remark').value = remarkObject.remark;
                document.querySelector('#editRemark--remarkDateString').value = remarkObject.remarkDateString;
                document.querySelector('#editRemark--remarkTimeString').value = remarkObject.remarkTimeString;
                (_a = modalElement.querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doSubmit);
            },
            onshown(_modalElement, closeModalFunction) {
                editRemarkCloseModalFunction = closeModalFunction;
            }
        });
    }
    const populateRemarksPanelFunction = () => {
        var _a, _b;
        clearRemarkPanel();
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
                (_a = panelBlockElement
                    .querySelector('.is-edit-remark-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', openEditRemarkModal);
                (_b = panelBlockElement
                    .querySelector('.is-delete-remark-button')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', confirmDeleteRemark);
            }
            remarkPanelElement.append(panelBlockElement);
        }
    };
    function getRemarks() {
        clearRemarkPanel();
        remarkPanelElement.insertAdjacentHTML('beforeend', `<div class="panel-block is-block">
        <p class="has-text-centered has-text-grey-lighter">
        <i class="fas fa-2x fa-circle-notch fa-spin" aria-hidden="true"></i><br />
        <em>Loading remarks...</em>
        </p>
        </div>`);
        cityssm.postJSON('/tickets/doGetRemarks', {
            ticketId
        }, (responseRemarkList) => {
            remarkList = responseRemarkList;
            populateRemarksPanelFunction();
        });
    }
    (_a = document
        .querySelector('#is-add-remark-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        let addRemarkCloseModalFunction;
        const submitFunction = (formEvent) => {
            formEvent.preventDefault();
            cityssm.postJSON('/tickets/doAddRemark', formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    addRemarkCloseModalFunction();
                    getRemarks();
                }
            });
        };
        cityssm.openHtmlModal('ticket-addRemark', {
            onshow(modalElement) {
                var _a;
                ;
                document.querySelector('#addRemark--ticketId').value = ticketId;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', submitFunction);
            },
            onshown(_modalElement, closeModalFunction) {
                addRemarkCloseModalFunction = closeModalFunction;
            }
        });
    });
    populateRemarksPanelFunction();
})();
