"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a, _b, _c, _d, _e;
    const ticketId = document.querySelector('#ticket--ticketId').value;
    const isCreate = ticketId === '';
    const formMessageElement = document.querySelector('#container--form-message');
    function setUnsavedChangesFunction() {
        cityssm.enableNavBlocker();
        formMessageElement.innerHTML = `<span class="tag is-light is-info is-medium">
      <span class="icon"><i class="fas fa-exclamation-triangle" aria-hidden="true"></i></span>
      <span>Unsaved Changes</span>
      </span>`;
    }
    const inputElements = document.querySelectorAll('.input, .select, .textarea');
    for (const inputElement of inputElements) {
        inputElement.addEventListener('change', setUnsavedChangesFunction);
    }
    (_a = document
        .querySelector('#form--ticket')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
        const ticketNumber = document.querySelector('#ticket--ticketNumber').value;
        formMessageElement.innerHTML = `<span class="tag is-light is-info is-medium">
        <span>Saving ticket... </span>
        <span class="icon"><i class="fas fa-circle-notch fa-spin" aria-hidden="true"></i></span>
        </span>`;
        cityssm.postJSON(isCreate ? '/tickets/doCreateTicket' : '/tickets/doUpdateTicket', formEvent.currentTarget, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                cityssm.disableNavBlocker();
                formMessageElement.innerHTML = `<span class="tag is-light is-success is-medium">
              <span class="icon"><i class="fas fa-check" aria-hidden="true"></i></span>
              <span>Saved Successfully</span>
              </span>`;
            }
            else {
                setUnsavedChangesFunction();
                cityssm.alertModal('Ticket Not Saved', responseJSON.message, 'OK', 'danger');
            }
            if (responseJSON.success && isCreate) {
                cityssm.openHtmlModal('ticket-createSuccess', {
                    onshow() {
                        var _a, _b;
                        ;
                        document.querySelector('#createSuccess--ticketNumber').textContent = ticketNumber;
                        (_a = document
                            .querySelector('#createSuccess--editTicketButton')) === null || _a === void 0 ? void 0 : _a.setAttribute('href', `/tickets/${responseJSON.ticketId.toString()}/edit`);
                        (_b = document
                            .querySelector('#createSuccess--newTicketButton')) === null || _b === void 0 ? void 0 : _b.setAttribute('href', `/tickets/new/${responseJSON.nextTicketNumber}`);
                    }
                });
            }
        });
    });
    function doDelete() {
        cityssm.postJSON('/tickets/doDeleteTicket', {
            ticketId
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                window.location.href = '/tickets';
            }
        });
    }
    (_b = document
        .querySelector('#is-delete-ticket-button')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        bulmaJS.confirm({
            title: 'Delete Ticket',
            message: 'Are you sure you want to delete this ticket record?',
            contextualColorName: 'danger',
            okButton: {
                text: 'Yes, Delete Ticket',
                callbackFunction: doDelete
            }
        });
    });
    pts.getDefaultConfigProperty('locationClasses', () => {
        var _a, _b;
        let locationLookupCloseModalFunction;
        let locationList = [];
        function clearLocationFunction(clickEvent) {
            clickEvent.preventDefault();
            document.querySelector('#ticket--locationKey').value = '';
            document.querySelector('#ticket--locationName').value = '';
            locationLookupCloseModalFunction();
            locationList = [];
        }
        function setLocationFunction(clickEvent) {
            var _a;
            clickEvent.preventDefault();
            const locationObject = locationList[Number.parseInt((_a = clickEvent.currentTarget.dataset.index) !== null && _a !== void 0 ? _a : '', 10)];
            document.querySelector('#ticket--locationKey').value = locationObject.locationKey;
            document.querySelector('#ticket--locationName').value = locationObject.locationName;
            locationLookupCloseModalFunction();
            locationList = [];
        }
        function populateLocationsFunction() {
            cityssm.postJSON('/offences/doGetAllLocations', {}, (rawResponseJSON) => {
                const locationListResponse = rawResponseJSON;
                locationList = locationListResponse;
                const listElement = document.createElement('div');
                listElement.className = 'panel mb-4';
                for (const [index, locationObject] of locationList.entries()) {
                    const locationClassObject = pts.getLocationClass(locationObject.locationClassKey);
                    const linkElement = document.createElement('a');
                    linkElement.className = 'panel-block is-block';
                    linkElement.dataset.index = index.toString();
                    linkElement.setAttribute('href', '#');
                    linkElement.addEventListener('click', setLocationFunction);
                    linkElement.innerHTML =
                        '<div class="level">' +
                            '<div class="level-left">' +
                            cityssm.escapeHTML(locationObject.locationName) +
                            '</div>' +
                            ((locationClassObject === null || locationClassObject === void 0 ? void 0 : locationClassObject.locationClass)
                                ? '<div class="level-right">' +
                                    '<span class="tag is-primary">' +
                                    cityssm.escapeHTML(locationClassObject.locationClass) +
                                    '</span>' +
                                    '</div>'
                                : '') +
                            '</div>';
                    listElement.append(linkElement);
                }
                const containerElement = document.querySelector('#container--parkingLocations');
                cityssm.clearElement(containerElement);
                containerElement.append(listElement);
            });
        }
        function openLocationLookupModalFunction(clickEvent) {
            clickEvent.preventDefault();
            cityssm.openHtmlModal('ticket-setLocation', {
                onshown(_modalElement, closeModalFunction) {
                    var _a;
                    locationLookupCloseModalFunction = closeModalFunction;
                    populateLocationsFunction();
                    (_a = document
                        .querySelector('#is-clear-location-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', clearLocationFunction);
                },
                onremoved() {
                    ;
                    document.querySelector('#is-location-lookup-button').focus();
                }
            });
        }
        (_a = document
            .querySelector('#is-location-lookup-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', openLocationLookupModalFunction);
        (_b = document
            .querySelector('#ticket--locationName')) === null || _b === void 0 ? void 0 : _b.addEventListener('dblclick', openLocationLookupModalFunction);
    });
    let bylawLookupCloseModalFunction;
    let offenceList = [];
    let listItemElements = [];
    function clearBylawOffenceFunction(clickEvent) {
        var _a, _b, _c, _d, _e, _f;
        clickEvent.preventDefault();
        document.querySelector('#ticket--bylawNumber').value = '';
        const offenceAmountElement = document.querySelector('#ticket--offenceAmount');
        offenceAmountElement.classList.add('is-readonly');
        offenceAmountElement.setAttribute('readonly', 'readonly');
        (_b = (_a = offenceAmountElement
            .closest('.field')) === null || _a === void 0 ? void 0 : _a.querySelector('.is-unlock-field-button')) === null || _b === void 0 ? void 0 : _b.removeAttribute('disabled');
        offenceAmountElement.value = '';
        const discountOffenceAmountElement = document.querySelector('#ticket--discountOffenceAmount');
        discountOffenceAmountElement.classList.add('is-readonly');
        discountOffenceAmountElement.setAttribute('readonly', 'readonly');
        (_d = (_c = discountOffenceAmountElement
            .closest('.field')) === null || _c === void 0 ? void 0 : _c.querySelector('.is-unlock-field-button')) === null || _d === void 0 ? void 0 : _d.removeAttribute('disabled');
        discountOffenceAmountElement.value = '';
        const discountDaysElement = document.querySelector('#ticket--discountDays');
        discountDaysElement.classList.add('is-readonly');
        discountDaysElement.setAttribute('readonly', 'readonly');
        (_f = (_e = discountDaysElement
            .closest('.field')) === null || _e === void 0 ? void 0 : _e.querySelector('.is-unlock-field-button')) === null || _f === void 0 ? void 0 : _f.removeAttribute('disabled');
        discountDaysElement.value = '';
        document.querySelector('#ticket--parkingOffence').value = '';
        bylawLookupCloseModalFunction();
        offenceList = [];
    }
    function setBylawOffenceFunction(clickEvent) {
        var _a, _b, _c, _d, _e, _f, _g;
        clickEvent.preventDefault();
        const offenceObject = offenceList[Number.parseInt((_a = clickEvent.currentTarget.dataset.index) !== null && _a !== void 0 ? _a : '', 10)];
        document.querySelector('#ticket--bylawNumber').value = offenceObject.bylawNumber;
        const offenceAmountElement = document.querySelector('#ticket--offenceAmount');
        offenceAmountElement.classList.add('is-readonly');
        offenceAmountElement.setAttribute('readonly', 'readonly');
        (_c = (_b = offenceAmountElement
            .closest('.field')) === null || _b === void 0 ? void 0 : _b.querySelector('.is-unlock-field-button')) === null || _c === void 0 ? void 0 : _c.removeAttribute('disabled');
        offenceAmountElement.value = offenceObject.offenceAmount.toFixed(2);
        const discountOffenceAmountElement = document.querySelector('#ticket--discountOffenceAmount');
        discountOffenceAmountElement.classList.add('is-readonly');
        discountOffenceAmountElement.setAttribute('readonly', 'readonly');
        (_e = (_d = discountOffenceAmountElement
            .closest('.field')) === null || _d === void 0 ? void 0 : _d.querySelector('.is-unlock-field-button')) === null || _e === void 0 ? void 0 : _e.removeAttribute('disabled');
        discountOffenceAmountElement.value =
            offenceObject.discountOffenceAmount.toFixed(2);
        const discountDaysElement = document.querySelector('#ticket--discountDays');
        discountDaysElement.classList.add('is-readonly');
        discountDaysElement.setAttribute('readonly', 'readonly');
        (_g = (_f = discountDaysElement
            .closest('.field')) === null || _f === void 0 ? void 0 : _f.querySelector('.is-unlock-field-button')) === null || _g === void 0 ? void 0 : _g.removeAttribute('disabled');
        discountDaysElement.value = offenceObject.discountDays.toString();
        document.querySelector('#ticket--parkingOffence').value = offenceObject.bylawDescription;
        bylawLookupCloseModalFunction();
        offenceList = [];
    }
    function populateBylawsFunction() {
        const locationKey = document.querySelector('#ticket--locationKey').value;
        cityssm.postJSON('/offences/doGetOffencesByLocation', {
            locationKey
        }, (rawResponseJSON) => {
            const offenceListResponse = rawResponseJSON;
            offenceList = offenceListResponse;
            listItemElements = [];
            const listElement = document.createElement('div');
            listElement.className = 'panel mb-4';
            for (const [index, offenceObject] of offenceList.entries()) {
                const linkElement = document.createElement('a');
                linkElement.className = 'panel-block is-block';
                linkElement.dataset.index = index.toString();
                linkElement.setAttribute('href', '#');
                linkElement.addEventListener('click', setBylawOffenceFunction);
                linkElement.innerHTML = `<div class="columns">
            <div class="column">
              <span class="has-text-weight-semibold">
                ${cityssm.escapeHTML(offenceObject.bylawNumber)}
              </span><br />
              <small>
                ${cityssm.escapeHTML(offenceObject.bylawDescription)}
              </small>
            </div>
            <div class="column is-narrow has-text-weight-semibold">
              $${offenceObject.offenceAmount.toFixed(2)}
            </div></div>`;
                listElement.append(linkElement);
                listItemElements.push(linkElement);
            }
            const containerElement = document.querySelector('#container--bylawNumbers');
            cityssm.clearElement(containerElement);
            containerElement.append(listElement);
        });
    }
    function filterBylawsFunction(keyupEvent) {
        const searchStringSplit = keyupEvent.currentTarget.value
            .trim()
            .toLowerCase()
            .split(' ');
        for (const [recordIndex, offenceRecord] of offenceList.entries()) {
            let displayRecord = true;
            for (const searchPiece of searchStringSplit) {
                if (!offenceRecord.bylawNumber.toLowerCase().includes(searchPiece) &&
                    !offenceRecord.bylawDescription.toLowerCase().includes(searchPiece)) {
                    displayRecord = false;
                    break;
                }
            }
            if (displayRecord) {
                listItemElements[recordIndex].classList.remove('is-hidden');
            }
            else {
                listItemElements[recordIndex].classList.add('is-hidden');
            }
        }
    }
    function openBylawLookupModalFunction(clickEvent) {
        clickEvent.preventDefault();
        cityssm.openHtmlModal('ticket-setBylawOffence', {
            onshown(_modalElement, closeModalFunction) {
                var _a;
                bylawLookupCloseModalFunction = closeModalFunction;
                populateBylawsFunction();
                const searchStringElement = document.querySelector('#bylawLookup--searchStr');
                searchStringElement.focus();
                searchStringElement.addEventListener('keyup', filterBylawsFunction);
                (_a = document
                    .querySelector('#is-clear-bylaw-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', clearBylawOffenceFunction);
            },
            onremoved() {
                ;
                document.querySelector('#is-bylaw-lookup-button').focus();
            }
        });
    }
    (_c = document
        .querySelector('#is-bylaw-lookup-button')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', openBylawLookupModalFunction);
    (_d = document
        .querySelector('#ticket--bylawNumber')) === null || _d === void 0 ? void 0 : _d.addEventListener('dblclick', openBylawLookupModalFunction);
    {
        const licencePlateIsMissingCheckboxElement = document.querySelector('#ticket--licencePlateIsMissing');
        licencePlateIsMissingCheckboxElement.addEventListener('change', () => {
            var _a, _b, _c, _d, _e, _f;
            if (licencePlateIsMissingCheckboxElement.checked) {
                (_a = document
                    .querySelector('#ticket--licencePlateCountry')) === null || _a === void 0 ? void 0 : _a.removeAttribute('required');
                (_b = document
                    .querySelector('#ticket--licencePlateProvince')) === null || _b === void 0 ? void 0 : _b.removeAttribute('required');
                (_c = document
                    .querySelector('#ticket--licencePlateNumber')) === null || _c === void 0 ? void 0 : _c.removeAttribute('required');
            }
            else {
                (_d = document
                    .querySelector('#ticket--licencePlateCountry')) === null || _d === void 0 ? void 0 : _d.setAttribute('required', 'required');
                (_e = document
                    .querySelector('#ticket--licencePlateProvince')) === null || _e === void 0 ? void 0 : _e.setAttribute('required', 'required');
                (_f = document
                    .querySelector('#ticket--licencePlateNumber')) === null || _f === void 0 ? void 0 : _f.setAttribute('required', 'required');
            }
        });
    }
    function populateLicencePlateProvinceDatalistFunction() {
        const datalistElement = document.querySelector('#datalist--licencePlateProvince');
        cityssm.clearElement(datalistElement);
        const countryString = document.querySelector('#ticket--licencePlateCountry').value;
        const countryProperties = pts.getLicencePlateCountryProperties(countryString);
        if (countryProperties === null || countryProperties === void 0 ? void 0 : countryProperties.provinces) {
            const provincesList = Object.values(countryProperties.provinces);
            for (const province of provincesList) {
                const optionElement = document.createElement('option');
                optionElement.setAttribute('value', province.provinceShortName);
                datalistElement.append(optionElement);
            }
        }
    }
    (_e = document
        .querySelector('#ticket--licencePlateCountry')) === null || _e === void 0 ? void 0 : _e.addEventListener('change', populateLicencePlateProvinceDatalistFunction);
    pts.loadDefaultConfigProperties(populateLicencePlateProvinceDatalistFunction);
    function unlockFieldFunction(unlockButtonClickEvent) {
        var _a, _b;
        unlockButtonClickEvent.preventDefault();
        const unlockButtonElement = unlockButtonClickEvent.currentTarget;
        const inputTag = (_a = unlockButtonElement.dataset.unlock) !== null && _a !== void 0 ? _a : '';
        const readOnlyElement = (_b = unlockButtonElement
            .closest('.field')) === null || _b === void 0 ? void 0 : _b.querySelector(inputTag);
        readOnlyElement.removeAttribute('readonly');
        readOnlyElement.classList.remove('is-readonly');
        readOnlyElement.focus();
        unlockButtonElement.setAttribute('disabled', 'disabled');
    }
    const unlockButtonElements = document.querySelectorAll('.is-unlock-field-button');
    for (const unlockButtonElement of unlockButtonElements) {
        unlockButtonElement.addEventListener('click', unlockFieldFunction);
    }
})();
