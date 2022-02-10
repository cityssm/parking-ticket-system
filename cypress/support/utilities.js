"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomString = void 0;
const randomString = () => {
    return Math.ceil(Math.random() * 100000).toString();
};
exports.randomString = randomString;
