import { HttpClient } from '../http';
import { GenericDocumentResponse, BaseQueryParams } from '../types/content-api';
import { appendQueryParams } from '../utilities';
import { StrapiSDKValidator } from '../validators';

/**
 * Provides methods to interact with a single-type route in the Strapi application.
 *
 * This method returns an object with methods to perform CRUD operations on a single-type route.
 *
 * @param singularName - The singularName of the single-type to interact with.
 *
 * @returns An object with methods to `findOne`, `create`, `update`, and `delete` the single-type document.
 *
 * @example
 * ```typescript
 * const sdk = createStrapiSDK({ baseURL: 'http://localhost:1337' });
 * const homepage = sdk.single('homepage');
 *
 * // Find the homepage document
 * const homepageData = await homepage.findOne();
 *
 * // Create the homepage document
 * const newHomepage = await homepage.create({ title: 'Welcome to our site' });
 *
 * // Update the homepage document
 * const updatedHomepage = await homepage.update({ title: 'Updated Title' });
 *
 * // Delete the homepage document
 * await homepage.delete();
 * ```
 */
export class SingleTypeManager {
  constructor(
    private singularName: string,
    private httpClient: HttpClient,
    private validator: StrapiSDKValidator
  ) {}

  async findOne(queryParams?: BaseQueryParams): Promise<GenericDocumentResponse> {
    const response = await this.httpClient.fetch(
      appendQueryParams(`/${this.singularName}`, queryParams),
      { method: 'GET' }
    );
    return this.validator.parseSingleDocumentResponse(response);
  }

  async update(
    body: Record<string, any>,
    queryParams?: BaseQueryParams
  ): Promise<GenericDocumentResponse> {
    const response = await this.httpClient.fetch(
      appendQueryParams(`/${this.singularName}`, queryParams),
      {
        method: 'PUT',
        body: JSON.stringify(body),
      }
    );
    return this.validator.parseSingleDocumentResponse(response);
  }

  async delete(queryParams?: BaseQueryParams): Promise<GenericDocumentResponse> {
    const response = await this.httpClient.fetch(
      appendQueryParams(`/${this.singularName}`, queryParams),
      { method: 'DELETE' }
    );
    return this.validator.parseSingleDocumentResponse(response);
  }
}
