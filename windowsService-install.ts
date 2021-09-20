/* eslint-disable unicorn/filename-case */

import { Service } from "node-windows";
import * as path from "path";

// Create a new service object
const svc = new Service({
  name: "Parking Ticket System",
  description: "A system for managing parking tickets tracked by municipalities.",
  script: path.join("bin", "www.js")
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on("install", () => {
  svc.start();
});

svc.install();
