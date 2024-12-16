<h1 align="center">sdk-js</h1>
<h3 align="center">An SDK you can use to easily interface with Strapi from your JavaScript and TypeScript projects</h3>

<br />

<p align="center">
  <a href="https://www.npmjs.com/package/@strapi/sdk-js" target="_blank">
   <img src="https://img.shields.io/npm/v/@strapi/sdk-js" alt="NPM version" />
  </a>
  <a href="https://www.npmjs.com/package/@strapi/sdk-js" target="_blank">
   <img src="https://img.shields.io/npm/dm/@strapi/sdk-js" alt="NPM downloads" />
  </a>
  <a href="https://discord.gg/strapi" target="_blank">
    <img src="https://img.shields.io/discord/811989166782021633?style=flat&colorA=4945ff&colorB=4945ff&label=discord&logo=discord&logoColor=f0f0ff" alt="Chat on Discord" />
  </a>
</p>

<br />

sdk-js is an SDK you can use to easily interface with Strapi from your JavaScript or TypeScript project.

## Getting Started With Strapi

If you're brand new to Strapi development, it is recommended to follow the [Strapi Quick Start Guide](https://docs.strapi.io/dev-docs/quick-start)

sdk-js is compatible with Strapi v5+ and interfaces with Strapi's REST API. You can read the API docs [here](https://docs.strapi.io/dev-docs/api/rest)

## SDK Purpose

sdk-js is the recommended and easiest way to interface with Strapi from your JavaScript and TypeScript projects.
It allows you to easily create, read, update, and delete Strapi content through strongly typed methods.

<!-- TODO confirm whether this is done in MVP -->

If working with javascript, sdk-js can still help to ease your development workflow through queries based on content type UID's.

## Getting Started With "@strapi/sdk-js"

In its simplest form, "@strapi/sdk-js" works by being connected to the URL of your Strapi instance and provided auth if required.

<!-- TODO confirm examples -->

### Importing the SDK

```js
import { createStrapiSDK } from '@strapi/sdk-js'; // ES Modules
// const { createStrapiSDK } = require("@strapi/sdk-js"); CommonJS

const strapiSDK = createStrapiSDK({
  baseURL: 'http://localhost:1337/api',
});
```

### Script tag example

```html
<script src="https://cdn.jsdelivr.net/npm/@strapi/sdk-js"></script>
<script>
  const strapiSDK = createStrapiSDK({
    baseURL: 'http://localhost:1337/api',
  });
</script>
```

## Generate the SDK based on your content type schema

sdk-js becomes most powerful when you generate the SDK based on your content type schema. This allows you access to strongly typed methods for creating, reading, updating and deleting content.

There are multiple ways to do this:

### Using the CLI

sdk-js provides a CLI command to generate the SDK based on your Strapi app content schema.

<!-- TODO should we provide an output path option to the CLI? -->

```sh
# Run this in the root of your Strapi app
npx @strapi/sdk-js@latest generate

# You can optionally provide the path to strapi app and run the command from elsewhere
npx @strapi/sdk-js@latest generate --path ../strapi-app

```

As opposed to importing the SDK from a CDN or NPM, the generated asset can then be imported and used as per the examples above.

### Providing the SDK with a Strapi Schema

Alternatively, you can use the SDK from a CDN or NPM, but provide the SDK with a Strapi schema.

```js
import { createStrapiSDK } from '@strapi/sdk-js';
// TODO clarify where this comes from and how to generate it
import strapiAppSchema from '../path/to/strapi-app-schema.json';

const strapiSDK = createStrapiSDK({
  baseURL: 'http://localhost:1337/api',
  schema: strapiAppSchema,
});
```

## Interacting with Strapi

### Fetch

The SDK provides a `fetch` method that allows you to make requests relative to the Strapi Content API.

The params accepted by the `fetch` method are the same as those accepted by the native `fetch` [API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch). With the first param being a relative path to the Strapi Content API.

You can refer to the documentation for the [Strapi Content API](https://docs.strapi.io/dev-docs/api/rest) for more information on the available endpoints and their required params.

```js
// Create a new article
const response = await strapiSDK.fetch('/articles', {
  method: 'POST',
  body: {
    title: 'My first article',
  },
});
```

### Generated Query API's

When you generate the SDK based on your Strapi app schema, the SDK will also generate methods for querying your content types.

These methods are strongly typed and allow you to query your content types based on their UID.

They are available on the SDK instance as `sdk.queries[contentTypePluralName][method]`.

For example, if you have a content type with the plural name of `articles`, the available methods will be `find`, `findOne`, `create`, `update`, and `delete`.

```js
// Find all articles
const articles = await strapiSDK.queries.articles.findMany();
```

<!-- TODO refer to docs elsewhere for params accepted for filtering and sorting etc -->
