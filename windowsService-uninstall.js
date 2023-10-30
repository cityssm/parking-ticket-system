import { Service } from 'node-windows';
import { windowsServiceConfig } from './windowsService.js';
const svc = new Service(windowsServiceConfig);
svc.on('uninstall', () => {
    console.log('Uninstall complete.');
    console.log('Service exists:', svc.exists);
});
svc.uninstall();
