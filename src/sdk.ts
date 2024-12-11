import { StrapiSDKInitializationError } from './errors';
import { HttpClient } from './http';
import { StrapiSDKValidator } from './validators';

import type { BaseQueryParams, GenericDocumentResponse } from './types/content-api';

/**
 * Utility function to append query parameters to a URL.
 *
 * @param url - The base URL to which query parameters will be appended.
 * @param queryParams - An optional object representing query parameters as key-value pairs.
 *
 * @returns The URL with appended query parameters if any are provided.
 */
export function appendQueryParams(url: string, queryParams?: BaseQueryParams): string {
  if (!queryParams) {
    return url;
  }

  const params = new URLSearchParams();

  const appendParam = (key: string, value: any) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        params.append(`${key}[${index}]`, String(item));
      });
    } else if (typeof value === 'object' && value !== null) {
      for (const [subKey, subValue] of Object.entries(value)) {
        appendParam(`${key}[${subKey}]`, subValue);
      }
    } else {
      params.append(key, String(value));
    }
  };

  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined) {
      appendParam(key, value);
    }
  }

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

export interface StrapiSDKConfig {
  baseURL: string;
  auth?: AuthConfig;
}

export interface AuthConfig<T = unknown> {
  strategy: string;
  options: T;
}

/**
 * Class representing the Strapi SDK to interface with a Strapi backend.
 *
 * This class integrates setting up configuration, validation, and handling
 * HTTP requests with authentication.
 *
 * It serves as the main interface through which users interact with
 * their Strapi installation programmatically.
 *
 * @template T_Config - Configuration type inferred from the user-provided SDK configuration
 */
export class StrapiSDK<const T_Config extends StrapiSDKConfig = StrapiSDKConfig> {
  /** @internal */
  private readonly _config: T_Config;

  /** @internal */
  private readonly _validator: StrapiSDKValidator;

  /** @internal */
  private readonly _httpClient: HttpClient;

  /** @internal */
  constructor(
    // Properties
    config: T_Config,

    // Dependencies
    validator: StrapiSDKValidator = new StrapiSDKValidator(),
    httpClientFactory?: (url: string) => HttpClient
  ) {
    // Properties
    this._config = config;
    this._validator = validator;

    // Validation
    this.preflightValidation();

    // The HTTP client depends on the preflightValidation for the baseURL validity.
    // It could be instantiated before but would throw an invalid URL error
    // instead of the SDK itself throwing an initialization exception.
    this._httpClient = httpClientFactory?.(config.baseURL) ?? new HttpClient(config.baseURL);

    this.init();
  }

  /**
   * Performs preliminary validation of the SDK configuration.
   *
   * This method ensures that the provided configuration for the SDK is valid by using the
   * internal SDK validator. It is invoked during the initialization process to confirm that
   * all necessary parts are correctly configured before effectively using the SDK.
   *
   * @throws {StrapiSDKInitializationError} If the configuration validation fails, indicating an issue with the SDK initialization process.
   *
   * @example
   * // Creating a new instance of StrapiSDK which triggers preflightValidation
   * const config = {
   *   baseURL: 'https://example.com',
   *   auth: {
   *     strategy: 'jwt',
   *     options: { token: 'your-token-here' }
   *   }
   * };
   * const sdk = new StrapiSDK(config);
   *
   * // The preflightValidation is automatically called within the constructor
   * // to ensure the provided config is valid prior to any further setup.
   *
   * @note This method is private and only called internally during SDK initialization.
   *
   * @internal
   */
  private preflightValidation() {
    try {
      this._validator.validateConfig(this._config);
    } catch (e) {
      throw new StrapiSDKInitializationError(e);
    }
  }

  /**
   * Initializes the configuration settings for the SDK.
   *
   * Sets up the necessary parts required for the SDK's operation,
   * including setting up an authentication strategy if provided.
   *
   * @throws {StrapiSDKValidationError} From the _httpClient if the baseURL is invalid.
   *
   * @note
   * - This method is private and internally invoked only during SDK initialization.
   * - Although this method technically -can- throw a validation error, the baseURL
   *       should already have been validated during the SDK preflight validation.
   *
   * @internal
   */
  private init() {
    if (this.auth) {
      const { strategy, options } = this.auth;

      this._httpClient.setAuthStrategy(strategy, options);
    }
  }

  /**
   * Retrieves the authentication configuration for the Strapi SDK.
   *
   * @note This is a private property used internally within the SDK for configuring authentication in the HTTP layer.
   *
   * @internal
   */
  private get auth() {
    return this._config.auth;
  }

  /**
   * Retrieves the base URL of the Strapi SDK instance.
   *
   * This getter returns the `baseURL` property stored within the SDK's configuration object.
   *
   * The base URL is used as the starting point for all HTTP requests initiated through the SDK.
   *
   * @returns The current base URL configured in the SDK.
   *          This URL typically represents the root endpoint of the Strapi service the SDK interfaces with.
   *
   * @example
   * const config = { baseURL: 'http://localhost:1337' };
   * const sdk = new StrapiSDK(config);
   *
   * console.log(sdk.baseURL); // Output: http://localhost:1337
   */
  public get baseURL(): string {
    return this._config.baseURL;
  }

  /**
   * Executes an HTTP fetch request to a specified endpoint using the SDK HTTP client.
   *
   * This method ensures authentication is handled before issuing requests and sets the necessary headers.
   *
   * @param url - The endpoint to fetch from, appended to the base URL of the SDK.
   * @param [init] - Optional initialization options for the request, such as headers or method type.
   *
   * @example
   * ```typescript
   * // Create the SDK instance
   * const sdk = createStrapiSDK({ baseURL: 'http://localhost:1337' );
   *
   * // Perform a custom fetch query
   * const response = await sdk.fetch('/categories');
   *
   * // Parse the categories into a readable JSON object
   * const categories = await response.json();
   *
   * // Log the categories
   * console.log(categories);
   * ```
   *
   * @note
   * - The method automatically handles authentication by checking if the user is authenticated and attempts to authenticate if not.
   * - The base URL is prepended to the provided endpoint path.
   */
  fetch(url: string, init?: RequestInit) {
    return this._httpClient.fetch(url, init);
  }

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
  collection(pluralName: string) {
    this._validator.validatePluralName(pluralName);

    return {
      find: async (queryParams?: BaseQueryParams): Promise<GenericDocumentResponse> => {
        const response = await this.fetch(appendQueryParams(`/${pluralName}`, queryParams), {
          method: 'GET',
        });

        return this._validator.parseDocumentResponse(response);
      },
      findOne: async (
        documentID: string,
        queryParams?: BaseQueryParams
      ): Promise<GenericDocumentResponse> => {
        const response = await this.fetch(
          appendQueryParams(`/${pluralName}/${documentID}`, queryParams),
          {
            method: 'GET',
          }
        );

        return this._validator.parseDocumentResponse(response);
      },
      create: async (
        body: Record<string, any>,
        queryParams?: BaseQueryParams
      ): Promise<GenericDocumentResponse> => {
        const response = await this.fetch(appendQueryParams(`/${pluralName}`, queryParams), {
          method: 'POST',
          body: JSON.stringify(body),
        });

        return this._validator.parseDocumentResponse(response);
      },
      update: async (
        documentID: string,
        body: Record<string, any>,
        queryParams?: BaseQueryParams
      ): Promise<GenericDocumentResponse> => {
        const response = await this.fetch(
          appendQueryParams(`/${pluralName}/${documentID}`, queryParams),
          {
            method: 'PUT',
            body: JSON.stringify(body),
          }
        );

        return this._validator.parseDocumentResponse(response);
      },
      delete: async (
        documentID: string,
        queryParams?: BaseQueryParams
      ): Promise<GenericDocumentResponse> => {
        const response = await this.fetch(
          appendQueryParams(`/${pluralName}/${documentID}`, queryParams),
          {
            method: 'DELETE',
          }
        );

        return this._validator.parseDocumentResponse(response);
      },
    };
  }

  /**
   * Provides methods to interact with a single-type route in the Strapi application.
   *
   * This method returns an object with methods to perform CRUD operations on a single-type route.
   *
   * @param pluralName - The pluralName of the single-type to interact with.
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
  single(pluralName: string) {
    this._validator.validatePluralName(pluralName);

    return {
      findOne: async (queryParams?: BaseQueryParams): Promise<GenericDocumentResponse> => {
        const response = await this.fetch(appendQueryParams(`/${pluralName}`, queryParams), {
          method: 'GET',
        });

        return this._validator.parseDocumentResponse(response);
      },
      create: async (
        body: Record<string, any>,
        queryParams?: BaseQueryParams
      ): Promise<GenericDocumentResponse> => {
        const response = await this.fetch(appendQueryParams(`/${pluralName}`, queryParams), {
          method: 'POST',
          body: JSON.stringify(body),
        });

        return this._validator.parseDocumentResponse(response);
      },
      update: async (
        body: Record<string, any>,
        queryParams?: BaseQueryParams
      ): Promise<GenericDocumentResponse> => {
        const response = await this.fetch(appendQueryParams(`/${pluralName}`, queryParams), {
          method: 'PUT',
          body: JSON.stringify(body),
        });

        return this._validator.parseDocumentResponse(response);
      },
      delete: async (queryParams?: BaseQueryParams): Promise<GenericDocumentResponse> => {
        const response = await this.fetch(appendQueryParams(`/${pluralName}`, queryParams), {
          method: 'DELETE',
        });

        return this._validator.parseDocumentResponse(response);
      },
    };
  }
}
