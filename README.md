# Moosync Extension boilerplate

## Quick Overview

This is a minimal starter app that benefits of the strong typing of the Typescript compiler plus all the latest ES6, ES7+ features
on a NodeJS application.


## Usage

## Installation

Clone the repository then:

``` bash
yarn install
```

To install all dependencies.

## Writing code

Custom types can be defined under `src/types`

Functionality of the extension can be implemented in `extension.ts`

### Package details

Details of the package can be changed inside `package.json`

#### Inside `package.json`

**name** is the unique package name of the extension. Can not contain whitespace.

**version** is the version of the extension.

**moosyncExtension** is the file which is read when extension is loaded in Moosync.

**displayName** is the Name of the extension. May contain whitespace.

**author** is the name of the author of the extension.

## Extension Lifecycle

The extension system in Moosync makes use of events to functions.

### Events

**Documentation for events can be found [here](https://moosync.cf/docs/extensions_api/interfaces/index.MoosyncExtensionTemplate.html)**

The basic events are:

- onStarted: Fired when extension is started
- onStopped: Fired when extension is stopped

It is recommended to create an instance of your required code inside the onStarted Event and destroy the same in onStopped.

Example for implementation of each event can be found [here](https://github.com/Moosync/extension-typescript-template/blob/main/src/extension.ts)

### API

You may also make use of the on demand API to fetch data from Moosync.

Documentation for the API can be found [here](https://moosync.cf/docs/extensions_api/interfaces/index.extensionAPI.html)

## Creating the extension

To generate the output of webpack

``` bash
yarn webpack:build
```

To Build and pack the extension for Moosync using [Moosync packer](https://github.com/Moosync/extension-packer)

``` bash
yarn build
```
