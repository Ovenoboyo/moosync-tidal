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

## Creating the extension

To generate the output of webpack

``` bash
yarn webpack:build
```

To Build and pack the extension for Moosync

``` bash
yarn build
```
