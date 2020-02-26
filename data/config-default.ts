import * as pts from "../helpers/ptsTypes";

const config: pts.Config = {};

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
}

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
    "ON": "Ontario",
    "ONT": "Ontario",

    "QC": "Quebec",
    "QB": "Quebec",
    "PQ": "Quebec"
  },
  "USA": {
    "MI": "Michigan"
  }
};

config.licencePlateProvinces = {

  "Canada": {
    "Ontario": {
      color: "#0661a4",
      backgroundColor: "#fff"
    }
  }
};

export = config;
