"use strict";
const base = require("../data/config-base");
const config = {};
config.application = {
    feature_mtoExportImport: true,
    task_nhtsa: {
        runTask: true,
        executeHour: 1
    }
};
config.session = {};
config.defaults = {
    country: "CA",
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
    },
    licencePlateExpiryDate: {
        includeDay: false
    }
};
config.parkingTicketStatuses = base.baseParkingTicketStatuses;
config.parkingOffences = {
    accountNumber: {}
};
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
        AB: "Alberta",
        ALB: "Alberta",
        ALTA: "Alberta",
        BC: "British Columbia",
        MB: "Manitoba",
        MAN: "Manitoba",
        NB: "New Brunswick",
        NL: "Newfoundland and Labrador",
        NS: "Nova Scotia",
        NT: "Northwest Territories",
        NWT: "Northwest Territories",
        NU: "Nunavut",
        NVT: "Nunavut",
        ON: "Ontario",
        ONT: "Ontario",
        PE: "Prince Edward Island",
        PEI: "Prince Edward Island",
        QC: "Quebec",
        QUE: "Quebec",
        SK: "Saskatchewan",
        SASK: "Saskatchewan",
        YT: "Yukon",
        YUK: "Yukon",
        YN: "Yukon"
    },
    "USA": {
        AL: "Alabama",
        AK: "Alaska",
        AZ: "Arizona",
        AR: "Arkansas",
        CA: "California",
        CO: "Colorado",
        CT: "Connecticut",
        DE: "Delaware",
        DC: "District of Columbia",
        FL: "Florida",
        GA: "Georgia",
        HI: "Hawaii",
        ID: "Idaho",
        IL: "Illinois",
        IN: "Indiana",
        IA: "Iowa",
        KS: "Kansas",
        KY: "Kentucky",
        LA: "Louisiana",
        ME: "Maine",
        MD: "Maryland",
        MA: "Massachusetts",
        MI: "Michigan",
        MN: "Minnesota",
        MS: "Mississippi",
        MO: "Missouri",
        MT: "Montana",
        NE: "Nebraska",
        NV: "Nevada",
        NH: "New Hampshire",
        NJ: "New Jersey",
        NM: "New Mexico",
        NY: "New York",
        NC: "North Carolina",
        ND: "North Dakota",
        OH: "Ohio",
        OK: "Oklahoma",
        OR: "Oregon",
        PA: "Pennsylvania",
        RI: "Rhode Island",
        SC: "South Carolina",
        SD: "South Dakota",
        TN: "Tennessee",
        TX: "Texas",
        UT: "Utah",
        VT: "Vermont",
        VA: "Virginia",
        WA: "Washington",
        WV: "West Virginia",
        WI: "Wisconsin",
        WY: "Wyoming"
    }
};
config.licencePlateProvinces = {
    "Canada": {
        countryShortName: "CA",
        provinces: {
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
        }
    },
    "USA": {
        countryShortName: "US",
        provinces: {
            "Michigan": {
                provinceShortName: "MI",
                color: "#0357a0",
                backgroundColor: "#fff"
            }
        }
    }
};
config.mtoExportImport = {};
module.exports = config;
