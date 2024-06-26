"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a, _b, _c, _d;
    let ticketNumberFieldLabel = '';
    const formElement = document.querySelector('#form--filters');
    const offsetElement = document.querySelector('#filter--offset');
    const searchResultsElement = document.querySelector('#container--searchResults');
    function buildTicketTrElement(ticketObject) {
        const trElement = document.createElement('tr');
        const locationProperties = pts.getLicencePlateLocationProperties(ticketObject.licencePlateCountry, ticketObject.licencePlateProvince);
        let locationClass = '';
        if (ticketObject.locationClassKey !== '') {
            locationClass = pts.getLocationClass(ticketObject.locationClassKey).locationClass;
        }
        const ticketStatusObject = pts.getTicketStatus(ticketObject.latestStatus_statusKey);
        const ticketUrl = `${pts.urlPrefix}/tickets/${ticketObject.ticketId.toString()}`;
        trElement.innerHTML = `<td>
        <a href="${ticketUrl}" data-tooltip="View Parking Ticket">
        ${cityssm.escapeHTML(ticketObject.ticketNumber)}
        </a>
      </td>
      <td class="is-nowrap">
        ${ticketObject.issueDateString}
      </td>
      <td>
      <div class="licence-plate is-fullwidth"
        style="
        --color:${locationProperties.licencePlateProvince.color};
        --backgroundColor:${locationProperties.licencePlateProvince.backgroundColor}
        ">
        <div class="licence-plate-province">
           ${locationProperties.licencePlateProvinceAlias}
        </div>
    
        <div class="licence-plate-number">
        ${ticketObject.licencePlateNumber === ''
            ? '<i class="fas fa-question-circle has-opacity-2" aria-hidden="true"></i>'
            : cityssm.escapeHTML(ticketObject.licencePlateNumber)}
        </div>
      </div>
      </td>
      <td>
      ${ticketObject.locationDescription === ''
            ? ''
            : `${ticketObject.locationDescription}<br />`}
      ${ticketObject.locationKey &&
            ticketObject.locationKey !== '' &&
            ticketObject.locationName
            ? `<small class="has-tooltip-right" data-tooltip="${locationClass}">
            <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
            ${cityssm.escapeHTML(ticketObject.locationName)}
            </small>`
            : ''}
    </td>
    <td>
    ${cityssm.escapeHTML(ticketObject.parkingOffence)}
    </td>
    <td>
    ${ticketObject.resolvedDateString === ''
            ? 'Unresolved'
            : `<span class="sr-only">Resolved</span>
            <i class="fas fa-check" aria-hidden="true"></i>
            ${ticketObject.resolvedDateString}`}
    ${ticketObject.latestStatus_statusKey
            ? `<br />
            <span class="tag is-light is-primary">${ticketStatusObject.status}</span>`
            : ''}
    </td>`;
        return trElement;
    }
    function processTicketResults(ticketResults) {
        const ticketList = ticketResults.tickets;
        if (ticketList.length === 0) {
            searchResultsElement.innerHTML = `<div class="message is-info">
        <div class="message-body">
        <strong>Your search returned no results.</strong><br />
        Please try expanding your search criteria.
        </div>
        </div>`;
            return;
        }
        searchResultsElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
      <thead><tr>
      <th>
      ${cityssm.escapeHTML(ticketNumberFieldLabel)}
      </th>
      <th>Issue Date</th>
      <th>Plate Number</th>
      <th>Location</th>
      <th>Offence</th>
      <th>Status</th>
      </tr></thead>
      <tbody></tbody>
      </table>`;
        const tbodyElement = searchResultsElement.querySelector('tbody');
        for (const ticketObject of ticketList) {
            const trElement = buildTicketTrElement(ticketObject);
            tbodyElement.append(trElement);
        }
        searchResultsElement.insertAdjacentHTML('beforeend', `<div class="level is-block-print">
        <div class="level-left has-text-weight-bold">
        Displaying parking tickets
        ${(ticketResults.offset + 1).toString()}
        to
        ${Math.min(ticketResults.limit + ticketResults.offset, ticketResults.count).toString()}
        of
        ${ticketResults.count.toString()}
        </div>
      </div>`);
        if (ticketResults.limit < ticketResults.count) {
            const paginationElement = document.createElement('nav');
            paginationElement.className = 'level-right is-hidden-print';
            paginationElement.setAttribute('role', 'pagination');
            paginationElement.setAttribute('aria-label', 'pagination');
            if (ticketResults.offset > 0) {
                const previousElement = document.createElement('a');
                previousElement.className = 'button';
                previousElement.textContent = 'Previous';
                previousElement.addEventListener('click', (clickEvent) => {
                    clickEvent.preventDefault();
                    offsetElement.value = Math.max(0, ticketResults.offset - ticketResults.limit).toString();
                    searchResultsElement.scrollIntoView(true);
                    getTicketsFunction();
                });
                paginationElement.append(previousElement);
            }
            if (ticketResults.limit + ticketResults.offset < ticketResults.count) {
                const nextElement = document.createElement('a');
                nextElement.className = 'button ml-3';
                nextElement.innerHTML = `<span>Next Tickets</span>
          <span class="icon"><i class="fas fa-chevron-right" aria-hidden="true"></i></span>`;
                nextElement.addEventListener('click', (clickEvent) => {
                    clickEvent.preventDefault();
                    offsetElement.value = (ticketResults.offset + ticketResults.limit).toString();
                    searchResultsElement.scrollIntoView(true);
                    getTicketsFunction();
                });
                paginationElement.append(nextElement);
            }
            searchResultsElement
                .querySelectorAll('.level')[0]
                .append(paginationElement);
        }
    }
    function getTicketsFunction() {
        cityssm.clearElement(searchResultsElement);
        searchResultsElement.innerHTML = `<p class="has-text-centered has-text-grey-light">
      <i class="fas fa-3x fa-circle-notch fa-spin" aria-hidden="true"></i><br />
      <em>Loading tickets...</em>
      </p>`;
        cityssm.postJSON(`${pts.urlPrefix}/tickets/doGetTickets`, formElement, (rawResponseJSON) => {
            processTicketResults(rawResponseJSON);
        });
    }
    function resetOffsetAndGetTicketsFunction() {
        offsetElement.value = '0';
        getTicketsFunction();
    }
    formElement.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
    });
    (_a = document
        .querySelector('#filter--ticketNumber')) === null || _a === void 0 ? void 0 : _a.addEventListener('change', resetOffsetAndGetTicketsFunction);
    (_b = document
        .querySelector('#filter--licencePlateNumber')) === null || _b === void 0 ? void 0 : _b.addEventListener('change', resetOffsetAndGetTicketsFunction);
    (_c = document
        .querySelector('#filter--location')) === null || _c === void 0 ? void 0 : _c.addEventListener('change', resetOffsetAndGetTicketsFunction);
    (_d = document
        .querySelector('#filter--isResolved')) === null || _d === void 0 ? void 0 : _d.addEventListener('change', resetOffsetAndGetTicketsFunction);
    pts.getDefaultConfigProperty('ticketNumber_fieldLabel', (fieldLabel) => {
        ticketNumberFieldLabel = fieldLabel;
        pts.getDefaultConfigProperty('locationClasses', getTicketsFunction);
    });
})();
