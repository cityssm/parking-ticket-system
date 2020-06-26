[Help Home](readme.md)

# Admin - Getting Started

Managing parking tickets issued within a municipality is oftentimes a one or two person job.
While this application can run on a high end server, that is by no means a requirement.
Most user workstations are sufficient.

## Step 1: Install Node.js and npm

[Node.js](https://nodejs.org) is a JavaScript runtime environment.
The Parking Ticket System is built to run on Node.js.

[npm](https://www.npmjs.com/) is a package manager that contains all the prerequisites
for the Parking Ticket System.

Node.js can run on Windows, Mac, and Linux.
Installers on the [Node.js website](https://nodejs.org) include npm.
Node.js and npm are also available in most package managers.

    > sudo apt install nodejs
    > sudo apt install npm

## Step 2: Install Git

[Git](https://git-scm.com/) is the version control system that manages the
code for the Lottery Licence System.

Git can run on Windows, Mac, and Linux.
You can install it using an install on the [Git website](https://git-scm.com/),
or from most package managers.

    > sudo apt install git

## Step 3: Clone the `parking-ticket-system` repository

Open a command line, and navigate to the folder where the application will reside.

    > git clone https://github.com/cityssm/parking-ticket-system

## Step 4: Install the dependencies

    > cd parking-ticket-system
    > npm install

## Step 5: Create a `config.js` file

It is recommended to copy the `config-default.js` file to get started.
It includes the base rules used within the province of Ontario.

    > cp data/config-default.js data/config.js

## Step 6: Start the application

    > node ./bin/www
