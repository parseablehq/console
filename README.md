<h2 align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/parseablehq/.github/main/images/logo-dark.png">
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/parseablehq/.github/main/images/logo.svg">
      <img alt="Parseable Logo" src="https://raw.githubusercontent.com/parseablehq/.github/main/images/logo.svg">
    </picture>
    <br>
    Cloud native log analytics
</h2>

<div align="center">

[![Docker Pulls](https://img.shields.io/docker/pulls/parseable/parseable?logo=docker&label=Docker%20Pulls)](https://hub.docker.com/r/parseable/parseable)
[![Slack](https://img.shields.io/badge/slack-brightgreen.svg?logo=slack&label=Community&style=flat&color=%2373DC8C&)](https://launchpass.com/parseable)
[![Docs](https://img.shields.io/badge/stable%20docs-parseable.io%2Fdocs-brightgreen?style=flat&color=%2373DC8C&label=Docs)](https://www.parseable.io/docs)
[![Build](https://img.shields.io/github/checks-status/parseablehq/parseable/main?style=flat&color=%2373DC8C&label=Checks)](https://github.com/parseablehq/parseable/actions)

</div>

[Parseable](https://github.com/parseablehq/parseable) is a cloud native log analytics system. It ingests log data via HTTP POST calls and exposes a query API to search and analyze logs. Parseable is compatible with logging agents like FluentBit, LogStash, FileBeat among others.

This repository contains the source code for Parseable Console. Console is the web interface for Parseable. It allows you to view and analyze logs in real time.

Parseable Console is deeply integrated with Parseable server, and server binary has Console built-in. So, you don't need to build/run the Console separately.

For complete Parseable API documentation, refer to [Parseable API workspace on Postman](https://www.postman.com/parseable/workspace/parseable/overview).

![Parseable Console](https://raw.githubusercontent.com/parseablehq/.github/main/images/console.png)

## :eyes: Live Demo

<table>
<tr>
    <td>URL</td>
    <td><a href="https://demo.parseable.io" target="_blank">https://demo.parseable.io</a></td>
</tr>
<tr>
    <td>Username</td>
    <td>admin</td>
</tr>
<tr>
    <td>Password</td>
    <td>admin</td>
</tr>
</table>

Please do not store any sensitive data on this server as the data is openly accessible. We'll delete the data on this server periodically.

## :trophy: Development and Contributing

If you're looking to develop or test Parseable Console, you can follow the steps below.

1. Clone the repository.
2. Create `.env.development.local` and copy the content of `.env.example` into it (Fill in the values). By default, the console points to the demo server.
3. Run `pnpm install` to install all the dependencies.
4. Run `pnpm dev` to start the console.
5. Open `http://localhost:3001` in your browser.

To test production build

1. Run `pnpm build:test` to create a release build in test mode.
2. Run `pnpm start` to start the console.
3. Open `http://localhost:3002` in your browser.

Also, please refer to the contributing guide [here](https://www.parseable.io/docs/contributing).

### Our Contributors

<a href="https://github.com/parseablehq/console"><img src="https://contrib.rocks/image?repo=parseablehq/console" /></a>

### Supported by

<a href="https://fossunited.org/" target="_blank"><img src="http://fossunited.org/files/fossunited-badge.svg"></a>

## 📓 License

Licensed under the GNU Affero General Public License, Version 3 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[https://www.gnu.org/licenses/agpl-3.0.txt](https://www.gnu.org/licenses/agpl-3.0.txt)
