"use strict";


/*
 * Date Functions
 */

export function dateIntegerToString(dateInteger: number): string {

  if (dateInteger === null || dateInteger === 0) {
    return "";
  }

  const dateString = dateInteger.toString();
  return dateString.substring(0, 4) + "-" + dateString.substring(4, 6) + "-" + dateString.substring(6, 8);

}

export function dateToString(dateObj: Date): string {

  return dateObj.getFullYear() + "-" +
    ("0" + (dateObj.getMonth() + 1)).slice(-2) + "-" +
    ("0" + (dateObj.getDate())).slice(-2);

}

export function dateToInteger(dateObj: Date): number {

  return (dateObj.getFullYear() * 10000) +
    (dateObj.getMonth() * 100) + 100 +
    dateObj.getDate();

}

export function dateStringToInteger(dateString: string): number {

  return parseInt(("0" + dateString).replace(/-/g, ""));

}

function dateStringToDate(dateString: string) {

  const datePieces = dateString.split("-");

  return new Date(parseInt(datePieces[0]), parseInt(datePieces[1]) - 1, parseInt(datePieces[2]), 0, 0, 0, 0);
}

function dateDifferenceInDays(fromDateObj: Date, toDateObj: Date) {

  return Math.round((toDateObj.getTime() - fromDateObj.getTime()) / (86400 * 1000.0));
}

export function dateStringDifferenceInDays(fromDateString: string, toDateString: string) {

  return dateDifferenceInDays(dateStringToDate(fromDateString), dateStringToDate(toDateString));
}

export const months = [
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

/*
 * Time Functions
 */

export function timeIntegerToString(timeInteger: number): string {

  const timeString = ("0000" + (timeInteger || 0).toString()).slice(-4);
  return timeString.substring(0, 2) + ":" + timeString.substring(2, 4);

}

export function timeStringToInteger(timeString: string): number {

  return parseInt(("0" + timeString).replace(/:/g, ""));

}

export function dateToTimeInteger(dateObj: Date): number {
  return (dateObj.getHours() * 100) + dateObj.getMinutes();
}
