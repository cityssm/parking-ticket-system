"use strict";
const config = {};
config.defaults = {
    province: "ON"
};
config.locationClasses = [
    {
        locationClassKey: "parkingLot",
        locationClass: "Parking Lot"
    }
];
config.parkingTickets = {
    ticketNumber: {
        fieldLabel: "Ticket Number"
    }
};
config.parkingTicketStatuses = [
    {
        statusKey: "paid",
        status: "Paid",
        statusField: {
            fieldLabel: "Receipt Number"
        },
        isFinalStatus: true
    },
    {
        statusKey: "cancel",
        status: "Cancelled",
        statusField: {
            fieldLabel: "Reason for Cancelation"
        },
        isFinalStatus: true
    },
    {
        statusKey: "withdrawn",
        status: "Withdrawn",
        statusField: {
            fieldLabel: "Reason for Withdrawl"
        },
        isFinalStatus: true
    }
];
config.genders = [
    {
        genderKey: "F",
        gender: "Female"
    }, {
        genderKey: "M",
        gender: "Male"
    }
];
module.exports = config;
