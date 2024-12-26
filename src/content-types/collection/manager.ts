import createDebug from 'debug';

import { HttpClient } from '../../http';
import {
  GenericDocumentResponse,
  GenericMultiDocumentResponse,
  BaseQueryParams,
} from '../../types/content-api';
import { URLHelper } from '../../utilities';

const debug = createDebug('sdk:ct:collection');

/**
 * A service class designed for interacting with a collection-type resource in a Strapi app.
 *
 * It provides methods to fetch, update, or delete documents of a specified Strapi collection-type.
 *
 * #### Overview
 * - The class is instantiated with the plural resource name and an HTTP client.
 * - All operations use the resource's plural name to construct the API endpoint.
 * - It also supports optional query parameters for filtering, sorting, pagination, etc.
 */
export class CollectionTypeManager {
  private readonly _pluralName: string;
  private readonly _httpClient: HttpClient;

  /**
   * Creates an instance of {@link CollectionTypeManager}`.
   *
   * @param pluralName - The singular name of the single-type resource as defined in the Strapi app.
   * @param httpClient - An instance of {@link HttpClient} to handle HTTP communication.
   *
   * @example
   * ```typescript
   * const httpClient = new HttpClient('http://localhost:1337/api');
   * const articlesManager = new CollectionTypeManager('articles', httpClient);
   * ```
   */
  constructor(pluralName: string, httpClient: HttpClient) {
    this._pluralName = pluralName;
    this._httpClient = httpClient;

    debug('initialized manager for %o', pluralName);
  }

  /**
   * Retrieves multiple documents.
   *
   * @param [queryParams] - Optional query parameters to filter, sort, or paginate the results.
   *
   * @returns A list of documents matching the given request.
   *
   * @throws {HTTPError} if the HTTP client encounters connection issues, the server is unreachable, or authentication fails.
   *
   * @example
   * ```typescript
   * const articlesManager = new CollectionTypeManager('articles', httpClient);
   *
   * const articles = await articlesManager.find({
   *   filters: { published: true },
   *   sort: 'title'
   * });
   *
   * console.log(articles);
   * ```
   */
  async find(queryParams?: BaseQueryParams): Promise<GenericMultiDocumentResponse> {
    debug('finding documents for %o', this._pluralName);

    let url = `/${this._pluralName}`;

    if (queryParams) {
      url = URLHelper.appendQueryParams(url, queryParams);
    }

    const response = await this._httpClient.fetch(url, { method: 'GET' });
    const json = await response.json();

    debug('found %o %o documents', Number(json?.data?.length), this._pluralName);

    return json;
  }

  /**
   * Retrieves a single document by its ID.
   *
   * @param documentID - The unique identifier of the document to retrieve.
   * @param [queryParams] - Optional query parameters to include additional data or filtering.
   *
   * @returns A single document
   *
   * @throws {HTTPError} if the HTTP client encounters connection issues, the server is unreachable, or authentication fails.
   *
   * @example
   * ```typescript
   * const articlesManager = new CollectionTypeManager('articles', httpClient);
   *
   * // Find an article by its document ID
   * const article = await articlesManager.findOne('ebd74ca4-288f-41a2-974c-a4288fa1a24f');
   *
   * // Find a version of a document using its document ID and filters
   * const localizedArticle = await articlesManager.findOne('ebd74ca4-288f-41a2-974c-a4288fa1a24f', { locale: 'es' });
   * ```
   *
   */
  async findOne(
    documentID: string,
    queryParams?: BaseQueryParams
  ): Promise<GenericDocumentResponse> {
    debug('finding a document for %o with id: %o', this._pluralName, documentID);

    let url = `/${this._pluralName}/${documentID}`;

    if (queryParams) {
      url = URLHelper.appendQueryParams(url, queryParams);
    }

    const response = await this._httpClient.fetch(url, { method: 'GET' });

    debug('found the %o document with document id %o', this._pluralName, documentID);

    return response.json();
  }

  /**
   * Creates a new document.
   *
   * @param data - The content data of the document to create.
   * @param [queryParams] - Optional query parameters for adding additional metadata.
   *
   * @returns The created document
   *
   * @throws {HTTPError} if the HTTP client encounters connection issues, the server is unreachable, or authentication fails.
   *
   * @example
   * ```typescript
   * const articlesManager = new CollectionTypeManager('articles', httpClient);
   *
   * // Create a new article document
   * const newArticle = await articlesManager.create({ title: 'My New Article', content: '...' });
   * ```
   */
  async create(
    data: Record<string, any>,
    queryParams?: BaseQueryParams
  ): Promise<GenericDocumentResponse> {
    debug('creating a document for %o', this._pluralName);

    let url = `/${this._pluralName}`;

    if (queryParams) {
      url = URLHelper.appendQueryParams(url, queryParams);
    }

    const response = await this._httpClient.fetch(url, {
      method: 'POST',
      body: JSON.stringify({ data }),
    });

    debug('created the %o document', this._pluralName);

    return response.json();
  }

  /**
   * Updates an existing document
   *
   * @param documentID - The unique identifier of the document to update.
   * @param data - The content data to update for the document.
   * @param [queryParams] - Optional query parameters for additional metadata.
   *
   * @returns The updated document
   *
   * @throws {HTTPError} if the HTTP client encounters connection issues, the server is unreachable, or authentication fails.
   *
   * @example
   * ```typescript
   * const articlesManager = new CollectionTypeManager('articles', httpClient);
   *
   * // Update an article content
   * const updatedArticle = await articlesManager.update('3ec3770c-9d02-4798-8377-0c9d02079818', { title: 'Updated Article Title' });
   *
   * // Update localized article content
   * const localizedUpdatedArticle = await articlesManager.update(
   *   '22127a83-4ed4-4249-927a-834ed4a249a6',
   *   { title: 'Inicio Actualizado' },
   *   { locale: 'es' }
   * );
   * ```
   */
  async update(
    documentID: string,
    data: Record<string, unknown>,
    queryParams?: BaseQueryParams
  ): Promise<GenericDocumentResponse> {
    debug('updating a document for %o with id: %o', this._pluralName, documentID);

    let url = `/${this._pluralName}/${documentID}`;

    if (queryParams) {
      url = URLHelper.appendQueryParams(url, queryParams);
    }

    const response = await this._httpClient.fetch(url, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });

    debug('updated the %o document with id %o', this._pluralName, documentID);

    return response.json();
  }

  /**
   * Deletes a document
   *
   * @param documentID - The unique identifier of the document to delete.
   * @param [queryParams] - Optional query parameters for additional metadata.
   *
   * @throws {HTTPError} if the HTTP client encounters connection issues, the server is unreachable, or authentication fails.
   *
   * @example
   * @example
   * ```typescript
   * const articlesManager = new CollectionTypeManager('articles', httpClient);
   *
   * // Delete an article
   * await articlesManager.delete('3ec3770c-9d02-4798-8377-0c9d02079818');
   *
   * // Delete the Spanish version of a document
   * await articlesManager.delete(
   *   '59b2774f-90a5-498e-b277-4f90a5198e96',
   *   { locale: 'es' }
   * );
   * ```
   */
  async delete(documentID: string, queryParams?: BaseQueryParams): Promise<void> {
    debug('deleting a document for %o with id: %o', this._pluralName, documentID);

    let url = `/${this._pluralName}/${documentID}`;

    if (queryParams) {
      url = URLHelper.appendQueryParams(url, queryParams);
    }

    await this._httpClient.fetch(url, { method: 'DELETE' });

    debug('deleted the %o document with id %o', this._pluralName, documentID);
  }
}
