"use strict";
const config = {};
config.defaults = {
    province: "ON"
};
config.locationClasses = [
    {
        locationClassKey: "parkingLot",
        locationClass: "Parking Lot"
    },
    {
        locationClassKey: "parkingMeter",
        locationClass: "Parking Meter"
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
        statusKey: "withdrawn",
        status: "Withdrawn",
        statusField: {
            fieldLabel: "Reason for Withdrawl"
        },
        isFinalStatus: true
    },
    {
        statusKey: "trial",
        status: "Trial Requested",
        statusField: {
            fieldLabel: "Trial Date"
        },
        isFinalStatus: false
    },
    {
        statusKey: "convicted",
        status: "Convicted",
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
config.licencePlateCountryAliases = {
    "CA": "Canada",
    "US": "USA"
};
config.licencePlateProvinceAliases = {
    "Canada": {
        "AB": "Alberta",
        "ALB": "Alberta",
        "BC": "British Columbia",
        "MB": "Manitoba",
        "NB": "New Brunswick",
        "NF": "Newfoundland and Labrador",
        "NL": "Newfoundland and Labrador",
        "NFL": "Newfoundland and Labrador",
        "NFLD": "Newfoundland and Labrador",
        "NS": "Nova Scotia",
        "NOVA": "Nova Scotia",
        "NT": "Northwest Territories",
        "NWT": "Northwest Territories",
        "NU": "Nunavut",
        "NVT": "Nunavut",
        "ON": "Ontario",
        "ONT": "Ontario",
        "PE": "Prince Edward Island",
        "PEI": "Prince Edward Island",
        "QC": "Quebec",
        "QB": "Quebec",
        "PQ": "Quebec",
        "SASK": "Saskatchewan"
    },
    "USA": {
        "MI": "Michigan",
        "NY": "New York"
    }
};
config.licencePlateProvinces = {
    "Canada": {
        countryShortName: "CA",
        "Alberta": {
            provinceShortName: "AB",
            color: "#dd262b",
            backgroundColor: "#fff"
        },
        "British Columbia": {
            provinceShortName: "BC",
            color: "#0049b9",
            backgroundColor: "#fff"
        },
        "Manitoba": {
            provinceShortName: "MB",
            color: "#0c1b46",
            backgroundColor: "#e7e9f8"
        },
        "New Brunswick": {
            provinceShortName: "NB",
            color: "#981729",
            backgroundColor: "#fff"
        },
        "Newfoundland and Labrador": {
            provinceShortName: "NL",
            color: "#042490",
            backgroundColor: "#fff"
        },
        "Nova Scotia": {
            provinceShortName: "NS",
            color: "#0b2875",
            backgroundColor: "#fff"
        },
        "Northwest Territories": {
            provinceShortName: "NT",
            color: "#002786",
            backgroundColor: "#c1c9cb"
        },
        "Nunavut": {
            provinceShortName: "NU",
            color: "#252525",
            backgroundColor: "#5aa5c2"
        },
        "Ontario": {
            provinceShortName: "ON",
            color: "#0661a4",
            backgroundColor: "#fff"
        },
        "Prince Edward Island": {
            provinceShortName: "PE",
            color: "#241f21",
            backgroundColor: "#e5e1d8"
        },
        "Quebec": {
            provinceShortName: "QC",
            color: "#080427",
            backgroundColor: "#fff"
        },
        "Saskatchewan": {
            provinceShortName: "SK",
            color: "#008a59",
            backgroundColor: "#dfe5e2"
        },
        "Yukon": {
            provinceShortName: "YT",
            color: "#252525",
            backgroundColor: "#fff"
        }
    },
    "USA": {
        countryShortName: "US",
        "Michigan": {
            provinceShortName: "MI",
            color: "#0357a0",
            backgroundColor: "#fff"
        }
    }
};
module.exports = config;
