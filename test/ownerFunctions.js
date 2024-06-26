import assert from 'node:assert';
import * as ownerFunctions from '../helpers/functions.owner.js';
describe('helpers/ownerFunctions', () => {
    describe('#getFormattedOwnerAddress()', () => {
        it('should format a LicencePlateOwner object', () => {
            const owner = {
                recordType: 'owner',
                recordDate: 0,
                vehicleNCIC: '',
                ownerName1: 'Doe, John',
                ownerName2: 'Doe, Jane',
                ownerAddress: '1234 Fake St.',
                ownerCity: 'Sault Ste. Marie',
                ownerProvince: 'ON',
                ownerPostalCode: 'A1A1A1',
                ownerGenderKey: 'M',
                driverLicenceNumber: '',
                licencePlateCountry: 'CA',
                licencePlateProvince: 'ON',
                licencePlateNumber: 'SAMPLE',
                licencePlateExpiryDate: 20211231
            };
            assert.ok(ownerFunctions
                .getFormattedOwnerAddress(owner)
                .endsWith(owner.ownerPostalCode));
        });
        it('should format a ReconciliationRecord object', () => {
            const rec = {
                ticket_ticketId: -1,
                ticket_ticketNumber: 'TKT123',
                ticket_issueDate: 20200102,
                ticket_vehicleMakeModel: 'Chevrolet',
                ticket_licencePlateExpiryDate: 20211231,
                owner_recordDate: 20200304,
                owner_vehicleNCIC: 'CHEV',
                owner_vehicleMake: 'Chevrolet',
                owner_vehicleYear: 2019,
                owner_vehicleColor: 'Black',
                owner_ownerName1: 'Doe, John',
                owner_ownerName2: 'Doe, Jane',
                owner_ownerAddress: '1234 Fake St.',
                owner_ownerCity: 'Sault Ste. Marie',
                owner_ownerProvince: 'ON',
                owner_ownerPostalCode: 'A1A1A1',
                owner_licencePlateExpiryDate: 20211231,
                licencePlateCountry: 'CA',
                licencePlateProvince: 'ON',
                licencePlateNumber: 'SAMPLE',
                licencePlateExpiryDate: 20211231,
                dateDifference: 0,
                isVehicleMakeMatch: true,
                isLicencePlateExpiryDateMatch: true
            };
            assert.ok(ownerFunctions
                .getFormattedOwnerAddress(rec)
                .endsWith(rec.owner_ownerPostalCode));
        });
    });
});
