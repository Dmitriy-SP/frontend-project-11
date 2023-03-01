# RSS Reader

[![Actions Status](https://github.com/Dmitriy-SP/frontend-project-11/workflows/hexlet-check/badge.svg)](https://github.com/Dmitriy-SP/frontend-project-11/actions)
[![CI](https://github.com/Dmitriy-SP/frontend-project-46/actions/workflows/github-action-check.yml/badge.svg)](https://github.com/Dmitriy-SP/frontend-project-11/actions/workflows/github-action-check.yml)
<a href="https://codeclimate.com/github/Dmitriy-SP/frontend-project-11/maintainability"><img src="https://api.codeclimate.com/v1/badges/a19e4fcf907f8493a4c1/maintainability" /></a>

Rss Reader is a service for aggregating RSS feeds, with which it is convenient to read sources, such as blogs.<br>
<a href="https://frontend-project-11-inky.vercel.app/">You can try web-version on vercel.</a>

- [Description](#Description)
- [Installation](#Installation)
- [Usage](#Usage)

## Description

This service allows you to add an unlimited number of RSS feeds, updates them automatically and adds new posts to the general newsline.
Subscribing to RSS feeds can allow a user to keep track of many different websites in a single news aggregator, which constantly monitor sites for new content, removing the need for the user to manually check them.
Post description preview enabled via modal window.

## Installation

```
git clone git@github.com:Dmitriy-SP/frontend-project-11.git
make install
```

## Usage

Deploy local server:

```
$ make develop
```

Build production:

```
$ make build
```