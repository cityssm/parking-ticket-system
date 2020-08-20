/*
 * SOURCES
 * http://jour210.h.media.illinois.edu/vehicles.pdf
 * https://vpic.nhtsa.dot.gov/api/
 *
 * Wherever possible, the company name is formatted for compatibility with the NHTSA Vehicle API.
 * This may mean removed punctuation (i.e. Harley Davidson instead of Harley-Davidson),
 * removed company identifiers (i.e. Bombardier instead of Bombardier, Inc.),
 * and abbreviations or expansions (i.e. GMC instead of General Motors).
 */

import { autoNCIC } from "./ncicCodes/auto";
import { constructionNCIC } from "./ncicCodes/construction";
import { motorcycleNCIC } from "./ncicCodes/motorcycle";
import { trailerNCIC } from "./ncicCodes/trailer";
import { truckNCIC } from "./ncicCodes/truck";


export const vehicleNCIC: { [ncic: string]: string } =
  Object.assign({}, autoNCIC, motorcycleNCIC, truckNCIC, constructionNCIC);


export const allNCIC: { [ncic: string]: string } =
  Object.assign({}, vehicleNCIC, trailerNCIC);
