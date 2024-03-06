import { dateIntegerToString, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { canUpdateObject } from '../parkingDB.js';
import getLicencePlateOwner from './getLicencePlateOwner.js';
import getParkingLocation from './getParkingLocation.js';
import getParkingTicketRemarks from './getParkingTicketRemarks.js';
import getParkingTicketStatuses from './getParkingTicketStatuses.js';
export default async function getParkingTicket(ticketId, sessionUser) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const ticket = database
        .prepare(`select t.*,
        l.locationName,
        s.statusKey as ownerLookup_statusKey,
        s.statusField as ownerLookup_statusField
        from ParkingTickets t
        left join ParkingTicketStatusLog s
          on t.ticketId = s.ticketId
          and s.statusKey in ('ownerLookupPending', 'ownerLookupError', 'ownerLookupMatch')
          and s.recordDelete_timeMillis is null
        left join ParkingLocations l
          on t.locationKey = l.locationKey
        where t.ticketId = ?
        order by s.statusDate desc, s.statusIndex desc
        limit 1`)
        .get(ticketId);
    if (ticket === undefined) {
        database.close();
        return undefined;
    }
    ticket.recordType = 'ticket';
    ticket.issueDateString = dateIntegerToString(ticket.issueDate);
    ticket.issueTimeString = timeIntegerToString(ticket.issueTime);
    ticket.licencePlateExpiryDateString = dateIntegerToString(ticket.licencePlateExpiryDate);
    if (ticket.licencePlateExpiryDateString !== '') {
        ticket.licencePlateExpiryYear = Number.parseInt(ticket.licencePlateExpiryDateString.slice(0, 4), 10);
        ticket.licencePlateExpiryMonth = Number.parseInt(ticket.licencePlateExpiryDateString.slice(5, 7), 10);
    }
    ticket.resolvedDateString = dateIntegerToString(ticket.resolvedDate);
    ticket.canUpdate = canUpdateObject(ticket, sessionUser);
    if (ticket.ownerLookup_statusKey === 'ownerLookupMatch') {
        ticket.licencePlateOwner = await getLicencePlateOwner(ticket.licencePlateCountry, ticket.licencePlateProvince, ticket.licencePlateNumber, Number.parseInt(ticket.ownerLookup_statusField, 10), database);
    }
    ticket.location = getParkingLocation(ticket.locationKey, database);
    ticket.statusLog = getParkingTicketStatuses(ticketId, sessionUser, database);
    if (!ticket.canUpdate) {
        for (const status of ticket.statusLog) {
            status.canUpdate = false;
        }
    }
    ticket.remarks = getParkingTicketRemarks(ticketId, sessionUser, database);
    if (!ticket.canUpdate) {
        for (const remark of ticket.remarks) {
            remark.canUpdate = false;
        }
    }
    database.close();
    return ticket;
}
