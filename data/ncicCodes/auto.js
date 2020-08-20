"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoNCIC = void 0;
const auto_AM_1 = require("./auto-AM");
const auto_NZ_1 = require("./auto-NZ");
exports.autoNCIC = Object.assign({}, auto_AM_1.autoNCIC_AM, auto_NZ_1.autoNCIC_NZ);
