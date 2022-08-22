# API DESIGN DOCUMENTATION

This document is the specification for an accounting backend service.

## Installation

```bash
npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Endpoints

All endpoint specifications can be found [here](https://simple-bank-accounts.herokuapp.com/api/docs/v1)

## Postman Public Link

Public link to the postman collections can be found [here](https://www.getpostman.com/collections/660250963b5ecebeabaf)

## Database Schema

The database schema can be found [here](https://dbdiagram.io/d/62404c6abed6183873067fbf)

## Technology Stack

- Node.js version 16
- Nestjs framework version 9
- Jest
- MySQL
- Knex ORM
- Heroku

## Application Features

- Account Creation
- Account Funding
- Withdrawal
- Transfer
- Login

### Account Creation

The account creation feature allows a user to create an account by providing the following information.

- First name of the user creating the account
- Last name of the user creating the account
- Email of the user creating the account
- Password to secure the account

The email address has to be unique and must not currently be in use in the system

### Account Funding

The account funding feature allows a user to add funds to their account. The following details are required.

- The id of the current user
- Amount to fund the account with

The amount must be a positive value

### Account Withdrawal

The withdrawal feature allows a user to withdraw funds from their account. The following details are required.

- The id of the current user
- Amount to withdraw from the account

The amount must be a positive value

### Transfer

The transfer feature allows a user to transfer funds from their account to the account of another user within the system.

- The id of the current user
- The id of the recipient user
- The amount to transfer

The amount must be a positive value

### Login

The login feature allows a user to login and obtain an authorization token to use for subsequent requests. The details required includes;

- The registered email address of the user
- The password of the user during account creation
