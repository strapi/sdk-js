import createDebug from 'debug';

import { HttpClient } from '../../http';
import { BaseQueryParams, GenericDocumentResponse } from '../../types/content-api';
import { URLHelper } from '../../utilities';

const debug = createDebug('sdk:ct:single');

/**
 * A service class designed for interacting with a single-type resource in a Strapi app.
 *
 * It provides methods to fetch, update, or delete a document of a specified Strapi single-type.
 *
 * #### Overview
 * - The class is instantiated with the singular resource name and an HTTP client.
 * - All operations use the resource's singular name to construct the API endpoint.
 * - It also supports optional query parameters for filtering, sorting, pagination, etc.
 */
export class SingleTypeManager {
  private readonly _singularName: string;
  private readonly _httpClient: HttpClient;

  /**
   * Creates an instance of {@link SingleTypeManager}.
   *
   * @param singularName - The singular name of the single-type resource as defined in the Strapi app.
   * @param httpClient - An instance of {@link HttpClient} to handle HTTP communication.
   *
   * @example
   * ```typescript
   * const httpClient = new HttpClient('http://localhost:1337/api');
   * const homepageManager = new SingleTypeManager('homepage', httpClient);
   * ```
   */
  constructor(singularName: string, httpClient: HttpClient) {
    this._singularName = singularName;
    this._httpClient = httpClient;

    debug('initialized manager for %o', singularName);
  }

  /**
   * Retrieves the document of the specified single-type resource.
   *
   * @param [queryParams] - Optional query parameters to customize the request, such as filters or locale.
   *                        Query parameters follow the Strapi conventions for filtering, pagination, and sorting.
   *
   * @returns The full document for the single-type resource.
   *
   * @throws {HTTPError} if the HTTP client encounters connection issues, the server is unreachable, or authentication fails.
   *
   * @example
   * ```typescript
   * const homepageManager = new SingleTypeManager('homepage', httpClient);
   *
   * // Fetch the homepage content without additional filtering
   * const homepageContent = await homepageManager.find();
   *
   * // Fetch homepage contents for the 'es' locale
   * const localizedHomepage = await homepageManager.find({ locale: 'es' });
   * ```
   */
  async find(queryParams?: BaseQueryParams): Promise<GenericDocumentResponse> {
    debug('finding document for %o', this._singularName);

    let path = `/${this._singularName}`;

    if (queryParams) {
      path = URLHelper.appendQueryParams(path, queryParams);
    }

    const response = await this._httpClient.fetch(path, { method: 'GET' });

    debug('the %o document has been fetched', this._singularName);

    return response.json();
  }

  /**
   * Updates the document of the specified single-type resource with the provided data.
   *
   * @param data -  A record of key-value pairs that represent the fields to update.
   *                Must follow the schema defined in the Strapi app.
   * @param [queryParams] - Optional query parameters to customize the request, such as locale or other additional filters.
   *
   * @returns The updated document for the single-type resource.
   *
   * @throws {HTTPError} if the HTTP client encounters connection issues, the server is unreachable, or authentication fails.
   *
   * @example
   * ```typescript
   * const homepageManager = new SingleTypeManager('homepage', httpClient);
   *
   * // Update the homepage content
   * const updatedHomepage = await homepageManager.update({ title: 'Updated Homepage Title' });
   *
   * // Update localized homepage content
   * const localizedUpdatedHomepage = await homepageManager.update(
   *   { title: 'Inicio Actualizado' },
   *   { locale: 'es' }
   * );
   * ```
   */
  async update(
    data: Record<string, any>,
    queryParams?: BaseQueryParams
  ): Promise<GenericDocumentResponse> {
    debug('updating document for %o', this._singularName);

    let url = `/${this._singularName}`;

    if (queryParams) {
      url = URLHelper.appendQueryParams(url, queryParams);
    }

    const response = await this._httpClient.fetch(url, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });

    debug('the %o document has been updated', this._singularName);

    return response.json();
  }

  /**
   * Deletes the document of the specified single-type resource.
   *
   * @param [queryParams] - Optional query parameters to customize the request, such as locale or other additional filters.
   *
   * @returns The response after the deletion, confirming the successful removal of the document.
   *
   * @throws {HTTPError} if the HTTP client encounters connection issues, the server is unreachable,
   *                 or authentication fails.
   *
   * @example
   * ```typescript
   * const homepageManager = new SingleTypeManager('homepage', httpClient);
   *
   * // Delete the homepage content
   * await homepageManager.delete();
   *
   * // Delete localized homepage content in Spanish
   * await homepageManager.delete({ locale: 'es' });
   * ```
   *
   * @see HttpClient
   * @see URLHelper.appendQueryParams
   */
  async delete(queryParams?: BaseQueryParams): Promise<void> {
    debug('deleting document for %o', this._singularName);

    let url = `/${this._singularName}`;

    if (queryParams) {
      url = URLHelper.appendQueryParams(url, queryParams);
    }

    await this._httpClient.fetch(url, { method: 'DELETE' });

    debug('the %o document has been deleted', this._singularName);
  }
}
