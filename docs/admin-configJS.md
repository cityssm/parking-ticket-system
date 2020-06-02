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


Property Name     | Type   | Description                                                 | Default Value
----------------- | ------ | ----------------------------------------------------------- | --------------------------
`applicationName` | string | Make the application your own by changing the name.         | `"Parking Ticket System"`
`logoURL`         | string | The path to a custom logo.  Square-shaped images work best. | `"/images/noParking.svg"`
`httpPort`        | number | The listening port for HTTP.                                | `4000`
`https`           | object | The HTTPS configuration.                                    | *(Described below)*
`feature_mtoExportImport` |  boolean | When `true`, Ontario, Canada specific features will be enabled. | `false`
`task_nhtsa`      | object | Configuration for the NHTSA refresh background thread. | *(Described below)*



### `config.application.https = {};`

Property Name | Type   | Description                                | Default Value
------------- | ------ | ------------------------------------------ | -------------
`port`        | number | The listening port for HTTPS.              | `null`
`keyPath`     | string | The path to the key file.                  | `null`
`certPath`    | string | The path to the certificate file.          | `null`
`passphrase`  | string | The secret passphrase for the certificate. | `null`


### `config.application.task_nhtsa = {};`

Property Name | Type    | Description                                        | Default Value
------------- | ------- | -------------------------------------------------- | -------------
`runTask`     | boolean | When `true`, the NHTSA background task should run. | `false`
`executeHour` | number  | The hour of the day when the task should run.      | 2

---

## `config.session = {};`

Property Name  | Type    | Description                                 | Default Value
-------------- | ------- | ------------------------------------------- | -------------
`cookieName`   | string  | The name of the session cookie.             | `"parking-ticket-system-user-sid"`
`secret`       | string  | The secret used to sign the session cookie. | `"cityssm/parking-ticket-system"`
`maxAgeMillis` | number  | The session timeout in milliseconds.        | `3600000`
`doKeepAlive`  | boolean | When `true`, the browser will ping the web application to keep the session active. | `false`

---

## `config.admin = {};`

*Note that this property can be used to activate an admin user,
that can then be used to create a proper admin user in the `users.db`.
It should not be used on an ongoing basis.*

Property Name     | Type   | Description                              | Default Value
----------------- | ------ | ---------------------------------------- | -------------
`defaultPassword` | string | A default password for the *admin* user. | `null`

---

## `config.defaults = {};`


Property Name | Type   | Description                                                               | Default Value
------------- | ------ | ------------------------------------------------------------------------- | -------------
`province`    | string | The default province code, used when creating new parking ticket records. | `""`
`country`     | string | The default country code, used when creating new parking ticket records   | `""`

---

## `config.parkingTickets = {};`

Property Name            | Type   | Description                                       | Default Value
------------------------ | ------ | ------------------------------------------------- | -------------------
`ticketNumber`           | object | Settings for the ticket number field.             | *(Described below)*
`licencePlateExpiryDate` | object | Settings for the licence plate expiry date field. | *(Described below)*


### `config.parkingTickets.ticketNumber = {};`

Property Name        | Type     | Description                                       | Default Value
-------------------- | -------- | ------------------------------------------------- | -------------------
`fieldLabel`         | string   | The display name for the ticket number field.     | `"Ticket Number"`
`pattern`            | RegExp   | The pattern that the field must match.            | `/^[\d\w -]{1,10}$/`
`isUnique`           | boolean  | When `true`, the ticket number is checked to make sure it has not been used in the past two years. | `true`
`nextTicketNumberFn` | function | A function that returns the next parking ticket number. | `function(currentTicketNumber) { return ""; }`


### `config.parkingTickets.licencePlateExpiryDate = {};`

---

## `config.parkingTicketStatuses = {};`

---

## `config.licencePlateCountryAliases = {};`

---

## `config.licencePlateProvinceAliases = {};`

---

## `config.licencePlateProvinces = {};`

---

## `config.genders = {};`

---

## `config.parkingOffences = {};`

---

## `config.locationClasses = {};`

---

## `config.mtoExportImport = {};`
