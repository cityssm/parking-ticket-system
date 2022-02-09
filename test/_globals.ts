import type { Request } from "express";
import type { Session } from "express-session";

import * as configFunctions from "../helpers/functions.config.js";


export const testView = "*testView";
export const testUpdate = "*testUpdate";
export const testAdmin = "*testAdmin";


export const fakeViewOnlySession: Session = {
  id: "",
  cookie: undefined,
  destroy: undefined,
  regenerate: undefined,
  reload: undefined,
  resetMaxAge: undefined,
  save: undefined,
  touch: undefined,
  user: {
    userName: configFunctions.getProperty("users.testing")[0],
    userProperties: {
      canUpdate: false,
      isAdmin: false,
      isOperator: false
    }
  }
};


export const fakeAdminSession: Session = {
  id: "",
  cookie: undefined,
  destroy: undefined,
  regenerate: undefined,
  reload: undefined,
  resetMaxAge: undefined,
  save: undefined,
  touch: undefined,
  user: {
    userName: configFunctions.getProperty("users.testing")[0],
    userProperties: {
      canUpdate: true,
      isAdmin: true,
      isOperator: true
    }
  }
};


export const fakeRequest: Request = {
  async * [Symbol.asyncIterator]() { },
  _destroy: undefined,
  _read: undefined,
  accepted: undefined,
  accepts: undefined,
  acceptsCharsets: undefined,
  acceptsEncodings: undefined,
  acceptsLanguages: undefined,
  addListener: undefined,
  app: undefined,
  baseUrl: undefined,
  body: undefined,
  cookies: undefined,
  complete: undefined,
  connection: undefined,
  csrfToken: undefined,
  destroy: undefined,
  destroyed: undefined,
  emit: undefined,
  eventNames: undefined,
  file: undefined,
  files: undefined,
  fresh: undefined,
  get: undefined,
  getMaxListeners: undefined,
  header: undefined,
  headers: undefined,
  host: undefined,
  hostname: undefined,
  httpVersion: undefined,
  httpVersionMajor: undefined,
  httpVersionMinor: undefined,
  ip: undefined,
  ips: undefined,
  is: undefined,
  isPaused: undefined,
  listenerCount: undefined,
  listeners: undefined,
  method: undefined,
  off: undefined,
  on: undefined,
  once: undefined,
  originalUrl: undefined,
  param: undefined,
  params: undefined,
  path: undefined,
  pause: undefined,
  pipe: undefined,
  prependListener: undefined,
  prependOnceListener: undefined,
  protocol: undefined,
  push: undefined,
  query: undefined,
  range: undefined,
  rateLimit: undefined,
  rawHeaders: undefined,
  rawListeners: undefined,
  rawTrailers: undefined,
  read: undefined,
  readable: undefined,
  readableLength: undefined,
  readableHighWaterMark: undefined,
  readableObjectMode: undefined,
  removeAllListeners: undefined,
  removeListener: undefined,
  resume: undefined,
  route: undefined,
  secure: undefined,
  session: undefined,
  sessionID: undefined,
  setEncoding: undefined,
  setMaxListeners: undefined,
  setTimeout: undefined,
  signedCookies: undefined,
  socket: undefined,
  stale: undefined,
  subdomains: undefined,
  trailers: undefined,
  unpipe: undefined,
  unshift: undefined,
  url: undefined,
  wrap: undefined,
  xhr: undefined

};


export const fakeViewOnlyRequest =
  Object.assign({}, fakeRequest, {
    session: fakeViewOnlySession
  });


export const fakeAdminRequest =
  Object.assign({}, fakeRequest, {
    session: fakeAdminSession
  });
