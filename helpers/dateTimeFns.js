"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function dateIntegerToString(dateInteger) {
    if (dateInteger === null || dateInteger === 0) {
        return "";
    }
    const dateString = dateInteger.toString();
    return dateString.substring(0, 4) + "-" + dateString.substring(4, 6) + "-" + dateString.substring(6, 8);
}
exports.dateIntegerToString = dateIntegerToString;
function dateToString(dateObj) {
    return dateObj.getFullYear() + "-" +
        ("0" + (dateObj.getMonth() + 1)).slice(-2) + "-" +
        ("0" + (dateObj.getDate())).slice(-2);
}
exports.dateToString = dateToString;
function dateToInteger(dateObj) {
    return (dateObj.getFullYear() * 10000) +
        (dateObj.getMonth() * 100) + 100 +
        dateObj.getDate();
}
exports.dateToInteger = dateToInteger;
function dateStringToInteger(dateString) {
    return parseInt(("0" + dateString).replace(/-/g, ""));
}
exports.dateStringToInteger = dateStringToInteger;
exports.months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];
function timeIntegerToString(timeInteger) {
    const timeString = ("0000" + (timeInteger || 0).toString()).slice(-4);
    return timeString.substring(0, 2) + ":" + timeString.substring(2, 4);
}
exports.timeIntegerToString = timeIntegerToString;
function timeStringToInteger(timeString) {
    return parseInt(("0" + timeString).replace(/:/g, ""));
}
exports.timeStringToInteger = timeStringToInteger;
function dateToTimeInteger(dateObj) {
    return (dateObj.getHours() * 100) + dateObj.getMinutes();
}
exports.dateToTimeInteger = dateToTimeInteger;
