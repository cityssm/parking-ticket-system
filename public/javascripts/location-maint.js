"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a;
    let locationClassKeyOptionsHTML = '';
    const locationClassKeyFilterElement = document.querySelector('#locationFilter--locationClassKey');
    const locationNameFilterElement = document.querySelector('#locationFilter--locationName');
    const locationResultsElement = document.querySelector('#locationResults');
    let locationList = exports.locations;
    delete exports.locations;
    function openEditLocationModalFunction(clickEvent) {
        var _a;
        clickEvent.preventDefault();
        const listIndex = Number.parseInt((_a = clickEvent.currentTarget.dataset.index) !== null && _a !== void 0 ? _a : '-1', 10);
        const location = locationList[listIndex];
        let editLocationCloseModalFunction;
        function deleteFunction() {
            cityssm.postJSON(`${pts.urlPrefix}/admin/doDeleteLocation`, {
                locationKey: location.locationKey
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    editLocationCloseModalFunction();
                    locationList = responseJSON.locations;
                    renderLocationListFunction();
                }
            });
        }
        function confirmDeleteFunction(deleteClickEvent) {
            deleteClickEvent.preventDefault();
            cityssm.confirmModal('Delete Location', `Are you sure you want to remove "${location.locationName}" from the list of available options?`, 'Yes, Remove Location', 'danger', deleteFunction);
        }
        function editFunction(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${pts.urlPrefix}/admin/doUpdateLocation`, formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    editLocationCloseModalFunction();
                    locationList = responseJSON.locations;
                    renderLocationListFunction();
                }
            });
        }
        cityssm.openHtmlModal('location-edit', {
            onshow() {
                ;
                document.querySelector('#editLocation--locationKey').value = location.locationKey;
                const locationClassKeyEditSelectElement = document.querySelector('#editLocation--locationClassKey');
                locationClassKeyEditSelectElement.innerHTML =
                    locationClassKeyOptionsHTML;
                if (locationClassKeyEditSelectElement.querySelector(`[value='${location.locationClassKey}']`) === null) {
                    locationClassKeyEditSelectElement.insertAdjacentHTML('beforeend', `<option value="${cityssm.escapeHTML(location.locationClassKey)}">
              ${cityssm.escapeHTML(location.locationClassKey)}
              </option>`);
                }
                locationClassKeyEditSelectElement.value = location.locationClassKey;
                document.querySelector('#editLocation--locationName').value = location.locationName;
            },
            onshown(modalElement, closeModalFunction) {
                var _a, _b;
                bulmaJS.toggleHtmlClipped();
                editLocationCloseModalFunction = closeModalFunction;
                (_a = document
                    .querySelector('#form--editLocation')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', editFunction);
                (_b = modalElement
                    .querySelector('.is-delete-button')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', confirmDeleteFunction);
            },
            onhidden() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function renderLocationListFunction() {
        var _a, _b;
        let displayCount = 0;
        const locationClassKeyFilter = locationClassKeyFilterElement.value;
        const locationNameFilterSplit = locationNameFilterElement.value
            .trim()
            .toLowerCase()
            .split(' ');
        const tbodyElement = document.createElement('tbody');
        for (const [locationIndex, location] of locationList.entries()) {
            if (locationClassKeyFilter !== '' &&
                locationClassKeyFilter !== location.locationClassKey) {
                continue;
            }
            let showRecord = true;
            const locationNameLowerCase = location.locationName.toLowerCase();
            for (const locationNamePiece of locationNameFilterSplit) {
                if (!locationNameLowerCase.includes(locationNamePiece)) {
                    showRecord = false;
                    break;
                }
            }
            if (!showRecord) {
                continue;
            }
            displayCount += 1;
            const locationClass = pts.getLocationClass(location.locationClassKey).locationClass;
            const trElement = document.createElement('tr');
            trElement.innerHTML = `<td>
          <a data-index="${locationIndex.toString()}" href="#">
          ${cityssm.escapeHTML(location.locationName)}
          </a>
        </td><td>
          ${cityssm.escapeHTML(locationClass)}
        </td>`;
            (_a = trElement
                .querySelector('a')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', openEditLocationModalFunction);
            tbodyElement.append(trElement);
        }
        cityssm.clearElement(locationResultsElement);
        if (displayCount === 0) {
            locationResultsElement.innerHTML = `<div class="message is-info">
          <div class="message-body">There are no locations that meet your search criteria.</div>
          </div>`;
            return;
        }
        locationResultsElement.innerHTML = `<table class="table is-fixed is-striped is-hoverable is-fullwidth">
        <thead><tr>
          <th>Location</th>
          <th>Class</th>
        </tr></thead>
        </table>`;
        (_b = locationResultsElement.querySelector('table')) === null || _b === void 0 ? void 0 : _b.append(tbodyElement);
    }
    locationClassKeyFilterElement.addEventListener('change', renderLocationListFunction);
    locationNameFilterElement.addEventListener('keyup', renderLocationListFunction);
    pts.getDefaultConfigProperty('locationClasses', (locationClassesList) => {
        locationClassKeyFilterElement.innerHTML =
            '<option value="">(All Location Classes)</option>';
        for (const locationClass of locationClassesList) {
            locationClassKeyOptionsHTML += `<option value="${cityssm.escapeHTML(locationClass.locationClassKey)}">
          ${cityssm.escapeHTML(locationClass.locationClass)}
          </option>`;
        }
        locationClassKeyFilterElement.insertAdjacentHTML('beforeend', locationClassKeyOptionsHTML);
        renderLocationListFunction();
    });
    (_a = document
        .querySelector('#is-add-location-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        let addLocationCloseModalFunction;
        function addFunction(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${pts.urlPrefix}/admin/doAddLocation`, formEvent.currentTarget, (rawResponseJSON) => {
                var _a;
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    addLocationCloseModalFunction();
                    locationList = responseJSON.locations;
                    renderLocationListFunction();
                }
                else {
                    cityssm.alertModal('Location Not Added', (_a = responseJSON.message) !== null && _a !== void 0 ? _a : '', 'OK', 'danger');
                }
            });
        }
        cityssm.openHtmlModal('location-add', {
            onshow(modalElement) {
                var _a;
                (_a = modalElement
                    .querySelector('#addLocation--locationClassKey')) === null || _a === void 0 ? void 0 : _a.insertAdjacentHTML('beforeend', locationClassKeyOptionsHTML);
            },
            onshown(modalElement, closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                addLocationCloseModalFunction = closeModalFunction;
                modalElement.querySelector('#addLocation--locationKey').focus();
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', addFunction);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
})();
