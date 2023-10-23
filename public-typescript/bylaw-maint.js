"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a;
    const bylawFilterElement = document.querySelector('#bylawFilter--bylaw');
    const bylawResultsElement = document.querySelector('#bylawResults');
    let bylawList = exports.bylaws;
    delete exports.bylaws;
    function openUpdateOffencesModal(clickEvent) {
        var _a;
        clickEvent.preventDefault();
        const listIndex = Number.parseInt((_a = clickEvent.currentTarget.dataset.index) !== null && _a !== void 0 ? _a : '', 10);
        const bylaw = bylawList[listIndex];
        let updateOffencesCloseModalFunction;
        function updateFunction(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON('/admin/doUpdateOffencesByBylaw', formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    updateOffencesCloseModalFunction();
                    bylawList = responseJSON.bylaws;
                    renderBylawListFunction();
                }
            });
        }
        cityssm.openHtmlModal('bylaw-updateOffences', {
            onshow() {
                var _a, _b, _c;
                ;
                document.querySelector('#updateOffences--bylawNumber').value = bylaw.bylawNumber;
                document.querySelector('#updateOffences--bylawDescription').value = bylaw.bylawDescription;
                document.querySelector('#updateOffences--offenceAmount').value = ((_a = bylaw.offenceAmountMin) !== null && _a !== void 0 ? _a : 0).toFixed(2);
                document.querySelector('#updateOffences--discountDays').value = ((_b = bylaw.discountDaysMin) !== null && _b !== void 0 ? _b : 0).toString();
                document.querySelector('#updateOffences--discountOffenceAmount').value = ((_c = bylaw.discountOffenceAmountMin) !== null && _c !== void 0 ? _c : 0).toFixed(2);
            },
            onshown(modalElement, closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                updateOffencesCloseModalFunction = closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', updateFunction);
            },
            onhidden() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function openEditBylawModalFunction(clickEvent) {
        var _a;
        clickEvent.preventDefault();
        const listIndex = Number.parseInt((_a = clickEvent.currentTarget.dataset.index) !== null && _a !== void 0 ? _a : '', 10);
        const bylaw = bylawList[listIndex];
        let editBylawCloseModalFunction;
        function deleteFunction() {
            cityssm.postJSON('/admin/doDeleteBylaw', {
                bylawNumber: bylaw.bylawNumber
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    editBylawCloseModalFunction();
                    bylawList = responseJSON.bylaws;
                    renderBylawListFunction();
                }
            });
        }
        function confirmDeleteFunction(deleteClickEvent) {
            deleteClickEvent.preventDefault();
            cityssm.confirmModal('Delete By-Law', `Are you sure you want to remove by-law "${bylaw.bylawNumber}" from the list of available options?`, 'Yes, Remove By-Law', 'danger', deleteFunction);
        }
        function editFunction(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON('/admin/doUpdateBylaw', formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    editBylawCloseModalFunction();
                    bylawList = responseJSON.bylaws;
                    renderBylawListFunction();
                }
            });
        }
        cityssm.openHtmlModal('bylaw-edit', {
            onshow() {
                ;
                document.querySelector('#editBylaw--bylawNumber').value = bylaw.bylawNumber;
                document.querySelector('#editBylaw--bylawDescription').value = bylaw.bylawDescription;
            },
            onshown(modalElement, closeModalFunction) {
                var _a, _b;
                bulmaJS.toggleHtmlClipped();
                editBylawCloseModalFunction = closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', editFunction);
                (_b = modalElement
                    .querySelector('.is-delete-button')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', confirmDeleteFunction);
            },
            onhidden() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function renderBylawListFunction() {
        var _a, _b;
        let displayCount = 0;
        const bylawFilterSplit = bylawFilterElement.value
            .trim()
            .toLowerCase()
            .split(' ');
        const tbodyElement = document.createElement('tbody');
        for (const [bylawIndex, bylaw] of bylawList.entries()) {
            let showRecord = true;
            const bylawNumberLowerCase = bylaw.bylawNumber.toLowerCase();
            const bylawDescriptionLowerCase = bylaw.bylawDescription.toLowerCase();
            for (const searchStringPiece of bylawFilterSplit) {
                if (!bylawNumberLowerCase.includes(searchStringPiece) &&
                    !bylawDescriptionLowerCase.includes(searchStringPiece)) {
                    showRecord = false;
                    break;
                }
            }
            if (!showRecord) {
                continue;
            }
            displayCount += 1;
            const trElement = document.createElement('tr');
            let offenceAmountRange = '';
            let hasOffences = false;
            if (bylaw.offenceAmountMin) {
                hasOffences = true;
                offenceAmountRange = '$' + bylaw.offenceAmountMin.toFixed(2);
                if (bylaw.offenceAmountMin !== bylaw.offenceAmountMax) {
                    offenceAmountRange += ` to $${((_a = bylaw.offenceAmountMax) !== null && _a !== void 0 ? _a : 0).toFixed(2)}`;
                }
                offenceAmountRange = `<a class="has-tooltip-left" data-tooltip="Update Offence Amounts" data-index="${bylawIndex.toString()}" href="#">
          ${offenceAmountRange}
          </a>`;
            }
            else {
                offenceAmountRange = '(No Offences)';
            }
            trElement.innerHTML = `<td>
          <a data-index="${bylawIndex.toString()}" href="#">
            ${cityssm.escapeHTML(bylaw.bylawNumber)}
          </a>
          </td>
          <td class="has-border-right-width-2">
            ${cityssm.escapeHTML(bylaw.bylawDescription)}
          </td>
          <td class="has-text-right">
            ${((_b = bylaw.offenceCount) !== null && _b !== void 0 ? _b : 0).toString()}
          </td>
          <td class="has-text-right">
            ${offenceAmountRange}
          </td>`;
            trElement
                .querySelectorAll('a')[0]
                .addEventListener('click', openEditBylawModalFunction);
            if (hasOffences) {
                trElement
                    .querySelectorAll('a')[1]
                    .addEventListener('click', openUpdateOffencesModal);
            }
            tbodyElement.append(trElement);
        }
        cityssm.clearElement(bylawResultsElement);
        if (displayCount === 0) {
            bylawResultsElement.innerHTML = `<div class="message is-info">
        <div class="message-body">There are no by-laws that meet your search criteria.</div>
        </div>`;
            return;
        }
        bylawResultsElement.innerHTML = `<table class="table is-striped is-hoverable is-fullwidth">
        <thead><tr>
        <th>By-Law Number</th>
        <th class="has-border-right-width-2">Description</th>
        <th class="has-text-right">Total Offences</th>
        <th class="has-text-right">Offence Amount Range</th>
        </tr></thead>
      </table>`;
        bylawResultsElement.querySelector('table').append(tbodyElement);
    }
    bylawFilterElement.addEventListener('keyup', renderBylawListFunction);
    renderBylawListFunction();
    (_a = document
        .querySelector('#is-add-bylaw-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        let addBylawCloseModalFunction;
        function addFunction(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON('/admin/doAddBylaw', formEvent.currentTarget, (rawResponseJSON) => {
                var _a;
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    addBylawCloseModalFunction();
                    if (responseJSON.message !== undefined) {
                        cityssm.alertModal('By-Law Added', responseJSON.message, 'OK', 'warning');
                    }
                    bylawList = responseJSON.bylaws;
                    renderBylawListFunction();
                }
                else {
                    cityssm.alertModal('By-Law Not Added', (_a = responseJSON.message) !== null && _a !== void 0 ? _a : '', 'OK', 'danger');
                }
            });
        }
        cityssm.openHtmlModal('bylaw-add', {
            onshown(modalElement, closeModalFunction) {
                var _a;
                addBylawCloseModalFunction = closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', addFunction);
            }
        });
    });
})();
