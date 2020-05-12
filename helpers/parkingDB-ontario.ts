import {dbPath} from "./parkingDB";

import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

type MTO_AvailableLicencePlate = {
  licencePlateNumber: string,
  ticketCount: number,
  issueDateMin: number,
  issueDateMinString: string,
  issueDateMax: number,
  issueDateMaxString: string,
  ticketNumbersConcat: string,
  ticketNumbers: string[]
}

export function getLicencePlatesAvailableForMTOLookupBatch(currentBatchID: number, issueDaysAgo: number) {

  const addCalculatedFieldsFn = function(plateRecord: MTO_AvailableLicencePlate) {
    plateRecord.issueDateMinString = dateTimeFns.dateIntegerToString(plateRecord.issueDateMin);
    plateRecord.issueDateMaxString = dateTimeFns.dateIntegerToString(plateRecord.issueDateMax);
    plateRecord.ticketNumbers = plateRecord.ticketNumbersConcat.split(":");
    delete plateRecord.ticketNumbersConcat;
  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  let issueDateNumber = 99999999;

  if (issueDaysAgo !== -1) {
    let issueDate = new Date();
    issueDate.setDate(issueDate.getDate() - issueDaysAgo);
    issueDateNumber = dateTimeFns.dateToInteger(issueDate);
  }

  const plates: MTO_AvailableLicencePlate[] = db.prepare("select t.licencePlateNumber," +
    " min(t.ticketID) as ticketIDMin," +
    " count(t.ticketID) as ticketCount," +
    " group_concat(t.ticketNumber, ':') as ticketNumbersConcat," +
    " min(t.issueDate) as issueDateMin," +
    " max(t.issueDate) as issueDateMax" +
    " from ParkingTickets t" +
    " left join LicencePlateLookupBatchEntries e on t.licencePlateNumber = e.licencePlateNumber and (t.ticketID = e.ticketID or e.batchID = ?)" +
    " where t.recordDelete_timeMillis is null" +
    " and t.licencePlateCountry = 'CA'" +
    " and t.licencePlateProvince = 'ON'" +
    " and t.licencePlateNumber != ''" +
    " and t.resolvedDate is null" +
    " and e.batchID is null" +
    (" and not exists (" +
      "select 1 from ParkingTicketStatusLog s" +
      " where t.ticketID = s.ticketID and s.recordDelete_timeMillis is null" +
      " and s.statusKey in ('ownerLookupPending', 'ownerLookupMatch', 'ownerLookupError'))") +
    " and t.issueDate <= ?" +
    " group by t.licencePlateNumber" +
    " order by t.licencePlateNumber")
    .all(currentBatchID, issueDateNumber);

  db.close();

  plates.forEach(addCalculatedFieldsFn);

  return plates;

}
