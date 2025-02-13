<p align="center">
  <a href="https://strapi.io/#gh-light-mode-only">
    <img src="https://strapi.io/assets/strapi-logo-dark.svg" width="318px" alt="Strapi logo" />
  </a>
  <a href="https://strapi.io/#gh-dark-mode-only">
    <img src="https://strapi.io/assets/strapi-logo-light.svg" width="318px" alt="Strapi logo" />
  </a>
</p>

<h2 align="center">Manage Your Strapi Content From Anywhere 🚀</h2>
<p align="center">Connect your JavaScript/TypeScript apps to a flexible and fully customizable Strapi backend with ease.</p>
<p align="center"><a href="https://github.com/strapi/strapi">CMS Repository</a> - <a href="https://strapi.io">Website</a> - <a href="https://www.notion.so/strapi/Strapi-JavaScript-SDK-plan-15f8f35980748046b7f8fb207b29c64b">SDK Roadmap</a></p>
<br />

<p align="center">
  <a href="https://www.npmjs.org/package/@strapi/client">
    <img src="https://img.shields.io/npm/v/@strapi/client/latest.svg" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.com/package/@strapi/client" target="_blank">
   <img src="https://img.shields.io/npm/dm/@strapi/client" alt="NPM downloads" />
  </a>
  <a href="https://github.com/strapi/client/actions/workflows/tests.yml">
    <img src="https://github.com/strapi/client/actions/workflows/tests.yml/badge.svg?branch=main" alt="Tests" />
  </a>
  <a href="https://discord.strapi.io">
    <img src="https://img.shields.io/discord/811989166782021633?label=Discord" alt="Strapi on Discord" />
  </a>
</p>

<br>

## 📖 Table of contents

1. [Getting Started](#-getting-started)
   - [Prerequisites](#pre-requisites)
   - [Installation](#installation)
2. [Creating and Configuring an SDK Instance](#-creating-and-configuring-the-sdk-instance)
   - [Basic Configuration](#basic-configuration)
   - [Authentication](#authentication)
     - [API Token Authentication](#api-token-authentication)
3. [API Reference](#-api-reference)
4. [Resource Managers](#-resource-managers)
   - [`.collection()`](#collectionresource)
   - [`.single()`](#singleresource)
5. [Debug](#-debug)
6. [Demo Projects](#-demo-projects)

## 🛠 Getting started

### Pre-Requisites

Before you begin, ensure you have the following:

- A Strapi backend up and running: [quick start guide](https://docs.strapi.io/dev-docs/quick-start).
- The API URL of your Strapi instance: for example, `http://localhost:1337/api`.
- A recent version of [Node.js](https://nodejs.org/en/download/package-manager) installed.

### Installation

Install the SDK as a dependency in your project:

**NPM**

```bash
npm install @strapi/client
```

**Yarn**

```bash
yarn add @strapi/client
```

**pnpm**

```bash
pnpm add @strapi/client
```

## ⚙️ Creating and configuring the SDK Instance

### Basic configuration

To interact with your Strapi backend, initialize the SDK with your Strapi API base URL:

```typescript
import { strapi } from '@strapi/client';

const sdk = strapi({ baseURL: 'http://localhost:1337/api' });
```

Alternatively, use a `<script>` tag in a browser environment:

```html
<script src="https://cdn.jsdelivr.net/npm/@strapi/client"></script>

<script>
  const sdk = strapi.strapi({ baseURL: 'http://localhost:1337/api' });
</script>
```

### Authentication

The SDK supports multiple authentication strategies for accessing authenticated content in your Strapi backend.

#### API-Token authentication

If your Strapi instance uses API tokens, configure the SDK like this:

```typescript
const sdk = strapi({
  // Endpoint configuration
  baseURL: 'http://localhost:1337/api',
  // Auth configuration
  auth: 'your-api-token-here',
});
```

## 📚 API Reference

The Strapi SDK instance provides key properties and utility methods for content and API interaction:

- **`baseURL`**: base URL of your Strapi backend.
- **`fetch`**: perform generic requests to the Strapi Content API using fetch-like syntax.
- **`.collection(resource: string)`**: get a manager instance for handling collection-type resources.
- **`.single(resource: string)`**: get a manager instance for handling single-type resources.

## 📁 Resource Managers

### `.collection(resource)`

The `.collection()` method provides a manager for working with collection-type resources,
which can have multiple entries.

**Note**: the `resource` corresponds to the plural name of your collection type, as defined in the Strapi model.

#### Available Methods:

1. **`find(queryParams?)`**: fetch multiple entries.
2. **`findOne(documentID, queryParams?)`**: fetch a single entry by its ID.
3. **`create(data, queryParams?)`**: create a new entry.
4. **`update(documentID, data, queryParams?)`**: update an existing entry.
5. **`delete(documentID, queryParams?)`**: remove an entry.

#### Examples:

```typescript
const articles = sdk.collection('articles');

// Fetch all english articles sorted by title
const allArticles = await articles.find({
  locale: 'en',
  sort: 'title',
});

// Fetch a single article
const singleArticle = await articles.findOne('article-document-id');

// Create a new article
const newArticle = await articles.create({ title: 'New Article', content: '...' });

// Update an existing article
const updatedArticle = await articles.update('article-document-id', { title: 'Updated Title' });

// Delete an article
await articles.delete('article-id');
```

### `.single(resource)`

The `.single()` method provides a manager for working with single-type resources, which have only one entry.

**Note**: the `resource` corresponds to the singular name of your collection type, as defined in the Strapi model.

#### Available Methods:

1. **`find(queryParams?)`**: fetch the document.
2. **`update(data, queryParams?)`**: update the document.
3. **`delete(queryParams?)`**: remove the document.

#### Examples:

```typescript
const homepage = sdk.single('homepage');

// Fetch the default version of the homepage
const defaultHomepage = await homepage.find();

// Fetch the spanish version of the homepage
const spanishHomepage = await homepage.find({ locale: 'es' });

// Update the homepage draft content
const updatedHomepage = await homepage.update(
  { title: 'Updated Homepage Title' },
  { status: 'draft' }
);

// Delete the homepage content
await homepage.delete();
```

## 🐛 Debug

This section provides guidance on enabling and managing debug logs for the SDK,
powered by [debug](https://github.com/debug-js/debug/).

### Node.js Debugging

In **Node.js bundles** (`cjs`, `esm`), debugging capabilities are always available to use.

You can turn on or off debug logs using the `DEBUG` environment variable:

```bash
# Enable logs for all namespaces
DEBUG=*

# Enable logs for a specific namespace
DEBUG=sdk:http

# Turn off logs
unset DEBUG
```

### Browser Debugging

For **browser environments**, debug capabilities are intentionally turned off to optimize the bundle size.

### Usage Overview

The `debug` tool allows you to control logs using wildcard patterns (`*`):

- `*`: enable all logs.
- `strapi:module`: enable logs for a specific module.
- `strapi:module1,sdk:module2`: enable logs for multiple modules.
- `strapi:*`: match all namespaces under `strapi`.
- `strapi:*,-strapi:module2`: enable all logs except those from `strapi:module2`.

### Namespaces

Below is a list of available namespaces to use:

| Namespace                        | Description                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| `strapi:core`                    | Logs SDK initialization, configuration validation, and HTTP client setup.                 |
| `strapi:validators:config`       | Logs details related to SDK configuration validation.                                     |
| `strapi:validators:url`          | Logs URL validation processes.                                                            |
| `strapi:http`                    | Logs HTTP client setup, request processing, and response/error handling.                  |
| `strapi:auth:factory`            | Logs the registration and creation of authentication providers.                           |
| `strapi:auth:manager`            | Logs authentication lifecycle management.                                                 |
| `strapi:auth:provider:api-token` | Logs operations related to API token authentication.                                      |
| `strapi:ct:collection`           | Logs interactions with collection-type content managers.                                  |
| `strapi:ct:single`               | Logs interactions with single-type content managers.                                      |
| `strapi:utils:url-helper`        | Logs URL helper utility operations (e.g., appending query parameters or formatting URLs). |

## 🚀 Demo Projects

This repository includes demo projects located in the `/demo` directory to help you get started with using the Strapi SDK. The actual Strapi application is located in the `.strapi-app` directory.

### Demo Structure

- **`.strapi-app`**: This is the main Strapi application used for the demo projects.
- **`demo/node-typescript`**: A Node.js project using TypeScript.
- **`demo/node-javascript`**: A Node.js project using JavaScript.

### Using Demo Scripts

The `package.json` includes several scripts to help you manage and run the demo projects. These scripts are designed to streamline the process of setting up and running the demo projects, making it easier for developers to test and interact with the SDK.

The most important basic commands to get started are:

- **`demo:setup`**: A comprehensive setup command that installs dependencies, sets up the environment, builds the projects, and seeds the demo application. This is a one-stop command to prepare everything needed to run the demos.

  ```bash
  pnpm run demo:setup
  ```

- **`demo:run`**: Runs the Strapi application server in development mode. This command is useful for testing and developing.

  ```bash
  pnpm run demo:run
  ```

- **`demo:seed:clean`**: Cleans the existing data and re-seeds the Strapi demo application. This command is helpful for resetting the demo data to its initial state.

  ```bash
  pnpm run demo:seed:clean
  ```

The following scripts shouldn't need to be used generally, but are also available to run individual parts of the setup or reset process:

- **`demo:build`**: Builds the main project and the TypeScript and JavaScript demo projects. This command ensures that all necessary build steps are completed for the demo projects to run.

  ```bash
  pnpm run demo:build
  ```

- **`demo:install`**: Installs all dependencies for the main project and all demo projects, including TypeScript, JavaScript, HTML, and Next.js demos. This command is essential to prepare the environment for running the demos.

  ```bash
  pnpm run demo:install
  ```

- **`demo:env`**: Sets up the environment for the Strapi demo application by copying the example environment file if it doesn't already exist.

  ```bash
  pnpm run demo:env
  ```

- **`demo:seed`**: Seeds the Strapi application with example data. This script also generates `.env` files with API tokens for the `node-typescript` and `node-javascript` projects.

  ```bash
  pnpm run demo:seed
  ```

### Adding New Projects

If you add new projects to the `/demo` directory, you will need to update the seed script located at `/demo/.strapi-app/scripts/seed.js` with the new project paths to ensure they are properly configured and seeded.

### Future Plans

We plan to expand the demo projects to include:

- A basic HTML project.
- A Next.js project.

These additions will provide more examples of how to integrate the Strapi SDK into different types of applications.
