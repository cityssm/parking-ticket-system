import path from 'node:path';
import { Service } from 'node-windows';
const svc = new Service({
    name: 'Parking Ticket System',
    description: 'A system for managing parking tickets tracked by municipalities.',
    script: path.join('bin', 'www.js')
});
svc.on('install', () => {
    svc.start();
});
svc.install();
