"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    let ticketNumberFieldLabel = "";
    const formEle = document.getElementById("form--filters");
    const offsetEle = document.getElementById("filter--offset");
    const searchResultsEle = document.getElementById("container--searchResults");
    const buildTicketTrEle = (ticketObj) => {
        const trEle = document.createElement("tr");
        const locationProperties = pts.getLicencePlateLocationProperties(ticketObj.licencePlateCountry, ticketObj.licencePlateProvince);
        let locationClass = "";
        if (ticketObj.locationClassKey) {
            locationClass = pts.getLocationClass(ticketObj.locationClassKey).locationClass;
        }
        const ticketStatusObj = pts.getTicketStatus(ticketObj.latestStatus_statusKey);
        trEle.innerHTML = "<td>" +
            "<a href=\"/tickets/" + ticketObj.ticketID.toString() + "\" data-tooltip=\"View Parking Ticket\">" +
            ticketObj.ticketNumber +
            "</a>" +
            "</td>" +
            "<td class=\"is-nowrap\">" + ticketObj.issueDateString + "</td>" +
            ("<td>" +
                "<div class=\"licence-plate is-fullwidth\"" +
                " style=\"--color:" + locationProperties.licencePlateProvince.color + ";" +
                "--backgroundColor:" + locationProperties.licencePlateProvince.backgroundColor + "\">" +
                ("<div class=\"licence-plate-province\">" +
                    locationProperties.licencePlateProvinceAlias +
                    "</div>") +
                ("<div class=\"licence-plate-number\">" +
                    (ticketObj.licencePlateNumber === ""
                        ? "<i class=\"fas fa-question-circle has-opacity-2\" aria-hidden=\"true\"></i>"
                        : cityssm.escapeHTML(ticketObj.licencePlateNumber)) +
                    "</div>") +
                "</div>" +
                "</td>") +
            ("<td>" +
                (ticketObj.locationDescription
                    ? `${ticketObj.locationDescription}<br />`
                    : "") +
                (ticketObj.locationKey && ticketObj.locationKey !== "" && ticketObj.locationName
                    ? `<small class="has-tooltip-right" data-tooltip="${locationClass}">
              <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
              ${cityssm.escapeHTML(ticketObj.locationName)}
              </small>`
                    : "") +
                "</td>") +
            "<td>" + cityssm.escapeHTML(ticketObj.parkingOffence) + "</td>" +
            "<td>" +
            (ticketObj.resolvedDateString === ""
                ? "Unresolved"
                : "<span class=\"sr-only\">Resolved</span>" +
                    "<i class=\"fas fa-check\" aria-hidden=\"true\"></i> " + ticketObj.resolvedDateString) +
            (ticketObj.latestStatus_statusKey
                ? "<br /><span class=\"tag is-light is-primary\">" + ticketStatusObj.status + "</span>"
                : "") +
            "</td>";
        return trEle;
    };
    const processTicketResults = (ticketResults) => {
        const ticketList = ticketResults.tickets;
        if (ticketList.length === 0) {
            searchResultsEle.innerHTML = "<div class=\"message is-info\">" +
                "<div class=\"message-body\">" +
                "<strong>Your search returned no results.</strong><br />" +
                "Please try expanding your search criteria." +
                "</div>" +
                "</div>";
            return;
        }
        searchResultsEle.innerHTML = "<table class=\"table is-fullwidth is-striped is-hoverable\">" +
            "<thead><tr>" +
            "<th>" + cityssm.escapeHTML(ticketNumberFieldLabel) + "</th>" +
            "<th>Issue Date</th>" +
            "<th>Plate Number</th>" +
            "<th>Location</th>" +
            "<th>Offence</th>" +
            "<th>Status</th>" +
            "</tr></thead>" +
            "<tbody></tbody>" +
            "</table>";
        const tbodyEle = searchResultsEle.getElementsByTagName("tbody")[0];
        for (const ticketObj of ticketList) {
            const trEle = buildTicketTrEle(ticketObj);
            tbodyEle.appendChild(trEle);
        }
        searchResultsEle.insertAdjacentHTML("beforeend", "<div class=\"level is-block-print\">" +
            "<div class=\"level-left has-text-weight-bold\">" +
            "Displaying parking tickets " +
            (ticketResults.offset + 1).toString() +
            " to " +
            Math.min(ticketResults.limit + ticketResults.offset, ticketResults.count).toString() +
            " of " +
            ticketResults.count.toString() +
            "</div>" +
            "</div>");
        if (ticketResults.limit < ticketResults.count) {
            const paginationEle = document.createElement("nav");
            paginationEle.className = "level-right is-hidden-print";
            paginationEle.setAttribute("role", "pagination");
            paginationEle.setAttribute("aria-label", "pagination");
            if (ticketResults.offset > 0) {
                const previousEle = document.createElement("a");
                previousEle.className = "button";
                previousEle.innerText = "Previous";
                previousEle.addEventListener("click", (clickEvent) => {
                    clickEvent.preventDefault();
                    offsetEle.value = Math.max(0, ticketResults.offset - ticketResults.limit).toString();
                    searchResultsEle.scrollIntoView(true);
                    getTicketsFn();
                });
                paginationEle.appendChild(previousEle);
            }
            if (ticketResults.limit + ticketResults.offset < ticketResults.count) {
                const nextEle = document.createElement("a");
                nextEle.className = "button ml-3";
                nextEle.innerHTML =
                    "<span>Next Tickets</span>" +
                        "<span class=\"icon\"><i class=\"fas fa-chevron-right\" aria-hidden=\"true\"></i></span>";
                nextEle.addEventListener("click", (clickEvent) => {
                    clickEvent.preventDefault();
                    offsetEle.value = (ticketResults.offset + ticketResults.limit).toString();
                    searchResultsEle.scrollIntoView(true);
                    getTicketsFn();
                });
                paginationEle.appendChild(nextEle);
            }
            searchResultsEle.getElementsByClassName("level")[0].appendChild(paginationEle);
        }
    };
    const getTicketsFn = () => {
        cityssm.clearElement(searchResultsEle);
        searchResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
            "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
            "<em>Loading tickets..." +
            "</p>";
        cityssm.postJSON("/tickets/doGetTickets", formEle, processTicketResults);
    };
    const resetOffsetAndGetTicketsFn = () => {
        offsetEle.value = "0";
        getTicketsFn();
    };
    formEle.addEventListener("submit", (formEvent) => {
        formEvent.preventDefault();
    });
    document.getElementById("filter--ticketNumber").addEventListener("change", resetOffsetAndGetTicketsFn);
    document.getElementById("filter--licencePlateNumber").addEventListener("change", resetOffsetAndGetTicketsFn);
    document.getElementById("filter--location").addEventListener("change", resetOffsetAndGetTicketsFn);
    document.getElementById("filter--isResolved").addEventListener("change", resetOffsetAndGetTicketsFn);
    pts.getDefaultConfigProperty("ticketNumber_fieldLabel", (fieldLabel) => {
        ticketNumberFieldLabel = fieldLabel;
        pts.getDefaultConfigProperty("locationClasses", getTicketsFn);
    });
})();
