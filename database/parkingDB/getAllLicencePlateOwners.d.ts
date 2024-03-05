import type { LicencePlateOwner } from '../../types/recordTypes.js';
export declare function getAllLicencePlateOwners(licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string): Promise<LicencePlateOwner[]>;
export default getAllLicencePlateOwners;
