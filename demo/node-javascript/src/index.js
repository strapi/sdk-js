const { strapi } = require('@strapi/client');
require('dotenv').config();

const api_token = process.env.FULL_ACCESS_TOKEN; // READ_ONLY_TOKEN is also available

console.log('Running with api token ' + api_token);

async function main() {
  // Create the SDK instance
  const sdk = strapi({ baseURL: 'http://localhost:1337/api', auth: api_token });

  // Create a collection type query manager for the categories
  const categories = sdk.collection('categories');

  // Fetch the list of all categories
  const docs = await categories.find();

  console.dir(docs, { depth: null });
}

main().catch(console.error);
