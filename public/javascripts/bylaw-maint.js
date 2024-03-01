"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const bylawFilterElement = document.querySelector('#bylawFilter--bylaw');
    const bylawResultsElement = document.querySelector('#bylawResults');
    let bylawList = exports.bylaws;
    delete exports.bylaws;
    function openUpdateOffencesModal(clickEvent) {
        clickEvent.preventDefault();
        const listIndex = Number.parseInt(clickEvent.currentTarget.dataset.index ?? '', 10);
        const bylaw = bylawList[listIndex];
        let updateOffencesCloseModalFunction;
        function updateFunction(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(pts.urlPrefix + '/admin/doUpdateOffencesByBylaw', formEvent.currentTarget, (rawResponseJSON) => {
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
                ;
                document.querySelector('#updateOffences--bylawNumber').value = bylaw.bylawNumber;
                document.querySelector('#updateOffences--bylawDescription').value = bylaw.bylawDescription;
                document.querySelector('#updateOffences--offenceAmount').value = (bylaw.offenceAmountMin ?? 0).toFixed(2);
                document.querySelector('#updateOffences--discountDays').value = (bylaw.discountDaysMin ?? 0).toString();
                document.querySelector('#updateOffences--discountOffenceAmount').value = (bylaw.discountOffenceAmountMin ?? 0).toFixed(2);
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                updateOffencesCloseModalFunction = closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', updateFunction);
            },
            onhidden() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function openEditBylawModalFunction(clickEvent) {
        clickEvent.preventDefault();
        const listIndex = Number.parseInt(clickEvent.currentTarget.dataset.index ?? '', 10);
        const bylaw = bylawList[listIndex];
        let editBylawCloseModalFunction;
        function deleteFunction() {
            cityssm.postJSON(pts.urlPrefix + '/admin/doDeleteBylaw', {
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
            cityssm.postJSON(pts.urlPrefix + '/admin/doUpdateBylaw', formEvent.currentTarget, (rawResponseJSON) => {
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
                bulmaJS.toggleHtmlClipped();
                editBylawCloseModalFunction = closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', editFunction);
                modalElement
                    .querySelector('.is-delete-button')
                    ?.addEventListener('click', confirmDeleteFunction);
            },
            onhidden() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function renderBylawListFunction() {
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
                offenceAmountRange = `$${bylaw.offenceAmountMin.toFixed(2)}`;
                if (bylaw.offenceAmountMin !== bylaw.offenceAmountMax) {
                    offenceAmountRange += ` to $${(bylaw.offenceAmountMax ?? 0).toFixed(2)}`;
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
            ${(bylaw.offenceCount ?? 0).toString()}
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
    document
        .querySelector('#is-add-bylaw-button')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        let addBylawCloseModalFunction;
        function addFunction(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(pts.urlPrefix + '/admin/doAddBylaw', formEvent.currentTarget, (rawResponseJSON) => {
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
                    cityssm.alertModal('By-Law Not Added', responseJSON.message ?? '', 'OK', 'danger');
                }
            });
        }
        cityssm.openHtmlModal('bylaw-add', {
            onshown(modalElement, closeModalFunction) {
                addBylawCloseModalFunction = closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', addFunction);
            }
        });
    });
})();
