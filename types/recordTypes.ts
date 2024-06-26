/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/indent */

export interface Record {
  recordType: 'ticket' | 'remark' | 'status' | 'owner' | 'batch'

  recordCreate_userName: string
  recordCreate_timeMillis: number

  recordUpdate_userName: string
  recordUpdate_timeMillis: number
  recordUpdate_dateString?: string

  recordDelete_userName?: string
  recordDelete_timeMillis?: number
  recordDelete_dateString?: string

  canUpdate?: boolean
}

export interface LicencePlate {
  licencePlateCountry: string
  licencePlateProvince: string
  licencePlateNumber: string

  licencePlateExpiryDate: number
  licencePlateExpiryDateString?: string
  licencePlateExpiryYear?: number | string
  licencePlateExpiryMonth?: number | string
  licencePlateExpiryDay?: number

  hasOwnerRecord?: boolean
  unresolvedTicketCount?: number
}

export interface ParkingTicket extends Record, LicencePlate, ParkingLocation {
  recordType: 'ticket'

  ticketId: number
  ticketNumber: string

  issueDate: number
  issueDateString: string

  issueTime: number
  issueTimeString: string

  issuingOfficer: string

  bylawNumber: string

  locationDescription: string
  parkingOffence: string
  offenceAmount: number
  discountOffenceAmount: number
  discountDays: number

  licencePlateIsMissing: boolean
  vehicleMakeModel: string
  vehicleVIN: string

  resolvedDate: number
  resolvedDateString: string

  latestStatus_statusKey: string
  latestStatus_statusDate: number
  latestStatus_statusDateString: string

  ownerLookup_statusKey:
    | 'ownerLookupPending'
    | 'ownerLookupError'
    | 'ownerLookupMatch'
  ownerLookup_statusField: string

  licencePlateOwner?: LicencePlateOwner
  licencePlateOwner_ownerName1?: string

  location: ParkingLocation
  statusLog: ParkingTicketStatusLog[]
  remarks: ParkingTicketRemark[]
}

export interface ParkingTicketStatusLog extends Record {
  recordType: 'status'

  ticketId: number | string
  statusIndex?: number

  statusDate?: number
  statusDateString?: string

  statusTime?: number
  statusTimeString?: string

  statusKey?: string
  statusField?: string
  statusField2?: string
  statusNote?: string

  // from ticket
  ticketNumber?: string
  licencePlateNumber?: string
  issueDate?: number
  issueDateString?: string
}

export interface ParkingTicketRemark extends Record {
  recordType: 'remark'

  ticketId: number
  remarkIndex: number

  remarkDate: number
  remarkDateString: string

  remarkTime: number
  remarkTimeString: string

  remark: string
}

export interface ParkingLocation {
  locationKey: string
  locationName: string
  locationClassKey: string
  isActive: boolean
}

export interface ParkingBylaw {
  bylawNumber: string
  bylawDescription: string
  isActive: boolean

  offenceCount?: number
  offenceAmountMin?: number
  offenceAmountMax?: number

  discountOffenceAmountMin?: number
  discountDaysMin?: number
}

export interface ParkingOffence extends ParkingLocation, ParkingBylaw {
  parkingOffence: string
  offenceAmount: number
  discountOffenceAmount: number
  discountDays: number
  accountNumber: string
}

export interface LicencePlateOwner extends Partial<Record>, LicencePlate {
  recordType: 'owner'

  recordDate: number
  recordDateString?: string

  vehicleNCIC: string
  vehicleMake?: string

  ownerName1: string
  ownerName2: string
  ownerAddress: string
  ownerCity: string
  ownerProvince: string
  ownerPostalCode: string
  ownerGenderKey: string

  driverLicenceNumber: string
}

export interface LicencePlateLookupBatch extends Partial<Record> {
  recordType: 'batch'

  batchId: number

  batchDate: number
  batchDateString: string

  lockDate?: number
  lockDateString?: string

  sentDate?: number
  sentDateString?: string

  receivedDate?: number
  receivedDateString?: string

  mto_includeLabels?: boolean

  batchEntries: LicencePlateLookupBatchEntry[]
}

export interface LicencePlateLookupBatchEntry
  extends LicencePlate,
    ParkingTicket {
  batchId: number
}

export interface ParkingTicketConvictionBatch extends Partial<Record> {
  recordType: 'batch'

  batchId: number

  batchDate: number
  batchDateString: string

  lockDate?: number | null
  lockDateString?: string

  sentDate?: number | null
  sentDateString?: string

  batchEntries?: ParkingTicketStatusLog[]
}

export interface NHTSAMakeModel {
  makeId: number
  makeName: string
  modelId: number
  modelName: string
}

/*
 * USER DB TYPES
 */

declare global {
  export interface PTSUser {
    userName: string
    firstName?: string
    lastName?: string
    canUpdate: boolean
    isAdmin: boolean
    isOperator: boolean
  }
}

declare module 'express-session' {
  interface Session {
    user?: PTSUser
  }
}
