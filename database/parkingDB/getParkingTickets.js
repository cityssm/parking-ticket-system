import { dateIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { canUpdateObject, getSplitWhereClauseFilter } from '../parkingDB.js';
function addCalculatedFields(ticket, sessionUser) {
    ticket.recordType = 'ticket';
    ticket.issueDateString = dateIntegerToString(ticket.issueDate);
    ticket.resolvedDateString = dateIntegerToString(ticket.resolvedDate);
    ticket.latestStatus_statusDateString = dateIntegerToString(ticket.latestStatus_statusDate);
    ticket.canUpdate = canUpdateObject(ticket, sessionUser);
}
function buildWhereClause(queryOptions) {
    const sqlParameters = [];
    let sqlWhereClause = ' where t.recordDelete_timeMillis is null';
    if (queryOptions.isResolved !== undefined) {
        sqlWhereClause += queryOptions.isResolved
            ? ' and t.resolvedDate is not null'
            : ' and t.resolvedDate is null';
    }
    if ((queryOptions.ticketNumber ?? '') !== '') {
        const filter = getSplitWhereClauseFilter('t.ticketNumber', queryOptions.ticketNumber ?? '');
        sqlWhereClause += filter.sqlWhereClause;
        sqlParameters.push(...filter.sqlParams);
    }
    if ((queryOptions.licencePlateNumber ?? '') !== '') {
        const filter = getSplitWhereClauseFilter('t.licencePlateNumber', queryOptions.licencePlateNumber ?? '');
        sqlWhereClause += filter.sqlWhereClause;
        sqlParameters.push(...filter.sqlParams);
    }
    if ((queryOptions.licencePlateNumberEqual ?? '') !== '') {
        sqlWhereClause += ' and t.licencePlateNumber = ?';
        sqlParameters.push(queryOptions.licencePlateNumberEqual);
    }
    if ((queryOptions.licencePlateProvince ?? '') !== '') {
        sqlWhereClause += ' and t.licencePlateProvince = ?';
        sqlParameters.push(queryOptions.licencePlateProvince);
    }
    if ((queryOptions.licencePlateCountry ?? '') !== '') {
        sqlWhereClause += ' and t.licencePlateCountry = ?';
        sqlParameters.push(queryOptions.licencePlateCountry);
    }
    if ((queryOptions.location ?? '') !== '') {
        const locationPieces = (queryOptions.location ?? '')
            .toLowerCase()
            .split(' ');
        for (const locationPiece of locationPieces) {
            sqlWhereClause +=
                ' and (instr(lower(t.locationDescription), ?) or instr(lower(l.locationName), ?))';
            sqlParameters.push(locationPiece, locationPiece);
        }
    }
    return {
        sqlWhereClause,
        sqlParameters
    };
}
export default function getParkingTickets(sessionUser, queryOptions) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const sqlWhereClause = buildWhereClause(queryOptions);
    const count = database
        .prepare(`select ifnull(count(*), 0) as cnt
        from ParkingTickets t
        left join ParkingLocations l on t.locationKey = l.locationKey
        ${sqlWhereClause.sqlWhereClause}`)
        .pluck()
        .get(sqlWhereClause.sqlParameters);
    const rows = database
        .prepare(`select t.ticketId, t.ticketNumber, t.issueDate,
        t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber, t.licencePlateIsMissing,
        t.locationKey, l.locationName, l.locationClassKey, t.locationDescription,
        t.parkingOffence, t.offenceAmount,
        t.resolvedDate,
        s.statusDate as latestStatus_statusDate,
        s.statusKey as latestStatus_statusKey,
        t.recordCreate_userName, t.recordCreate_timeMillis,
        t.recordUpdate_userName, t.recordUpdate_timeMillis
        from ParkingTickets t
        left join ParkingLocations l on t.locationKey = l.locationKey
        left join ParkingTicketStatusLog s
          on t.ticketId = s.ticketId
          and s.statusIndex = (
            select statusIndex from ParkingTicketStatusLog s
            where t.ticketId = s.ticketId
            and s.recordDelete_timeMillis is null
            order by s.statusDate desc, s.statusTime desc, s.statusIndex desc
            limit 1)
        ${sqlWhereClause.sqlWhereClause}
        order by t.issueDate desc, t.ticketNumber desc
        limit ${queryOptions.limit.toString()}
        offset ${queryOptions.offset.toString()}`)
        .all(sqlWhereClause.sqlParameters);
    database.close();
    for (const ticket of rows) {
        addCalculatedFields(ticket, sessionUser);
    }
    return {
        count,
        limit: queryOptions.limit,
        offset: queryOptions.offset,
        tickets: rows
    };
}
export function getParkingTicketsByLicencePlate(licencePlateCountry, licencePlateProvince, licencePlateNumber, sessionUser) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const sqlWhereClause = buildWhereClause({
        licencePlateCountry,
        licencePlateProvince,
        licencePlateNumberEqual: licencePlateNumber
    });
    const rows = database
        .prepare(`select t.ticketId, t.ticketNumber, t.issueDate, t.vehicleMakeModel,
        t.locationKey, l.locationName, l.locationClassKey, t.locationDescription,
        t.parkingOffence, t.offenceAmount, t.resolvedDate,
        s.statusDate as latestStatus_statusDate, s.statusKey as latestStatus_statusKey,
        t.recordCreate_userName, t.recordCreate_timeMillis, t.recordUpdate_userName, t.recordUpdate_timeMillis
        from ParkingTickets t
        left join ParkingLocations l on t.locationKey = l.locationKey
        left join ParkingTicketStatusLog s on t.ticketId = s.ticketId
          and s.statusIndex = (select statusIndex from ParkingTicketStatusLog s where t.ticketId = s.ticketId order by s.statusDate desc, s.statusTime desc, s.statusIndex desc limit 1)
      ${sqlWhereClause.sqlWhereClause}
      order by t.issueDate desc, t.ticketNumber desc`)
        .all(sqlWhereClause.sqlParameters);
    database.close();
    for (const ticket of rows) {
        addCalculatedFields(ticket, sessionUser);
    }
    return rows;
}
