[Help Home](readme.md)

# Admin - config.js

The `data/config.js` file is used to customize your application. On first install, the file does not exist.
You can create one from scratch, or get started by using the `data/config-default.js` file as a template.
You can also import configuration from another file, like `data/config-default.js`,
then override the settings you want.

```javascript
let config = {};

// your configuration

module.exports = config;
```

## `config.application = {};`

| Property Name             | Type    | Description                                                     | Default Value             |
| ------------------------- | ------- | --------------------------------------------------------------- | ------------------------- |
| `applicationName`         | string  | Make the application your own by changing the name.             | `"Parking Ticket System"` |
| `logoURL`                 | string  | The path to a custom logo.  Square-shaped images work best.     | `"/images/noParking.svg"` |
| `httpPort`                | number  | The listening port for HTTP.                                    | `4000`                    |
| `https`                   | object  | The HTTPS configuration.                                        | _(Described below)_       |
| `feature_mtoExportImport` | boolean | When `true`, Ontario, Canada specific features will be enabled. | `false`                   |
| `task_nhtsa`              | object  | Configuration for the NHTSA refresh background thread.          | _(Described below)_       |

### `config.application.https = {};`

| Property Name | Type   | Description                                | Default Value |
| ------------- | ------ | ------------------------------------------ | ------------- |
| `port`        | number | The listening port for HTTPS.              | `null`        |
| `keyPath`     | string | The path to the key file.                  | `null`        |
| `certPath`    | string | The path to the certificate file.          | `null`        |
| `passphrase`  | string | The secret passphrase for the certificate. | `null`        |

### `config.application.task_nhtsa = {};`

| Property Name | Type    | Description                                        | Default Value |
| ------------- | ------- | -------------------------------------------------- | ------------- |
| `runTask`     | boolean | When `true`, the NHTSA background task should run. | `false`       |
| `executeHour` | number  | The hour of the day when the task should run.      | 2             |

* * *

## `config.session = {};`

| Property Name  | Type    | Description                                                                        | Default Value                      |
| -------------- | ------- | ---------------------------------------------------------------------------------- | ---------------------------------- |
| `cookieName`   | string  | The name of the session cookie.                                                    | `"parking-ticket-system-user-sid"` |
| `secret`       | string  | The secret used to sign the session cookie.                                        | `"cityssm/parking-ticket-system"`  |
| `maxAgeMillis` | number  | The session timeout in milliseconds.                                               | `3600000`                          |
| `doKeepAlive`  | boolean | When `true`, the browser will ping the web application to keep the session active. | `false`                            |

* * *

## `config.admin = {};`

_Note that this property can be used to activate an admin user,
that can then be used to create a proper admin user in the `users.db`.
It should not be used on an ongoing basis._

| Property Name     | Type   | Description                              | Default Value |
| ----------------- | ------ | ---------------------------------------- | ------------- |
| `defaultPassword` | string | A default password for the _admin_ user. | `null`        |

* * *

## `config.defaults = {};`

| Property Name | Type   | Description                                                               | Default Value |
| ------------- | ------ | ------------------------------------------------------------------------- | ------------- |
| `province`    | string | The default province code, used when creating new parking ticket records. | `""`          |
| `country`     | string | The default country code, used when creating new parking ticket records   | `""`          |

* * *

## `config.parkingTickets = {};`

| Property Name            | Type   | Description                                       | Default Value       |
| ------------------------ | ------ | ------------------------------------------------- | ------------------- |
| `ticketNumber`           | object | Settings for the ticket number field.             | _(Described below)_ |
| `licencePlateExpiryDate` | object | Settings for the licence plate expiry date field. | _(Described below)_ |

### `config.parkingTickets.ticketNumber = {};`

| Property Name        | Type     | Description                                                                                        | Default Value                                  |
| -------------------- | -------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `fieldLabel`         | string   | The display name for the ticket number field.                                                      | `"Ticket Number"`                              |
| `pattern`            | RegExp   | The pattern that the field must match.                                                             | `/^[\d\w -]{1,10}$/`                           |
| `isUnique`           | boolean  | When `true`, the ticket number is checked to make sure it has not been used in the past two years. | `true`                                         |
| `nextTicketNumberFn` | function | A function that returns the next parking ticket number.                                            | `function(currentTicketNumber) { return ""; }` |

### `config.parkingTickets.licencePlateExpiryDate = {};`

| Property Name | Type    | Description                                              | Default Value |
| ------------- | ------- | -------------------------------------------------------- | ------------- |
| `includeDay`  | boolean | When `true`, the expiry date will use a full date field. | `false`       |

* * *

## `config.parkingTicketStatuses = [parkingTicketStatusA, parkingTicketStatusB, ...];`

An array of parking ticket status configuration objects.

### `parkingTicketStatus = {};`

| Property Name             | Type    | Description                                                             | Sample Value       |
| ------------------------- | ------- | ----------------------------------------------------------------------- | ------------------ |
| `statusKey`               | string  | A unique, behind-the-scenes identifier for the ticket status.           | `"paid"`           |
| `status`                  | string  | A human-readable, display name for the status.                          | `"Paid"`           |
| `statusField.fieldLabel`  | string  | A human-readable label for the first status field.                      | `"Amount Paid"`    |
| `statusField2.fieldLabel` | string  | A human-readable label for the second status field.                     | `"Receipt Number"` |
| `isFinalStatus`           | boolean | When `true`, the ticket can be marked as resolved by this status.       | `true`             |
| `isUserSettable`          | boolean | When `true`, the status will be available from the "Add Status" window. | `false`            |

* * *

## `config.licencePlateCountryAliases = { [countryShortName: string]: string };`

An object mapping country short names to full country names.

```javascript
// Sample
config.licencePlateCountryAliases = {
  "CA": "Canada",
  "US": "USA"
};
```

* * *

## `config.licencePlateProvinceAliases = { [countryName: string]: { [provinceShortName: string]: string } };`

An object mapping province short names to full province names.

```javascript
// Sample
config.licencePlateProvinceAliases = {
  "Canada": {
    AB: "Alberta",
    BC: "British Columbia",
    MB: "Manitoba",
    NB: "New Brunswick",
    NL: "Newfoundland and Labrador",
    NS: "Nova Scotia",
    NT: "Northwest Territories",
    NU: "Nunavut",
    ON: "Ontario",
    PE: "Prince Edward Island",
    QC: "Quebec",
    SK: "Saskatchewan",
    YT: "Yukon"
  },
  "USA": {
    AL: "Alabama",
    // ...
    WY: "Wyoming"
  }
};
```

* * *

## `config.licencePlateProvinces = { [countryName: string]: licencePlateCountry };`

An object of province details.

### `licencePlateCountry = {};`

| Property Name      | Type                                               | Description                            |
| ------------------ | -------------------------------------------------- | -------------------------------------- |
| `countryShortName` | string                                             | The proper short name for the country. |
| `provinces`        | `{ [provinceName: string]: licencePlateProvince }` | An object of province definitions.     |

### `licencePlateProvince = {};`

| Property Name       | Type   | Description                                      |
| ------------------- | ------ | ------------------------------------------------ |
| `provinceShortName` | string | The proper short name for the province.          |
| `color`             | string | The color code for the licence plate text.       |
| `backgroundColor`   | string | The color code for the licence plate background. |

```javascript
// Sample
config.licencePlateProvinces = {
  "Canada": {
    countryShortName: "CA",
    provinces: {
      "Alberta": {
        provinceShortName: "AB",
        color: "#dd262b",
        backgroundColor: "#fff"
      },
      // ...
      "Ontario": {
        provinceShortName: "ON",
        color: "#0661a4",
        backgroundColor: "#fff"
      },
      // ...
      "Yukon": {
        provinceShortName: "YT",
        color: "#252525",
        backgroundColor: "#fff"
      }
    }
  },
  "USA": {
    // ...
  }
};
```

* * *

## `config.genders = [ genderA, genderB, ... ];`

An array of observed genders.

### `gender = {};`

| Property Name | Type   | Description                         | Sample Value |
| ------------- | ------ | ----------------------------------- | ------------ |
| `genderKey`   | string | A unique identifier for the gender. | `"F"`        |
| `gender`      | string | The full gender name.               | `"Female"`   |

* * *

## `config.parkingOffences = {};`

| Property Name           | Type   | Description                                       | Default Value        |
| ----------------------- | ------ | ------------------------------------------------- | -------------------- |
| `accountNumber.pattern` | RegExp | A regular expression to validate account numbers. | `/^[\d\w -]{1,20}$/` |

* * *

## `config.locationClasses = [ locationClassA, locationClassB, ... ];`

An array of location classes.

### `locationClass = {};`

| Property Name      | Type   | Description                                 | Sample Value    |
| ------------------ | ------ | ------------------------------------------- | --------------- |
| `locationClassKey` | string | A unique identifier for the location class. | `"parkingLot"`  |
| `locationClass`    | string | The human-readable location class name.     | `"Parking Lot"` |

* * *

## `config.databaseCleanup = {};`

| Property Name | Type   | Description                                                                      | Default Value |
| ------------- | ------ | -------------------------------------------------------------------------------- | ------------- |
| `windowDays`  | number | The number of days after a record has been deleted when it can be safely purged. | `30`          |

* * *

## `config.mtoExportImport = {};`

Configuration settings when using the Ontario, Canada MTO integrations.

| Property Name    | Type   | Description                                    | Sample Value |
| ---------------- | ------ | ---------------------------------------------- | ------------ |
| `authorizedUser` | string | The key associated with your acocunt with MTO. | `"XXXX"`     |
