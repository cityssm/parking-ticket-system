"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a, _b, _c, _d, _e;
    const offenceMap = new Map();
    const offenceAccountNumberPatternString = exports.accountNumberPattern;
    delete exports.accountNumberPattern;
    const locationMap = new Map();
    const limitResultsCheckboxElement = document.querySelector('#offenceFilter--limitResults');
    const resultsElement = document.querySelector('#offenceResults');
    const locationInputElement = document.querySelector('#offenceFilter--location');
    const locationTextElement = document.querySelector('#offenceFilter--locationText');
    let locationKeyFilterIsSet = false;
    let locationKeyFilter = '';
    const bylawMap = new Map();
    const bylawInputElement = document.querySelector('#offenceFilter--bylaw');
    const bylawTextElement = document.querySelector('#offenceFilter--bylawText');
    let bylawNumberFilterIsSet = false;
    let bylawNumberFilter = '';
    function getOffenceMapKey(bylawNumber, locationKey) {
        return bylawNumber + '::::' + locationKey;
    }
    function loadOffenceMap(offenceList) {
        offenceMap.clear();
        for (const offence of offenceList) {
            const offenceMapKey = getOffenceMapKey(offence.bylawNumber, offence.locationKey);
            offenceMap.set(offenceMapKey, offence);
        }
    }
    function openEditOffenceModal(clickEvent) {
        var _a, _b;
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        const offenceMapKey = getOffenceMapKey((_a = buttonElement.dataset.bylawNumber) !== null && _a !== void 0 ? _a : '', (_b = buttonElement.dataset.locationKey) !== null && _b !== void 0 ? _b : '');
        const offence = offenceMap.get(offenceMapKey);
        const location = locationMap.get(offence.locationKey);
        const bylaw = bylawMap.get(offence.bylawNumber);
        let editOffenceModalCloseFunction;
        function doDelete() {
            cityssm.postJSON('/admin/doDeleteOffence', {
                bylawNumber: offence.bylawNumber,
                locationKey: offence.locationKey
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    loadOffenceMap(responseJSON.offences);
                    editOffenceModalCloseFunction();
                    renderOffences();
                }
            });
        }
        function confirmDelete(deleteClickEvent) {
            deleteClickEvent.preventDefault();
            bulmaJS.confirm({
                title: 'Remove Offence',
                message: 'Are you sure you want to remove this offence?',
                contextualColorName: 'warning',
                okButton: {
                    text: 'Yes, Remove Offence',
                    callbackFunction: doDelete
                }
            });
        }
        function doSubmit(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON('/admin/doUpdateOffence', formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    loadOffenceMap(responseJSON.offences);
                    editOffenceModalCloseFunction();
                    renderOffences();
                }
            });
        }
        cityssm.openHtmlModal('offence-edit', {
            onshow() {
                var _a, _b;
                ;
                document.querySelector('#offenceEdit--locationKey').value = offence.locationKey;
                document.querySelector('#offenceEdit--bylawNumber').value = offence.bylawNumber;
                document.querySelector('#offenceEdit--locationName').textContent = location.locationName;
                document.querySelector('#offenceEdit--locationClass').textContent = pts.getLocationClass(location.locationClassKey).locationClass;
                document.querySelector('#offenceEdit--bylawNumberSpan').textContent =
                    (_a = bylaw === null || bylaw === void 0 ? void 0 : bylaw.bylawNumber) !== null && _a !== void 0 ? _a : '';
                document.querySelector('#offenceEdit--bylawDescription').textContent =
                    (_b = bylaw === null || bylaw === void 0 ? void 0 : bylaw.bylawDescription) !== null && _b !== void 0 ? _b : '';
                document.querySelector('#offenceEdit--parkingOffence').value = offence.parkingOffence;
                document.querySelector('#offenceEdit--offenceAmount').value = offence.offenceAmount.toFixed(2);
                document.querySelector('#offenceEdit--discountOffenceAmount').value = offence.discountOffenceAmount.toFixed(2);
                document.querySelector('#offenceEdit--discountDays').value = offence.discountDays.toString();
                const accountNumberElement = document.querySelector('#offenceEdit--accountNumber');
                accountNumberElement.value = offence.accountNumber;
                accountNumberElement.setAttribute('pattern', offenceAccountNumberPatternString);
            },
            onshown(modalElement, closeModalFunction) {
                var _a, _b;
                bulmaJS.toggleHtmlClipped();
                editOffenceModalCloseFunction = closeModalFunction;
                (_a = document
                    .querySelector('#form--offenceEdit')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doSubmit);
                (_b = modalElement
                    .querySelector('.is-delete-button')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', confirmDelete);
            },
            onhidden() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function addOffence(bylawNumber, locationKey, returnAndRenderOffences, callbackFunction) {
        cityssm.postJSON('/admin/doAddOffence', {
            bylawNumber,
            locationKey,
            returnOffences: returnAndRenderOffences
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success && returnAndRenderOffences) {
                loadOffenceMap(responseJSON.offences);
                renderOffences();
            }
            if (callbackFunction !== undefined) {
                callbackFunction(responseJSON);
            }
        });
    }
    function openAddOffenceFromListModal() {
        let doRefreshOnClose = false;
        function addFunction(clickEvent) {
            var _a, _b;
            clickEvent.preventDefault();
            const linkElement = clickEvent.currentTarget;
            const bylawNumber = (_a = linkElement.dataset.bylawNumber) !== null && _a !== void 0 ? _a : '';
            const locationKey = (_b = linkElement.dataset.locationKey) !== null && _b !== void 0 ? _b : '';
            addOffence(bylawNumber, locationKey, false, (responseJSON) => {
                if (responseJSON.success) {
                    linkElement.remove();
                    doRefreshOnClose = true;
                }
            });
        }
        cityssm.openHtmlModal('offence-addFromList', {
            onshow(modalElement) {
                let titleHTML = '';
                let selectedHTML = '';
                if (locationKeyFilterIsSet) {
                    titleHTML = 'Select By-Laws';
                    const location = locationMap.get(locationKeyFilter);
                    const locationClass = pts.getLocationClass(location.locationClassKey);
                    selectedHTML = `${cityssm.escapeHTML(location.locationName)}<br />
            <span class="is-size-7">
            ${cityssm.escapeHTML(locationClass.locationClass)}
            </span>`;
                }
                else {
                    titleHTML = 'Select Locations';
                    const bylaw = bylawMap.get(bylawNumberFilter);
                    selectedHTML = `${cityssm.escapeHTML(bylaw.bylawNumber)}<br />
            <span class="is-size-7">
            ${bylaw.bylawDescription}
            </span>`;
                }
                modalElement.querySelector('.modal-card-title').innerHTML = titleHTML;
                document.querySelector('#addContainer--selected').innerHTML =
                    selectedHTML;
            },
            onshown() {
                const listElement = document.createElement('div');
                listElement.className = 'panel';
                let displayCount = 0;
                if (locationKeyFilterIsSet) {
                    for (const bylaw of bylawMap.values()) {
                        const offenceMapKey = getOffenceMapKey(bylaw.bylawNumber, locationKeyFilter);
                        if (offenceMap.has(offenceMapKey)) {
                            continue;
                        }
                        displayCount += 1;
                        const linkElement = document.createElement('a');
                        linkElement.className = 'panel-block is-block';
                        linkElement.dataset.bylawNumber = bylaw.bylawNumber;
                        linkElement.dataset.locationKey = locationKeyFilter;
                        linkElement.innerHTML = `${cityssm.escapeHTML(bylaw.bylawNumber)}<br />
              <span class="is-size-7">
              ${cityssm.escapeHTML(bylaw.bylawDescription)}
              </span>`;
                        linkElement.addEventListener('click', addFunction);
                        listElement.append(linkElement);
                    }
                }
                else {
                    for (const location of locationMap.values()) {
                        const offenceMapKey = getOffenceMapKey(bylawNumberFilter, location.locationKey);
                        if (offenceMap.has(offenceMapKey)) {
                            continue;
                        }
                        displayCount += 1;
                        const linkElement = document.createElement('a');
                        linkElement.className = 'panel-block is-block';
                        linkElement.dataset.bylawNumber = bylawNumberFilter;
                        linkElement.dataset.locationKey = location.locationKey;
                        linkElement.innerHTML = `${cityssm.escapeHTML(location.locationName)}<br />
              <span class="is-size-7">
              ${cityssm.escapeHTML(pts.getLocationClass(location.locationClassKey).locationClass)}
              </span>`;
                        linkElement.addEventListener('click', addFunction);
                        listElement.append(linkElement);
                    }
                }
                const addResultsElement = document.querySelector('#addContainer--results');
                cityssm.clearElement(addResultsElement);
                if (displayCount === 0) {
                    addResultsElement.innerHTML = `<div class="message is-info">
            <div class="message-body">There are no offence records available for creation.</div>
            </div>`;
                }
                else {
                    addResultsElement.append(listElement);
                }
            },
            onremoved() {
                if (doRefreshOnClose) {
                    cityssm.postJSON('/offences/doGetAllOffences', {}, (rawResponseJSON) => {
                        const offenceList = rawResponseJSON;
                        loadOffenceMap(offenceList);
                        renderOffences();
                    });
                }
            }
        });
    }
    function renderOffences() {
        var _a, _b;
        const tbodyElement = document.createElement('tbody');
        let matchCount = 0;
        const displayLimit = limitResultsCheckboxElement.checked
            ? Number.parseInt(limitResultsCheckboxElement.value, 10)
            : offenceMap.size;
        for (const offence of offenceMap.values()) {
            if (matchCount >= displayLimit) {
                continue;
            }
            if ((locationKeyFilterIsSet && locationKeyFilter !== offence.locationKey) ||
                (bylawNumberFilterIsSet && bylawNumberFilter !== offence.bylawNumber)) {
                continue;
            }
            const location = locationMap.get(offence.locationKey);
            if (!location) {
                continue;
            }
            const bylaw = bylawMap.get(offence.bylawNumber);
            if (!bylaw) {
                continue;
            }
            matchCount += 1;
            if (matchCount > displayLimit) {
                continue;
            }
            const trElement = document.createElement('tr');
            trElement.innerHTML = `<td class="has-border-right-width-2">
          ${cityssm.escapeHTML(location.locationName)}<br />
          <span class="is-size-7">
            ${cityssm.escapeHTML(pts.getLocationClass(location.locationClassKey).locationClass)}
          </span>
        </td>
        <td class="has-border-right-width-2">
          <strong>${cityssm.escapeHTML(bylaw.bylawNumber)}</strong><br />
          <span class="is-size-7">
            ${cityssm.escapeHTML(bylaw.bylawDescription)}
          </span>
        </td>
        <td class="has-text-right has-tooltip-bottom" data-tooltip="Set Rate">
          $${offence.offenceAmount.toFixed(2)}<br />
          <span class="is-size-7">
            ${offence.accountNumber}
          </span>
        </td>
      <td class="has-text-right has-tooltip-bottom" data-tooltip="Discount Rate">
        $${offence.discountOffenceAmount.toFixed(2)}<br />
        <span class="is-size-7">
        ${offence.discountDays.toString()} day${offence.discountDays === 1 ? '' : 's'}
        </span>
      </td>
      <td class="has-border-right-width-2">
        <div class="is-size-7">
          ${cityssm.escapeHTML(offence.parkingOffence)}
        </div>
      </td>
      <td class="has-text-right">
        <button class="button is-small"
          data-bylaw-number="${offence.bylawNumber}"
          data-location-key="${offence.locationKey}" type="button">
          <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
          <span>Edit</span>
        </button>
      </td>`;
            (_a = trElement
                .querySelector('button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', openEditOffenceModal);
            tbodyElement.append(trElement);
        }
        cityssm.clearElement(resultsElement);
        if (matchCount === 0) {
            resultsElement.innerHTML = `<div class="message is-info">
        <div class="message-body">
        <p>There are no offences that match the given criteria.</p>
        </div>
        </div>`;
            return;
        }
        resultsElement.innerHTML = `<table class="table is-striped is-hoverable is-fullwidth">
      <thead><tr>
        <th class="has-border-right-width-2">Location</th>
        <th class="has-border-right-width-2">By-Law</th>
        <th class="has-border-right-width-2" colspan="3">Offence</th>
        <th class="has-width-50"></th>
      </tr></thead>
      </table>`;
        (_b = resultsElement.querySelector('table')) === null || _b === void 0 ? void 0 : _b.append(tbodyElement);
        if (matchCount > displayLimit) {
            resultsElement.insertAdjacentHTML('afterbegin', `<div class="message is-warning">
          <div class="message-body has-text-centered">Limit Reached</div>
          </div>`);
        }
    }
    (_a = document
        .querySelector('#is-add-offence-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        if (locationKeyFilterIsSet && bylawNumberFilterIsSet) {
            const bylaw = bylawMap.get(bylawNumberFilter);
            const location = locationMap.get(locationKeyFilter);
            bulmaJS.confirm({
                title: 'Create Offence?',
                message: `<p class="has-text-centered">Are you sure you want to create the offence record below?</p>
            <div class="columns my-4">
            <div class="column has-text-centered">
              ${cityssm.escapeHTML(location.locationName)}<br />
              <span class="is-size-7">
              ${cityssm.escapeHTML(pts.getLocationClass(location.locationClassKey).locationClass)}
              </span>
            </div>
            <div class="column has-text-centered">
              ${cityssm.escapeHTML(bylaw.bylawNumber)}<br />
              <span class="is-size-7">
                ${cityssm.escapeHTML(bylaw.bylawDescription)}
              </span>
            </div>
            </div>`,
                messageIsHtml: true,
                contextualColorName: 'info',
                okButton: {
                    text: 'Yes, Create Offence',
                    callbackFunction: () => {
                        addOffence(bylawNumberFilter, locationKeyFilter, true, (responseJSON) => {
                            var _a, _b, _c;
                            if (!responseJSON.success) {
                                bulmaJS.alert({
                                    title: 'Offence Not Added',
                                    message: (_a = responseJSON.message) !== null && _a !== void 0 ? _a : '',
                                    contextualColorName: 'danger'
                                });
                            }
                            else if (((_b = responseJSON.message) !== null && _b !== void 0 ? _b : '') !== '') {
                                bulmaJS.alert({
                                    title: 'Offence Added Successfully',
                                    message: (_c = responseJSON.message) !== null && _c !== void 0 ? _c : '',
                                    contextualColorName: 'warning'
                                });
                            }
                        });
                    }
                }
            });
        }
        else if (locationKeyFilterIsSet || bylawNumberFilterIsSet) {
            openAddOffenceFromListModal();
        }
        else {
            bulmaJS.alert({
                title: 'How to Create a New Offence',
                message: 'To add an offence, use the main filters to select either a location, a by-law, or both.',
                contextualColorName: 'warning'
            });
        }
    });
    function clearLocationFilter() {
        locationInputElement.value = '';
        cityssm.clearElement(locationTextElement);
        locationKeyFilter = '';
        locationKeyFilterIsSet = false;
    }
    function openSelectLocationFilterModal() {
        let selectLocationCloseModalFunction;
        function doSelect(clickEvent) {
            var _a;
            clickEvent.preventDefault();
            const location = locationMap.get((_a = clickEvent.currentTarget.dataset.locationKey) !== null && _a !== void 0 ? _a : '');
            locationKeyFilterIsSet = true;
            locationKeyFilter = location.locationKey;
            locationInputElement.value = location.locationName;
            selectLocationCloseModalFunction();
            renderOffences();
        }
        cityssm.openHtmlModal('location-select', {
            onshow() {
                const listElement = document.createElement('div');
                listElement.className = 'panel mb-4';
                for (const location of locationMap.values()) {
                    const linkElement = document.createElement('a');
                    linkElement.className = 'panel-block is-block';
                    linkElement.dataset.locationKey = location.locationKey;
                    linkElement.setAttribute('href', '#');
                    linkElement.innerHTML = `<div class="level">
            <div class="level-left">
              ${cityssm.escapeHTML(location.locationName)}
            </div>
            <div class="level-right">
              ${cityssm.escapeHTML(pts.getLocationClass(location.locationClassKey).locationClass)}
            </div>
            </div>`;
                    linkElement.addEventListener('click', doSelect);
                    listElement.append(linkElement);
                }
                const listContainerElement = document.querySelector('#container--parkingLocations');
                cityssm.clearElement(listContainerElement);
                listContainerElement.append(listElement);
            },
            onshown(_modalElement, closeModalFunction) {
                selectLocationCloseModalFunction = closeModalFunction;
            }
        });
    }
    locationInputElement.addEventListener('dblclick', openSelectLocationFilterModal);
    (_b = document
        .querySelector('#is-select-location-filter-button')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', openSelectLocationFilterModal);
    (_c = document
        .querySelector('#is-clear-location-filter-button')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
        clearLocationFilter();
        renderOffences();
    });
    if (!locationKeyFilterIsSet) {
        clearLocationFilter();
    }
    function clearBylawFilter() {
        bylawInputElement.value = '';
        cityssm.clearElement(bylawTextElement);
        bylawNumberFilter = '';
        bylawNumberFilterIsSet = false;
    }
    function openSelectBylawFilterModal() {
        let selectBylawCloseModalFunction;
        function doSelect(clickEvent) {
            var _a;
            clickEvent.preventDefault();
            const bylaw = bylawMap.get((_a = clickEvent.currentTarget.dataset.bylawNumber) !== null && _a !== void 0 ? _a : '');
            bylawNumberFilterIsSet = true;
            bylawNumberFilter = bylaw.bylawNumber;
            bylawInputElement.value = bylaw.bylawNumber;
            bylawTextElement.textContent = bylaw.bylawDescription;
            selectBylawCloseModalFunction();
            renderOffences();
        }
        cityssm.openHtmlModal('bylaw-select', {
            onshow() {
                const listElement = document.createElement('div');
                listElement.className = 'panel mb-4';
                for (const bylaw of bylawMap.values()) {
                    const linkElement = document.createElement('a');
                    linkElement.className = 'panel-block is-block';
                    linkElement.dataset.bylawNumber = bylaw.bylawNumber;
                    linkElement.setAttribute('href', '#');
                    linkElement.innerHTML = `${cityssm.escapeHTML(bylaw.bylawNumber)}<br />
            <span class="is-size-7">
            ${cityssm.escapeHTML(bylaw.bylawDescription)}
            </span>`;
                    linkElement.addEventListener('click', doSelect);
                    listElement.append(linkElement);
                }
                const listContainerElement = document.querySelector('#container--parkingBylaws');
                cityssm.clearElement(listContainerElement);
                listContainerElement.append(listElement);
            },
            onshown(_modalElement, closeModalFunction) {
                selectBylawCloseModalFunction = closeModalFunction;
            }
        });
    }
    bylawInputElement.addEventListener('dblclick', openSelectBylawFilterModal);
    (_d = document
        .querySelector('#is-select-bylaw-filter-button')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', openSelectBylawFilterModal);
    (_e = document
        .querySelector('#is-clear-bylaw-filter-button')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
        clearBylawFilter();
        renderOffences();
    });
    if (!bylawNumberFilterIsSet) {
        clearBylawFilter();
    }
    limitResultsCheckboxElement.addEventListener('change', renderOffences);
    for (const location of exports.locations) {
        locationMap.set(location.locationKey, location);
    }
    delete exports.locations;
    for (const bylaw of exports.bylaws) {
        bylawMap.set(bylaw.bylawNumber, bylaw);
    }
    delete exports.bylaws;
    loadOffenceMap(exports.offences);
    delete exports.offences;
    pts.getDefaultConfigProperty('locationClasses', renderOffences);
})();
