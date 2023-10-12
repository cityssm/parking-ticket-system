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

import { autoNCIC } from './ncicCodes/auto.js'
import { constructionNCIC } from './ncicCodes/construction.js'
import { motorcycleNCIC } from './ncicCodes/motorcycle.js'
import { trailerNCIC } from './ncicCodes/trailer.js'
import { truckNCIC } from './ncicCodes/truck.js'

export const vehicleNCIC: Record<string, string> = Object.assign(
  {},
  autoNCIC,
  motorcycleNCIC,
  truckNCIC,
  constructionNCIC
)

export const allNCIC: Record<string, string> = Object.assign(
  {},
  vehicleNCIC,
  trailerNCIC
)
