"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseParkingTicketStatuses = [
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
        statusKey: "trial",
        status: "Trial Requested",
        statusField: {
            fieldLabel: "Trial Date"
        },
        isFinalStatus: false,
        isUserSettable: true
    },
    {
        statusKey: "convicted",
        status: "Convicted",
        statusField: {
            fieldLabel: "Batch ID"
        },
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
        statusField: {
            fieldLabel: "Lookup Record Date"
        },
        isFinalStatus: false,
        isUserSettable: false
    },
    {
        statusKey: "ownerLookupError",
        status: "Ownership Lookup - Error",
        statusField: {
            fieldLabel: "Lookup Vehicle NCIC"
        },
        isFinalStatus: false,
        isUserSettable: false
    },
    {
        statusKey: "convictionBatch",
        status: "Conviction Batch",
        statusField: {
            fieldLabel: "Batch ID"
        },
        isFinalStatus: true,
        isUserSettable: false
    }
];
