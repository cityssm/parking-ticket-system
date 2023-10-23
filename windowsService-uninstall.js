import path from 'node:path';
import { Service } from 'node-windows';
const svc = new Service({
    name: 'Parking Ticket System',
    script: path.join('bin', 'www.js')
});
svc.on('uninstall', function () {
    console.log('Uninstall complete.');
    console.log('The service exists:', svc.exists);
});
svc.uninstall();
