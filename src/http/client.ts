import { AuthManager } from '../auth';
import {
  HTTPAuthorizationError,
  HTTPBadRequestError,
  HTTPError,
  HTTPForbiddenError,
  HTTPInternalServerError,
  HTTPNotFoundError,
  HTTPTimeoutError,
} from '../errors';
import { URLValidator } from '../validators';

import { StatusCode } from './constants';

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

    try {
      return await this._fetch(request);
    } catch (e) {
      this.handleFetchError(e);

      throw e;
    }
  }

  /**
   * Handles HTTP fetch error logic.
   *
   * It deals with unauthorized responses by delegating the handling of the error to the authentication manager.
   *
   * @param error - The original HTTP request object that encountered an error. Used for error handling.
   *
   * @throws {HTTPError} or any of its subclasses
   *
   * @example
   * ```typescript
   * try {
   *   client.fetch('/data');
   * } catch (error) {
   *   if (error instanceof HTTPAuthorizationError) {
   *     console.log('Unauthorized access, please login again.');
   *   }
   * }
   * ```
   *
   * @see {@link HttpClient#mapResponseToHTTPError} for the mapping logic between response status codes and thrown errors.
   * @see {@link AuthManager#handleUnauthorizedError} for handling unauthorized responses.
   */
  private handleFetchError(error: unknown) {
    if (error instanceof HTTPAuthorizationError) {
      this._authManager.handleUnauthorizedError();
    }
  }

  /**
   * Executes an HTTP fetch request using the Fetch API.
   *
   * @param input - The target of the HTTP request which can be a string URL or a `Request` object.
   * @param [init] - An optional `RequestInit` object that contains any custom settings that you want to apply to the request.
   *
   * @returns A promise that resolves to the `Response` object representing the complete HTTP response.
   *
   * @throws {HTTPError} if the request fails
   *
   * @additionalInfo
   * - This method doesn't perform any authentication or header customization.
   *   It directly passes the parameters to the global `fetch` function.
   * - To include authentication, consider using the `fetch` method from the `HttpClient` class, which handles headers and authentication.
   */
  async _fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const request = new Request(input, init);
    const response = await globalThis.fetch(request);

    if (!response.ok) {
      throw this.mapResponseToHTTPError(response, request);
    }

    return response;
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

  /**
   * Maps an HTTP response's status code to a specific HTTP error class.
   *
   * @param response - The HTTP response object obtained from a failed HTTP request,
   *                   which contains the status code and reason for failure.
   * @param request - The original HTTP request object that resulted in the error response.
   *
   * @returns A specific subclass instance of HTTPError based on the response status code.
   *
   * @throws {HTTPError} or any of its subclass.
   *
   * @see {@link StatusCode} for all possible HTTP status codes and their meanings.
   */
  private mapResponseToHTTPError(response: Response, request: Request): HTTPError {
    switch (response.status) {
      case StatusCode.BAD_REQUEST:
        return new HTTPBadRequestError(response, request);
      case StatusCode.UNAUTHORIZED:
        return new HTTPAuthorizationError(response, request);
      case StatusCode.FORBIDDEN:
        return new HTTPForbiddenError(response, request);
      case StatusCode.NOT_FOUND:
        return new HTTPNotFoundError(response, request);
      case StatusCode.TIMEOUT:
        return new HTTPTimeoutError(response, request);
      case StatusCode.INTERNAL_SERVER_ERROR:
        return new HTTPInternalServerError(response, request);
    }

    return new HTTPError(response, request);
  }
}
