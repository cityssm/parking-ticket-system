import { RawRowsColumnsReturn } from "./ptsTypes";

const goodWords = require("../node_modules/fresh-password/lib/words/good.json");
const badWords = require("../node_modules/fresh-password/lib/words/bad.json");

const convertArrayToCSV = require("convert-array-to-csv").convertArrayToCSV;


export function escapeHTML(str: string): string {

  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

}

export function rawToCSV(rowsColumnsObj: RawRowsColumnsReturn): string {

  const columnNames = new Array(rowsColumnsObj.columns.length);

  for (let columnIndex = 0; columnIndex < rowsColumnsObj.columns.length; columnIndex += 1) {

    columnNames[columnIndex] = rowsColumnsObj.columns[columnIndex].name;

  }

  const csv = convertArrayToCSV(rowsColumnsObj.rows, {
    header: columnNames,
    separator: ","
  });

  return csv;

}

export function generatePassword() {

  // Generate 4 random numbers
  let r1 = randomInt(0, goodWords.length);
  let r2 = randomInt(0, goodWords.length);
  let r3 = randomInt(0, 9);
  let r4 = randomInt(0, 9);

  // Pick first and second words
  let firstWord = goodWords[r1];
  let secondWord = goodWords[r2];

  // Generate combined password
  let password = `${firstWord}${secondWord[0].toUpperCase()}${secondWord.substring(1)}${r3}${r4}`;

  let passwordLowerCase = password.toLowerCase();

  // Check to see if the combination creates any "offensive" words
  for (let i = 0; i < badWords.length; i++) {
    if (passwordLowerCase.indexOf(badWords[i]) > -1) {
      // If so, recursively regenerate
      password = generatePassword();
    }
  }

  // Return the final password
  return password;

}

function randomInt(low: number, high: number) {
  return Math.floor(Math.random() * (high - low + 1) + low);
}


/*
 * UID GENERATOR
 */

let uid = Date.now();

export function getUID() {

  const toReturn = uid;

  uid += 1;

  return "uid" + toReturn.toString();

}
