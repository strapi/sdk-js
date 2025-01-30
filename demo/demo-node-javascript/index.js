const { strapi } = require('@strapi/sdk-js');

async function main() {
  // Create the SDK instance
  const sdk = strapi({ baseURL: 'http://localhost:1337/api' });

  // Create a collection type query manager for the categories
  const categories = sdk.collection('categories');

  // Fetch the list of all categories
  const docs = await categories.find();

  console.dir(docs, { depth: null });
}

main().catch(console.error);
