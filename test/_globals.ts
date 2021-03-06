import type { Request } from "express";


export const fakeViewOnlySession = {
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


export const fakeAdminSession = {
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


export const fakeRequest: Request = {
  async * [Symbol.asyncIterator]() { },
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


export const fakeViewOnlyRequest =
  Object.assign({}, fakeRequest, {
    session: fakeViewOnlySession
  });


export const fakeAdminRequest =
  Object.assign({}, fakeRequest, {
    session: fakeAdminSession
  });


export const userName = "__testUser";
