import { Service } from "node-windows";
import * as path from "path";
const svc = new Service({
    name: "Parking Ticket System",
    description: "A system for managing parking tickets tracked by municipalities.",
    script: path.join("bin", "www.js")
});
svc.on("install", () => {
    svc.start();
});
svc.install();
