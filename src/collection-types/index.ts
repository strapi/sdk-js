import { HttpClient } from '../http';
import {
  GenericDocumentResponse,
  GenericMultiDocumentResponse,
  BaseQueryParams,
} from '../types/content-api';
import { appendQueryParams } from '../utilities';
import { StrapiSDKValidator } from '../validators';

/**
 * Provides methods to interact with a collection-type route in the Strapi application.
 *
 * This method returns an object with methods to perform CRUD operations on a collection.
 *
 * @param pluralName - The pluralName of the collection to interact with.
 *
 * @returns An object with methods to `find`, `findOne`, `create`, `update`, and `delete` documents in the collection.
 *
 * @example
 * ```typescript
 * const sdk = createStrapiSDK({ baseURL: 'http://localhost:1337' });
 * const articles = sdk.collection('articles');
 *
 * // Find all articles
 * const allArticles = await articles.find();
 *
 * // Find a single article by ID
 * const singleArticle = await articles.findOne('1');
 *
 * // Create a new article
 * const newArticle = await articles.create({ title: 'New Article' });
 *
 * // Update an existing article
 * const updatedArticle = await articles.update('1', { title: 'Updated Title' });
 *
 * // Delete an article
 * await articles.delete('1');
 * ```
 */
export class CollectionTypeManager {
  constructor(
    private pluralName: string,
    private httpClient: HttpClient,
    private validator: StrapiSDKValidator
  ) {}

  async find(queryParams?: BaseQueryParams): Promise<GenericMultiDocumentResponse> {
    const response = await this.httpClient.fetch(
      appendQueryParams(`/${this.pluralName}`, queryParams),
      { method: 'GET' }
    );

    return this.validator.parseMultiDocumentResponse(response);
  }

  async findOne(
    documentID: string,
    queryParams?: BaseQueryParams
  ): Promise<GenericDocumentResponse> {
    const response = await this.httpClient.fetch(
      appendQueryParams(`/${this.pluralName}/${documentID}`, queryParams),
      { method: 'GET' }
    );

    return this.validator.parseSingleDocumentResponse(response);
  }

  async create(
    body: Record<string, any>,
    queryParams?: BaseQueryParams
  ): Promise<GenericDocumentResponse> {
    const response = await this.httpClient.fetch(
      appendQueryParams(`/${this.pluralName}`, queryParams),
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );

    return this.validator.parseSingleDocumentResponse(response);
  }

  async update(
    documentID: string,
    body: Record<string, any>,
    queryParams?: BaseQueryParams
  ): Promise<GenericDocumentResponse> {
    const response = await this.httpClient.fetch(
      appendQueryParams(`/${this.pluralName}/${documentID}`, queryParams),
      {
        method: 'PUT',
        body: JSON.stringify(body),
      }
    );

    return this.validator.parseSingleDocumentResponse(response);
  }

  async delete(
    documentID: string,
    queryParams?: BaseQueryParams
  ): Promise<GenericDocumentResponse> {
    const response = await this.httpClient.fetch(
      appendQueryParams(`/${this.pluralName}/${documentID}`, queryParams),
      { method: 'DELETE' }
    );

    return this.validator.parseSingleDocumentResponse(response);
  }
}
