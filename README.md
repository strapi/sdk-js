<p style="text-align: center">
  <a href="https://strapi.io/#gh-light-mode-only">
    <img src="https://strapi.io/assets/strapi-logo-dark.svg" width="318px" alt="Strapi logo" />
  </a>
  <a href="https://strapi.io/#gh-dark-mode-only">
    <img src="https://strapi.io/assets/strapi-logo-light.svg" width="318px" alt="Strapi logo" />
  </a>
</p>

<h2 style="text-align: center">Manage Your Strapi Content From Anywhere 🚀</h2>
<p style="text-align: center">Connect your JavaScript/TypeScript apps to a flexible and fully customizable Strapi backend with ease.</p>
<p style="text-align: center"><a href="https://github.com/strapi/strapi">CMS Repository</a> - <a href="https://strapi.io">Website</a></p>
<br />

<p style="text-align: center">
  <a href="https://www.npmjs.org/package/@strapi/sdk-js">
    <img src="https://img.shields.io/npm/v/@strapi/sdk-js/latest.svg" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.com/package/@strapi/sdk-js" target="_blank">
   <img src="https://img.shields.io/npm/dm/@strapi/sdk-js" alt="NPM downloads" />
  </a>
  <a href="https://github.com/strapi/sdk-js/actions/workflows/tests.yml">
    <img src="https://github.com/strapi/sdk-js/actions/workflows/tests.yml/badge.svg?branch=main" alt="Tests" />
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
5. [Examples](#-examples)

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
npm install @strapi/sdk-js
```

**Yarn**
```bash
yarn add @strapi/sdk-js
```

**pnpm**
```bash
pnpm add @strapi/sdk-js
```

## ⚙️ Creating and configuring the SDK Instance
### Basic configuration

To interact with your Strapi backend, initialize the SDK with your Strapi API base URL:

``` typescript
import { createStrapiSDK } from '@strapi/sdk-js';

const sdk = createStrapiSDK({ baseURL: 'http://localhost:1337/api' });
```

Alternatively, use a `<script>` tag in a browser environment:

``` html
<script src="https://cdn.jsdelivr.net/npm/@strapi/sdk-js"></script>

<script>
  const sdk = createStrapiSDK({ baseURL: 'http://localhost:1337/api' });
</script>
```

### Authentication
The SDK supports multiple authentication strategies for accessing authenticated content in your Strapi backend.

#### API-Token authentication

If your Strapi instance uses API tokens, configure the SDK like this:

``` typescript
const sdk = createStrapiSDK({
  baseURL: 'http://localhost:1337/api',
  auth: {
    strategy: 'api-token',
    options: { token: 'your-api-token-here' },
  },
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

``` typescript
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

The `.single()` method provides a manager for working with collection-type resources, which have only one entry.

**Note**: the `resource` corresponds to the singular name of your collection type, as defined in the Strapi model.

#### Available Methods:

1. **`find(queryParams?)`**: fetch the document.
2. **`update(data, queryParams?)`**: update the document.
3. **`delete(queryParams?)`**: remove the document.

#### Examples:
``` typescript
const homepage = sdk.single('homepage');

// Fetch the default version of the homepage
const homepageContent = await homepage.find();

// Fetch the spanish version of the homepage
const homepageContent = await homepage.find({ locale: 'es' });

// Update the homepage draft content
const updatedHomepage = await homepage.update({ title: 'Updated Homepage Title' }, { status: 'draft' });

// Delete the homepage content
await homepage.delete();
```

## 💡 Examples

Here’s how to combine `.collection()` and `.single()` methods in a real-world scenario:

``` typescript
const sdk = createStrapiSDK({
  baseURL: 'http://localhost:1337/api',
  auth: {
    strategy: 'api-token',
    options: { token: 'your-api-token-here' },
  },
});

async function main() {
  // Work with collections
  const articles = sdk.collection('articles');
  const newArticle = await articles.create({ title: 'Hello World', content: '...' });
  console.log('Created Article:', newArticle);

  const allArticles = await articles.find({ sort: 'createdAt:desc' });
  console.log('All Articles:', allArticles);

  // Work with single types
  const homepage = sdk.single('homepage');
  const homepageContent = await homepage.find();
  console.log('Homepage Content:', homepageContent);

  const updatedHomepage = await homepage.update({ title: 'Welcome to the New Homepage' });
  console.log('Updated Homepage:', updatedHomepage);
}

main();
```
