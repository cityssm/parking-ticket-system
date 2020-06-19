"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    const locationClassLookup = {};
    let ticketNumberFieldLabel = "";
    const formEle = document.getElementById("form--filters");
    const limitEle = document.getElementById("filter--limit");
    const offsetEle = document.getElementById("filter--offset");
    const searchResultsEle = document.getElementById("container--searchResults");
    function getTickets() {
        const currentLimit = parseInt(limitEle.value, 10);
        const currentOffset = parseInt(offsetEle.value, 10);
        cityssm.clearElement(searchResultsEle);
        searchResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
            "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
            "<em>Loading tickets..." +
            "</p>";
        cityssm.postJSON("/tickets/doGetTickets", formEle, function (ticketResults) {
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
                const trEle = document.createElement("tr");
                const locationProperties = pts.getLicencePlateLocationProperties(ticketObj.licencePlateCountry, ticketObj.licencePlateProvince);
                let locationClass = "";
                if (ticketObj.locationClassKey) {
                    const locationClassObj = locationClassLookup[ticketObj.locationClassKey];
                    if (locationClassObj) {
                        locationClass = locationClassObj.locationClass;
                    }
                }
                const ticketStatusObj = pts.getTicketStatus(ticketObj.latestStatus_statusKey);
                trEle.innerHTML = "<td>" +
                    "<a href=\"/tickets/" + ticketObj.ticketID + "\" data-tooltip=\"View Parking Ticket\">" +
                    ticketObj.ticketNumber +
                    "</a>" +
                    "</td>" +
                    "<td class=\"is-nowrap\">" + ticketObj.issueDateString + "</td>" +
                    ("<td>" +
                        "<div class=\"licence-plate is-fullwidth\" style=\"--color:" + locationProperties.licencePlateProvince.color + ";--backgroundColor:" + locationProperties.licencePlateProvince.backgroundColor + "\">" +
                        ("<div class=\"licence-plate-province\">" +
                            locationProperties.licencePlateProvinceAlias +
                            "</div>") +
                        ("<div class=\"licence-plate-number\">" +
                            (ticketObj.licencePlateNumber === "" ? "<i class=\"fas fa-question-circle has-opacity-2\" aria-hidden=\"true\"></i>" : cityssm.escapeHTML(ticketObj.licencePlateNumber)) +
                            "</div>") +
                        "</div>" +
                        "</td>") +
                    ("<td>" +
                        (ticketObj.locationDescription ?
                            cityssm.escapeHTML(ticketObj.locationDescription) + "<br />" :
                            "") +
                        (ticketObj.locationKey && ticketObj.locationKey !== "" && ticketObj.locationName ?
                            "<small class=\"has-tooltip-right\" data-tooltip=\"" + cityssm.escapeHTML(locationClass) + "\">" +
                                "<i class=\"fas fa-map-marker-alt\" aria-hidden=\"true\"></i> " + ticketObj.locationName +
                                "</small>" :
                            "") +
                        "</td>") +
                    "<td>" + cityssm.escapeHTML(ticketObj.parkingOffence) + "</td>" +
                    "<td>" +
                    (ticketObj.resolvedDateString === "" ?
                        "Unresolved" :
                        "<span class=\"sr-only\">Resolved</span>" +
                            "<i class=\"fas fa-check\" aria-hidden=\"true\"></i> " + ticketObj.resolvedDateString) +
                    (ticketObj.latestStatus_statusKey ?
                        "<br /><span class=\"tag is-light is-primary\">" + ticketStatusObj.status + "</span>" :
                        "") +
                    "</td>";
                tbodyEle.appendChild(trEle);
            }
            searchResultsEle.insertAdjacentHTML("beforeend", "<div class=\"level is-block-print\">" +
                "<div class=\"level-left has-text-weight-bold\">" +
                "Displaying parking tickets " +
                (currentOffset + 1) +
                " to " +
                Math.min(currentLimit + currentOffset, ticketResults.count) +
                " of " +
                ticketResults.count +
                "</div>" +
                "</div>");
            if (currentLimit < ticketResults.count) {
                const paginationEle = document.createElement("nav");
                paginationEle.className = "level-right is-hidden-print";
                paginationEle.setAttribute("role", "pagination");
                paginationEle.setAttribute("aria-label", "pagination");
                if (currentOffset > 0) {
                    const previousEle = document.createElement("a");
                    previousEle.className = "button";
                    previousEle.innerText = "Previous";
                    previousEle.addEventListener("click", function (clickEvent) {
                        clickEvent.preventDefault();
                        offsetEle.value = Math.max(0, currentOffset - currentLimit).toString();
                        searchResultsEle.scrollIntoView(true);
                        getTickets();
                    });
                    paginationEle.appendChild(previousEle);
                }
                if (currentLimit + currentOffset < ticketResults.count) {
                    const nextEle = document.createElement("a");
                    nextEle.className = "button ml-3";
                    nextEle.innerHTML = "<span>Next Tickets</span><span class=\"icon\"><i class=\"fas fa-chevron-right\" aria-hidden=\"true\"></i></span>";
                    nextEle.addEventListener("click", function (clickEvent) {
                        clickEvent.preventDefault();
                        offsetEle.value = (currentOffset + currentLimit).toString();
                        searchResultsEle.scrollIntoView(true);
                        getTickets();
                    });
                    paginationEle.appendChild(nextEle);
                }
                searchResultsEle.getElementsByClassName("level")[0].appendChild(paginationEle);
            }
        });
    }
    function resetOffsetAndGetTickets() {
        offsetEle.value = "0";
        getTickets();
    }
    formEle.addEventListener("submit", function (formEvent) {
        formEvent.preventDefault();
    });
    document.getElementById("filter--ticketNumber").addEventListener("change", resetOffsetAndGetTickets);
    document.getElementById("filter--licencePlateNumber").addEventListener("change", resetOffsetAndGetTickets);
    document.getElementById("filter--location").addEventListener("change", resetOffsetAndGetTickets);
    document.getElementById("filter--isResolved").addEventListener("change", resetOffsetAndGetTickets);
    pts.getDefaultConfigProperty("ticketNumber_fieldLabel", function (fieldLabel) {
        ticketNumberFieldLabel = fieldLabel;
        pts.getDefaultConfigProperty("locationClasses", function (locationClasses) {
            for (const locationClassObj of locationClasses) {
                locationClassLookup[locationClassObj.locationClassKey] = locationClassObj;
            }
            getTickets();
        });
    });
}());
