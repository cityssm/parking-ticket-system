import { Service } from 'node-windows';
import { windowsServiceConfig } from './windowsService.js';
const svc = new Service(windowsServiceConfig);
svc.on('install', () => {
    console.log('Install complete.');
    console.log('Service exists:', svc.exists);
    svc.start();
});
svc.install();
