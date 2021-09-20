import { Service } from "node-windows";
import path from "path";
const svc = new Service({
    name: "Parking Ticket System",
    script: path.join("bin", "www.js")
});
svc.on("uninstall", function () {
    console.log("Uninstall complete.");
    console.log("The service exists:", svc.exists);
});
svc.uninstall();
