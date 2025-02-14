import * as dotenv from 'dotenv';
import { strapi } from '@strapi/client';

dotenv.config();

export default async function Home() {
  const api_token = process.env.FULL_ACCESS_TOKEN; // READ_ONLY_TOKEN is also available

  console.log('Running with api token ' + api_token);

  try {
    // Create the Strapi client instance
    const client = strapi({
      baseURL: 'http://localhost:1337/api',
      auth: api_token,
    });

    // Create a collection type query manager for the categories
    const categories = client.collection('articles');

    // Fetch the list of all categories
    const docs = await categories.find({ status: 'draft' });

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg mx-auto max-w-4xl">
        {docs.data.map((doc) => (
          <div
            key={doc.documentId}
            className="border-b border-gray-200 py-4 px-6 hover:bg-gray-100 transition-colors"
          >
            <h2 className="text-lg font-bold text-gray-800 capitalize">{doc.title}</h2>
            {doc.description && <p className="text-gray-600">{doc.description}</p>}
            <p className="text-gray-500 text-sm">{new Date(doc.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 text-center p-4">
        <p className="text-red-600 font-bold text-2xl">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        {error instanceof Error && 'cause' in error ? (
          <p className="text-red-500 mt-2 text-lg">Cause: {error.cause?.toString()}</p>
        ) : null}
      </div>
    );
  }
}
