import createDebug from 'debug';

import { AuthManager } from './auth';
import { CollectionTypeManager, SingleTypeManager } from './content-types';
import { StrapiError, StrapiInitializationError } from './errors';
import { HttpClient } from './http';
import { AuthInterceptors, HttpInterceptors } from './interceptors';
import { StrapiConfigValidator } from './validators';

import type { HttpClientConfig } from './http';

const debug = createDebug('strapi:core');

export interface StrapiConfig {
  /** The base URL of the Strapi content API, required for all client library operations. */
  baseURL: string;

  /** Optional authentication configuration, which specifies a strategy and its details. */
  auth?: AuthConfig;
}

/**
 * Describes an authentication strategy used in the client library configuration.
 *
 * @template T The type of options for the authentication strategy.
 */
export interface AuthConfig<T = unknown> {
  /** The identifier of the authentication method */
  strategy: string;
  /** Configuration details for the specified strategy */
  options?: T;
}

/**
 * Class representing the Strapi Client to interface with a Strapi backend.
 *
 * This class integrates setting up configuration, validation, and handling
 * HTTP requests with authentication.
 *
 * It serves as the main interface through which users interact with
 * their Strapi installation programmatically.
 */
export class Strapi {
  /** @internal */
  private readonly _config: StrapiConfig;

  /** @internal */
  private readonly _validator: StrapiConfigValidator;

  /** @internal */
  private readonly _authManager: AuthManager;

  /** @internal */
  private readonly _httpClient: HttpClient;

  /** @internal */
  constructor(
    // Properties
    config: StrapiConfig,

    // Dependencies
    validator: StrapiConfigValidator = new StrapiConfigValidator(),
    authManager: AuthManager = new AuthManager(),

    // Lazy dependencies
    httpClientFactory?: (config: HttpClientConfig) => HttpClient
  ) {
    // Properties
    this._config = config;

    // Dependencies
    this._validator = validator;
    this._authManager = authManager;

    debug('started the initialization process');

    // Validation
    this.preflightValidation();

    debug('user config passed the preflight validation');

    // The HTTP client depends on the preflightValidation for the baseURL validity.
    // It could be instantiated before but would throw an invalid URL error
    // instead of the client library itself throwing an initialization exception.
    this._httpClient = httpClientFactory
      ? httpClientFactory({ baseURL: config.baseURL })
      : new HttpClient({ baseURL: config.baseURL });

    this.init();

    debug('finished the client initialization process');
  }

  /**
   * Performs preliminary validation of the client configuration.
   *
   * This method ensures that the provided configuration for the client is valid by using the
   * internal client validator. It is invoked during the initialization process to confirm that
   * all necessary parts are correctly configured before effectively using the client.
   *
   * @throws {StrapiInitializationError} If the configuration validation fails, indicating an issue with the client initialization process.
   *
   * @example
   * // Creating a new instance of the client which triggers preflightValidation
   * const config = {
   *   baseURL: 'https://example.com',
   *   auth: {
   *     strategy: 'jwt',
   *     options: { token: 'your-token-here' }
   *   }
   * };
   * const client = new Strapi(config);
   *
   * // The preflightValidation is automatically called within the constructor
   * // to ensure the provided config is valid prior to any further setup.
   *
   * @note This method is private and only called internally during client initialization.
   *
   * @internal
   */
  private preflightValidation() {
    try {
      debug('validating the configuration');
      this._validator.validateConfig(this._config);
    } catch (e) {
      throw new StrapiInitializationError(e);
    }
  }

  /**
   * Initializes the configuration settings for the client.
   *
   * @internal
   */
  private init() {
    debug('init modules');

    this.initHttp();
    this.initAuth();
  }

  /**
   * Initializes the HTTP client configuration for the client.
   *
   * Sets up necessary HTTP interceptors to ensure consistent behavior:
   * - Adds default HTTP request headers.
   * - Configures error handling for HTTP responses.
   *
   * It basically ensures that all outgoing HTTP requests include standard headers
   * and that errors are properly converted into meaningful exceptions for easier debugging.
   *
   * @note
   * This method is private and should only be invoked internally during the client initialization process.
   *
   * @internal
   */
  private initHttp() {
    debug('init http module');

    // Automatically sets default headers for all HTTP requests.
    this._httpClient.interceptors.request.use(HttpInterceptors.setDefaultHeaders());

    // Handle HTTP response errors and transform them into
    // more specific and meaningful exceptions (subclasses of `HTTPError`)
    this._httpClient.interceptors.response.use(HttpInterceptors.transformErrors());
  }

  /**
   * Initializes the authentication configuration for the client.
   *
   * Sets up authentication strategies and required HTTP interceptors to:
   * - Handle user authentication through the configured strategy.
   * - Automatically attach authentication data (for example, tokens) to outgoing HTTP requests.
   * - Handle authentication errors (for example, unauthorized responses) consistently.
   *
   * @note
   * This method is private and should only be invoked internally during the client initialization process.
   *
   * @internal
   */
  private initAuth() {
    debug('init auth module');

    // If an auth configuration is defined, use it to configure the auth manager
    if (this.auth) {
      const { strategy, options } = this.auth;

      debug('setting up the auth strategy using %o', strategy);

      try {
        this._authManager.setStrategy(strategy, options);
      } catch (e) {
        throw new StrapiInitializationError(
          e,
          `Failed to initialize the client auth manager: ${e instanceof StrapiError ? e.cause : e}`
        );
      }
    }

    this._httpClient.interceptors.request
      // Ensures the "user" is pre-authenticated before an HTTP request is sent.
      .use(AuthInterceptors.ensurePreAuthentication(this._authManager, this._httpClient))
      // Authenticates outgoing HTTP requests by injecting authentication-specific headers.
      .use(AuthInterceptors.authenticateRequests(this._authManager));

    this._httpClient.interceptors.response
      // Notifies the authentication manager upon receiving an unauthorized HTTP response or error.
      .use(...AuthInterceptors.notifyOnUnauthorizedResponse(this._authManager));
  }

  /**
   * Retrieves the authentication configuration for the Strapi client.
   *
   * @note This is a private property used internally within the client for configuring authentication in the HTTP layer.
   *
   * @internal
   */
  private get auth() {
    return this._config.auth;
  }

  /**
   * Retrieves the base URL of the Strapi Client instance.
   *
   * This getter returns the `baseURL` property stored within the client's configuration object.
   *
   * The base URL is used as the starting point for all HTTP requests initiated through the client.
   *
   * @returns The current base URL configured in the client.
   *          This URL typically represents the root endpoint of the Strapi service the client interfaces with.
   *
   * @example
   * const config = { baseURL: 'http://localhost:1337/api' };
   * const client = new Strapi(config);
   *
   * console.log(client.baseURL); // Output: http://localhost:1337
   */
  public get baseURL(): string {
    return this._config.baseURL;
  }

  /**
   * Executes an HTTP fetch request to a specified endpoint using the client HTTP client.
   *
   * This method ensures authentication is handled before issuing requests and sets the necessary headers.
   *
   * @param url - The endpoint to fetch from, appended to the base URL of the client.
   * @param [init] - Optional initialization options for the request, such as headers or method type.
   *
   * @example
   * ```typescript
   * // Create the client instance
   * const config = { baseURL: 'http://localhost:1337/api' };
   * const client = new Strapi(config);
   *
   * // Perform a custom fetch query
   * const response = await client.fetch('/categories');
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
    return this._httpClient.request(url, init);
  }

  /**
   * Returns a {@link CollectionTypeManager} instance to interact with the specified collection-type routes in the
   * Strapi app.
   *
   * This instance provides methods for performing operations on the associated documents: create, read, update, delete.
   *
   * @param resource -  The plural name of the collection to interact with.
   *                    This should match the collection name as defined in the Strapi app.
   *
   * @returns An instance of {@link CollectionTypeManager} targeting the given {@link resource} name.
   *
   * @example
   * ```typescript
   * // Initialize the client with required configuration
   * const config = { baseURL: 'http://localhost:1337/api' };
   * const client = new Strapi(config);
   *
   * // Retrieve a CollectionTypeManager for the 'articles' resource
   * const articles = client.collection('articles');
   *
   * // Example: find all articles
   * const allArticles = await articles.find();
   *
   * // Example: find a single article by ID
   * const singleArticle = await articles.findOne('936c6dc0-f2ec-46c3-ac6d-c0f2ec46c396');
   *
   * // Example: create a new article
   * const newArticle = await articles.create({ title: 'New Article' });
   *
   * // Example: update an existing article
   * const updatedArticle = await articles.update('90169631-7033-4963-9696-317033a96341', { title: 'Updated Title' });
   *
   * // Example: delete an article
   * await articles.delete('dde61ffb-00a6-4cc7-a61f-fb00a63cc740');
   * ```
   *
   * @see CollectionTypeManager
   * @see Strapi
   */
  collection(resource: string) {
    return new CollectionTypeManager(resource, this._httpClient);
  }

  /**
   * Returns a {@link SingleTypeManager} instance to interact with the specified single-type routes in the Strapi app.
   *
   * This instance provides methods for managing the associated single-type document: read, update, delete.
   *
   * @param resource - The singular name of the single-type resource to interact with.
   *                   This should match the single-type name as defined in the Strapi app.
   *
   * @returns An instance of {@link SingleTypeManager} targeting the given {@link resource} name.
   *
   * @example
   * ```typescript
   * // Initialize the client with required configuration
   * const client = new Strapi({ baseURL: 'http://localhost:1337/api' });
   *
   * // Retrieve a SingleTypeManager for the 'homepage' resource
   * const homepage = client.single('homepage');
   *
   * // Example: fetch the homepage content in Spanish
   * const homepageContent = await homepage.find({ locale: 'es' });
   *
   * // Example: update the homepage content
   * const updatedHomepage = await homepage.update({ title: 'Updated Homepage Title' });
   *
   * // Example: delete the homepage content
   * await homepage.delete();
   * ```
   *
   * @see SingleTypeManager
   * @see Strapi
   */
  single(resource: string) {
    return new SingleTypeManager(resource, this._httpClient);
  }
}
