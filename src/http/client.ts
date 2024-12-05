import { AuthManager } from '../auth';
import { URLValidator } from '../validators';

export type Fetch = typeof globalThis.fetch;

/**
 * Strapi SDK's HTTP Client
 *
 * Provides methods for configuring the base URL, authentication strategies,
 * and for performing HTTP requests with automatic header management and URL validation.
 */
export class HttpClient {
  // Properties
  private _baseURL: string;

  // Dependencies
  private readonly _authManager: AuthManager;
  private readonly _urlValidator: URLValidator;

  constructor(
    // Properties
    baseURL: string,

    // Dependencies
    authManager = new AuthManager(),
    urlValidator: URLValidator = new URLValidator()
  ) {
    // Initialization
    this._baseURL = baseURL;

    this._authManager = authManager;
    this._urlValidator = urlValidator;

    // Validation
    this._urlValidator.validate(this._baseURL);
  }

  /**
   * Gets the currently set base URL.
   *
   * @returns The base URL used for HTTP requests.
   */
  get baseURL(): string {
    return this._baseURL;
  }

  /**
   * Sets a new base URL for the HTTP client and validates it.
   *
   * @param url - The new base URL to set.
   *
   * @returns The HttpClient instance for chaining.
   *
   * @throws {URLParsingError} If the URL cannot be parsed.
   * @throws {URLProtocolValidationError} If the URL uses an unsupported protocol.
   *
   * @example
   * const client = new HttpClient('http://example.com');
   *
   * client.setBaseURL('http://newexample.com');
   */
  setBaseURL(url: string): this {
    this._urlValidator.validate(url);

    this._baseURL = url;

    return this;
  }

  /**
   * Sets the authentication strategy for the HTTP client.
   *
   * Configures how the client handles authentication based on the specified strategy and options.
   *
   * @param strategy - The authentication strategy to use.
   * @param options - Additional options required for the authentication strategy.
   *
   * @throws {StrapiSDKError} If the given strategy is not supported
   *
   * @returns The HttpClient instance for chaining.
   *
   * @example
   * client.setAuthStrategy('api-token', { token: 'abc123' });
   */
  setAuthStrategy(strategy: string, options: unknown): this {
    this._authManager.setStrategy(strategy, options);

    return this;
  }

  /**
   * Performs an HTTP fetch request to the specified URL.
   *
   * Attaches the necessary headers, authenticates if required, and handles unauthorized errors.
   *
   * @param url - The URL to which the request is made, appended to the base URL.
   * @param [init] - Optional object containing any custom settings to apply to the fetch request.
   *
   * @returns A promise that resolves to the HTTP response.
   *
   * @throws {Error} If the authentication can't be completed, or if the server can't be reached
   *
   * @example
   * client.fetch('/data')
   *  .then(response => response.json())
   *  .then(data => console.log(data));
   */
  async fetch(url: string, init?: RequestInit): Promise<Response> {
    if (!this._authManager.isAuthenticated) {
      await this._authManager.authenticate(this);
    }

    const request = new Request(`${this._baseURL}${url}`, init);

    this.attachHeaders(request);

    const response = await this._fetch(request);

    if (response.status === 401) {
      this._authManager.handleUnauthorizedError();
    }

    return response;
  }

  /**
   * Executes an HTTP fetch request using the Fetch API.
   *
   * @param url - The target URL for the HTTP request which can be a string URL or a `Request` object.
   * @param [init] - An optional `RequestInit` object that contains any custom settings that you want to apply to the request.
   *
   * @returns A promise that resolves to the `Response` object representing the complete HTTP response.
   *
   * @additionalInfo
   * - This method doesn't perform any authentication or header customization.
   *   It directly passes the parameters to the global `fetch` function.
   * - To include authentication, consider using the `fetch` method from the `HttpClient` class, which handles headers and authentication.
   */
  async _fetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
    return globalThis.fetch(url, init);
  }

  /**
   * Attaches default and authentication headers to an HTTP request.
   *
   * This method ensures that a default 'Content-Type' header is set for the request if it is not already specified.
   *
   * It also delegates to the AuthManager to append any necessary authentication headers,
   * potentially overwriting existing ones to ensure correct authorization.
   *
   * @param request - The HTTP request object to which headers are added.
   */
  private attachHeaders(request: Request) {
    // Set the default content-type header if it hasn't been defined already
    if (!request.headers.has('Content-Type')) {
      request.headers.set('Content-Type', 'application/json');
    }

    // Set auth headers if available, potentially overwrite manually set auth headers
    this._authManager.authenticateRequest(request);
  }
}
