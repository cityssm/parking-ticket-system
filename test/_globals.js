"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userName = exports.fakeAdminRequest = exports.fakeViewOnlyRequest = exports.fakeRequest = exports.fakeAdminSession = exports.fakeViewOnlySession = void 0;
exports.fakeViewOnlySession = {
    id: "",
    cookie: null,
    destroy: null,
    regenerate: null,
    reload: null,
    save: null,
    touch: null,
    user: {
        userProperties: {
            canCreate: false,
            canUpdate: false,
            isAdmin: false,
            isOperator: false
        }
    }
};
exports.fakeAdminSession = {
    id: "",
    cookie: null,
    destroy: null,
    regenerate: null,
    reload: null,
    save: null,
    touch: null,
    user: {
        userProperties: {
            canCreate: true,
            canUpdate: true,
            isAdmin: true,
            isOperator: true
        }
    }
};
exports.fakeRequest = {
    [Symbol.asyncIterator]() { return __asyncGenerator(this, arguments, function* _a() { }); },
    _destroy: null,
    _read: null,
    accepted: null,
    accepts: null,
    acceptsCharsets: null,
    acceptsEncodings: null,
    acceptsLanguages: null,
    addListener: null,
    app: null,
    baseUrl: null,
    body: null,
    cookies: null,
    complete: null,
    connection: null,
    destroy: null,
    destroyed: null,
    emit: null,
    eventNames: null,
    file: null,
    files: null,
    fresh: null,
    get: null,
    getMaxListeners: null,
    header: null,
    headers: null,
    host: null,
    hostname: null,
    httpVersion: null,
    httpVersionMajor: null,
    httpVersionMinor: null,
    ip: null,
    ips: null,
    is: null,
    isPaused: null,
    listenerCount: null,
    listeners: null,
    method: null,
    off: null,
    on: null,
    once: null,
    originalUrl: null,
    param: null,
    params: null,
    path: null,
    pause: null,
    pipe: null,
    prependListener: null,
    prependOnceListener: null,
    protocol: null,
    push: null,
    query: null,
    range: null,
    rawHeaders: null,
    rawListeners: null,
    rawTrailers: null,
    read: null,
    readable: null,
    readableLength: null,
    readableHighWaterMark: null,
    readableObjectMode: null,
    removeAllListeners: null,
    removeListener: null,
    resume: null,
    route: null,
    secure: null,
    setEncoding: null,
    setMaxListeners: null,
    setTimeout: null,
    signedCookies: null,
    socket: null,
    stale: null,
    subdomains: null,
    trailers: null,
    unpipe: null,
    unshift: null,
    url: null,
    wrap: null,
    xhr: null
};
exports.fakeViewOnlyRequest = Object.assign({}, exports.fakeRequest, {
    session: exports.fakeViewOnlySession
});
exports.fakeAdminRequest = Object.assign({}, exports.fakeRequest, {
    session: exports.fakeAdminSession
});
exports.userName = "__testUser";
