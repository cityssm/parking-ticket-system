import * as pts from "../helpers/ptsTypes";

export const baseParkingTicketStatuses : pts.Config_ParkingTicketStatus[] = [
  {
    statusKey: "paid",
    status: "Paid",
    statusField: {
      fieldLabel: "Receipt Number"
    },
    isFinalStatus: true,
    isUserSettable: true
  },
  {
    statusKey: "withdrawn",
    status: "Withdrawn",
    statusField: {
      fieldLabel: "Reason for Withdrawl"
    },
    isFinalStatus: true,
    isUserSettable: true
  },
  {
    statusKey: "convicted",
    status: "Convicted",
    isFinalStatus: true,
    isUserSettable: true
  },
  
  {
    statusKey: "ownerLookupPending",
    status: "Ownership Lookup - Pending",
    statusField: {
      fieldLabel: "Batch ID"
    },
    isFinalStatus: false,
    isUserSettable: false
  },
  {
    statusKey: "ownerLookupMatch",
    status: "Ownership Lookup - Match Found",
    isFinalStatus: false,
    isUserSettable: false
  },
  {
    statusKey: "ownerLookupError",
    status: "Ownership Lookup - Error",
    isFinalStatus: false,
    isUserSettable: false
  }
];
