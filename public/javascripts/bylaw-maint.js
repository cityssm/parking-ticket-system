"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var bylawFilterEle = document.getElementById("bylawFilter--bylaw");
    var bylawResultsEle = document.getElementById("bylawResults");
    var bylawList = exports.bylaws;
    delete exports.bylaws;
    function openEditBylawModal(clickEvent) {
        clickEvent.preventDefault();
        var listIndex = parseInt(clickEvent.currentTarget.getAttribute("data-index"));
        var bylaw = bylawList[listIndex];
        var editBylawCloseModalFn;
        var deleteFn = function () {
            cityssm.postJSON("/admin/doDeleteBylaw", {
                bylawNumber: bylaw.bylawNumber
            }, function (responseJSON) {
                if (responseJSON.success) {
                    editBylawCloseModalFn();
                    bylawList = responseJSON.bylaws;
                    renderBylawList();
                }
            });
        };
        var confirmDeleteFn = function (deleteClickEvent) {
            deleteClickEvent.preventDefault();
            cityssm.confirmModal("Delete By-Law", "Are you sure you want to by-law \"" + bylaw.bylawNumber + "\" from the list of available options?", "Yes, Remove By-Law", "danger", deleteFn);
        };
        var editFn = function (formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON("/admin/doUpdateBylaw", formEvent.currentTarget, function (responseJSON) {
                if (responseJSON.success) {
                    editBylawCloseModalFn();
                    bylawList = responseJSON.bylaws;
                    renderBylawList();
                }
            });
        };
        cityssm.openHtmlModal("bylaw-edit", {
            onshow: function () {
                document.getElementById("editBylaw--bylawNumber").value = bylaw.bylawNumber;
                document.getElementById("editBylaw--bylawDescription").value = bylaw.bylawDescription;
            },
            onshown: function (modalEle, closeModalFn) {
                editBylawCloseModalFn = closeModalFn;
                modalEle.getElementsByTagName("form")[0].addEventListener("submit", editFn);
                modalEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", confirmDeleteFn);
            }
        });
    }
    function renderBylawList() {
        var displayCount = 0;
        var bylawFilterSplit = bylawFilterEle.value.trim().toLowerCase()
            .split(" ");
        var tbodyEle = document.createElement("tbody");
        for (var bylawIndex = 0; bylawIndex < bylawList.length; bylawIndex += 1) {
            var bylaw = bylawList[bylawIndex];
            var showRecord = true;
            var bylawNumberLowerCase = bylaw.bylawNumber.toLowerCase();
            var bylawDescriptionLowerCase = bylaw.bylawDescription.toLowerCase();
            for (var searchIndex = 0; searchIndex < bylawFilterSplit.length; searchIndex += 1) {
                if (bylawNumberLowerCase.indexOf(bylawFilterSplit[searchIndex]) === -1 &&
                    bylawDescriptionLowerCase.indexOf(bylawFilterSplit[searchIndex]) === -1) {
                    showRecord = false;
                    break;
                }
            }
            if (!showRecord) {
                continue;
            }
            displayCount += 1;
            var trEle = document.createElement("tr");
            trEle.innerHTML =
                "<td>" +
                    "<a data-index=\"" + bylawIndex + "\" href=\"#\">" +
                    cityssm.escapeHTML(bylaw.bylawNumber) +
                    "</a>" +
                    "</td>" +
                    "<td>" + cityssm.escapeHTML(bylaw.bylawDescription) + "</td>";
            trEle.getElementsByTagName("a")[0].addEventListener("click", openEditBylawModal);
            tbodyEle.appendChild(trEle);
        }
        cityssm.clearElement(bylawResultsEle);
        if (displayCount === 0) {
            bylawResultsEle.innerHTML = "<div class=\"message is-info\">" +
                "<div class=\"message-body\">There are no by-laws that meet your search criteria.</div>" +
                "</div>";
            return;
        }
        bylawResultsEle.innerHTML = "<table class=\"table is-striped is-hoverable is-fullwidth\">" +
            "<thead><tr>" +
            "<th>By-Law Number</th>" +
            "<th>Description</th>" +
            "</tr></thead>" +
            "</table>";
        bylawResultsEle.getElementsByTagName("table")[0].appendChild(tbodyEle);
    }
    ;
    bylawFilterEle.addEventListener("keyup", renderBylawList);
    renderBylawList();
    document.getElementById("is-add-bylaw-button").addEventListener("click", function (clickEvent) {
        clickEvent.preventDefault();
        var addBylawCloseModalFn;
        var addFn = function (formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON("/admin/doAddBylaw", formEvent.currentTarget, function (responseJSON) {
                if (responseJSON.success) {
                    addBylawCloseModalFn();
                    if (responseJSON.message) {
                        cityssm.alertModal("By-Law Added", responseJSON.message, "OK", "warning");
                    }
                    bylawList = responseJSON.bylaws;
                    renderBylawList();
                }
                else {
                    cityssm.alertModal("By-Law Not Added", responseJSON.message, "OK", "danger");
                }
            });
        };
        cityssm.openHtmlModal("bylaw-add", {
            onshown: function (modalEle, closeModalFn) {
                addBylawCloseModalFn = closeModalFn;
                modalEle.getElementsByTagName("form")[0].addEventListener("submit", addFn);
            }
        });
    });
}());
