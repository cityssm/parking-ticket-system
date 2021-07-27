import { autoNCIC } from "./ncicCodes/auto.js";
import { constructionNCIC } from "./ncicCodes/construction.js";
import { motorcycleNCIC } from "./ncicCodes/motorcycle.js";
import { trailerNCIC } from "./ncicCodes/trailer.js";
import { truckNCIC } from "./ncicCodes/truck.js";
export const vehicleNCIC = Object.assign({}, autoNCIC, motorcycleNCIC, truckNCIC, constructionNCIC);
export const allNCIC = Object.assign({}, vehicleNCIC, trailerNCIC);
