import { strapi } from '@strapi/client';
import * as dotenv from 'dotenv';
dotenv.config();

const api_token = process.env.FULL_ACCESS_TOKEN; // READ_ONLY_TOKEN is also available

console.log('Running with api token ' + api_token);

// Create the Strapi client instance
const client = strapi({ baseURL: 'http://localhost:1337/api', auth: api_token });
// Create a collection type query manager for the categories
const categories = client.collection('categories');

// Fetch the list of all categories
const docs = await categories.find();

console.dir(docs, { depth: null });
