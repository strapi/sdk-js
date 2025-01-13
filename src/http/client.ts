import createDebug from 'debug';

import {
  HTTPAuthorizationError,
  HTTPBadRequestError,
  HTTPError,
  HTTPForbiddenError,
  HTTPInternalServerError,
  HTTPNotFoundError,
  HTTPTimeoutError,
} from '../errors';
import { PathFormatter } from '../formatters';
import { RequestHelper } from '../utilities';
import { URLValidator } from '../validators';

import { DEFAULT_HTTP_TIMEOUT_MS, StatusCode } from './constants';
import { HttpInterceptorManager } from './interceptor-manager';

import type { HttpClientConfig, InterceptorManagerMap } from './types';

const debug = createDebug('strapi:http');

/**
 * Strapi SDK's HTTP Client
 *
 * Provides methods for configuring the base URL, timeout, interceptors, headers,
 * and for performing HTTP requests with automatic URL validation.
 */
export class HttpClient {
  // Properties
  public readonly interceptors: InterceptorManagerMap;

  private _baseURL: string;
  private _timeout: number;

  private readonly _headers: Record<string, string>;

  // Dependencies
  private readonly _urlValidator: URLValidator;

  constructor(
    // Properties
    config: HttpClientConfig,

    // Dependencies
    urlValidator: URLValidator = new URLValidator()
  ) {
    debug('initializing new client with base url: %o', config.baseURL);

    // Initialization
    this._baseURL = PathFormatter.format(config.baseURL, { trailingSlashes: false });
    this._timeout = config.timeout ?? DEFAULT_HTTP_TIMEOUT_MS;
    this._headers = config.headers ?? {};

    // Initialize the global interceptors
    this.interceptors = {
      request: new HttpInterceptorManager(),
      response: new HttpInterceptorManager(),
    };

    this._urlValidator = urlValidator;

    // Validation
    this._urlValidator.validate(this._baseURL);
  }

  /**
   * Gets the currently set base URL.
   *
   * @returns The base URL used for HTTP requests.
   */
  public get baseURL(): string {
    return this._baseURL;
  }

  /**
   * Gets the request timeout.
   *
   * @returns The timeout used for HTTP requests.
   */
  public get timeout(): number {
    return this._timeout;
  }

  /**
   * Gets the request headers.
   *
   * @returns The headers used for HTTP requests.
   */
  public get headers(): Record<string, string> {
    return this._headers;
  }

  /**
   * Sets a new base URL for the HTTP client and validates it.
   *
   * @param url - The new base URL to set.
   *
   * @returns The HttpClient instance for chaining.
   *
   * @throws {URLParsingError} If the URL cannot be parsed.
   *
   * @example
   * const client = new HttpClient('http://example.com');
   *
   * client.setBaseURL('http://newexample.com');
   */
  public setBaseURL(url: string): this {
    this._urlValidator.validate(url);

    // Make sure the base URL don't have trailing slashes
    this._baseURL = PathFormatter.format(url, { trailingSlashes: false });

    debug('setting new base url: %o', this._baseURL);

    return this;
  }

  /**
   * Sets a new timeout value for the HTTP client and validates it.
   *
   * @param timeout The new timeout to set.
   *
   * @returns The HttpClient instance for chaining.
   *
   * @throws {TypeError} If the timeout is not a safe integer.
   *
   * @example
   * const client = new HttpClient({ baseURL: 'http://example.com' });
   *
   * client.setTimeout(3000);
   */
  public setTimeout(timeout: number): this {
    debug('setting new timeout: %o', timeout);

    if (!Number.isSafeInteger(timeout)) {
      throw new TypeError('Timeout must be a safe integer');
    }

    this._timeout = timeout;

    return this;
  }

  /**
   * Sends an HTTP request to the specified relative path with the provided options, applying interceptors,
   * global headers, and a timeout mechanism.
   *
   * The `request` method handles low-level HTTP transactions and should be used
   * internally or via helper methods (`get`, `post`, `put`, `delete`).
   *
   * @param path - The relative URL (path) to use for the HTTP request.
   *               This shouldn't include the base URL as it is automatically appended.
   * @param [init] - (Optional) The request initialization options, following the `RequestInit` interface.
   *                 This can include headers, method, body, signal, and other fetch options.
   *
   * @returns A `Promise` resolving with the HTTP response after being processed by response interceptors.
   *          The response contains the server's reply to the HTTP call, which consumers can handle as needed.
   *
   * @throws {DOMException} If the request is aborted due to exceeding the timeout limit.
   *
   * @example
   * // Example usage of the request method to send a GET request:
   * const client = new HttpClient({ baseURL: 'https://api.example.com', timeout: 5000 });
   *
   * try {
   *   const response = await client.request('/users', { method: 'GET' });
   *   const data = await response.json();
   *   console.log(data);
   * } catch (error) {
   *   console.error('Request failed:', error);
   * }
   *
   * @example
   * // Sending a POST request with a JSON payload:
   * const response = await client.request('/users', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
   * });
   * console.log(await response.json());
   *
   * @example
   * // Handling timeout:
   * try {
   *   const response = await client.request('/slow-endpoint', { method: 'GET' });
   *   console.log(await response.text());
   * } catch (error) {
   *   if (error.name === 'AbortError') {
   *     console.error('Request aborted due to timeout.');
   *   } else {
   *     console.error('Request failed:', error);
   *   }
   * }
   *
   * @additional-information
   * - **Global Headers**: The method appends headers defined in the `_headers` property of the `HttpClient`.
   * - **Interceptors**: Request and response interceptors are defined in the `interceptors` property
   *   and are executed to modify or handle request and response lifecycle logic.
   * - **Timeout**: The timeout duration is specified when configuring the `HttpClient` instance. It overrides
   *   any abort signals provided by the user.
   * - **Dependencies**:
   *   - Relies on the `fetch` API to execute the HTTP request.
   *   - `PathFormatter` is used to sanitize the relative path.
   *
   * @see {@link HttpClient.interceptors} for adding custom interceptors.
   * @see {@link HttpClient.baseURL} for setting the base URL of requests.
   * @see {@link PathFormatter.format} for formatting and sanitizing URL paths.
   */
  public async request(path: string, init?: RequestInit): Promise<Response> {
    const safePath = PathFormatter.format(path, { leadingSlashes: 'single' });

    const url = new URL(`${this.baseURL}${safePath}`);
    const originalRequest = new Request(url, init);

    // Attach instance headers
    for (const [key, value] of Object.entries(this._headers)) {
      originalRequest.headers.append(key, value);
      debug('%o header set to %o for %o', key, value, RequestHelper.format(originalRequest));
    }

    // Apply global request interceptors
    const { request: processedRequest } = await this.interceptors.request.execute({
      request: originalRequest,
    });

    // Create a custom controller to stop the request if it exceeds the timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this._timeout);

    // Create a request that can be aborted using the custom controller,
    // this always supersedes user-defined signals in interceptors
    const request = new Request(processedRequest, { signal: controller.signal });

    try {
      // Make the network call
      const response = await this.fetch(url, request);

      clearTimeout(timeoutId);

      // Process the response using the response interceptors
      const { response: processedResponse } = await this.interceptors.response.execute({
        request,
        response,
      });

      return processedResponse;
    } catch (error) {
      // Propagate errors through response interceptors
      clearTimeout(timeoutId);

      throw await this.interceptors.response.reject(error);
    }
  }

  /**
   * Makes a direct HTTP request to the specified URL or request input using the Fetch API.
   *
   * This method provides a low-level interface to send HTTP requests using the global Fetch API.
   * It is protected and intended to be used internally by the `HttpClient` class.
   *
   * @param input - The target URL or a `RequestInfo` instance representing the request to be made.
   * @param [init] - (Optional) Configuration options for the request, compatible with the `RequestInit` interface.
   *
   * @returns A `Promise` that resolves with the raw HTTP Response returned by the server.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API Documentation}
   */
  protected fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    return globalThis.fetch(input, init);
  }

  /**
   * Sends an HTTP GET request to the specified relative path.
   *
   * This method is a shortcut for making GET requests with the `request` method.
   *
   * @param path - The relative URL (path) to send the request to.
   * The base URL is automatically appended.
   *
   * @param [init] - (Optional) Additional request options such as headers or signals.
   *
   * @returns A `Promise` that resolves to the HTTP Response.
   * It contains the server's reply to the GET request.
   *
   * @example
   * // Example usage of the get method:
   * const client = new HttpClient({ baseURL: 'https://api.example.com' });
   * const response = await client.get('/users');
   * const data = await response.json();
   * console.log(data);
   */
  public async get(path: string, init?: RequestInit): Promise<Response> {
    return this.request(path, { method: 'GET', ...init });
  }

  /**
   * Sends an HTTP POST request to the specified relative path with an optional request body.
   *
   * This method is a shortcut for making POST requests with the `request` method.
   *
   * @param path - The relative URL (path) to send the request to.
   * The base URL is automatically appended.
   *
   * @param [body] - (Optional) The content to be sent in the request body, such as JSON or form data.
   *
   * @param [init] - (Optional) Additional request options such as headers or signals.
   *
   * @returns A `Promise` that resolves to the HTTP Response.
   * It contains the server's reply to the POST request.
   *
   * @example
   * // Example usage of the post method:
   * const client = new HttpClient({
   *   baseURL: 'https://api.example.com',
   *   headers: { 'Content-Type': 'application/json' }
   * });
   *
   * const response = await client.post('/users', JSON.stringify({ name: 'John' }));
   * const data = await response.json();
   *
   * console.log(data);
   */
  public async post(path: string, body?: BodyInit, init?: RequestInit): Promise<Response> {
    return this.request(path, { method: 'POST', body, ...init });
  }

  /**
   * Sends an HTTP PUT request to the specified relative path with an optional request body.
   *
   * This method is a shortcut for making PUT requests with the `request` method.
   *
   * @param path - The relative URL (path) to send the request to. The base URL is automatically appended.
   * @param [body] - (Optional) The content to be sent in the request body, such as JSON or form data.
   * @param [init] - (Optional) Additional request options such as headers or signals.
   *
   * @returns A `Promise` that resolves to the HTTP Response. It contains the server's reply to the PUT request.
   *
   * @example
   * // Example usage of the put method:
   * const client = new HttpClient({
   *   baseURL: 'https://api.example.com',
   *   headers: { 'Content-Type': 'application/json' }
   * });
   *
   * const response = await client.put('/users/1', JSON.stringify({ name: 'John Updated' }));
   * const data = await response.json();
   *
   * console.log(data);
   */
  public async put(path: string, body?: BodyInit, init?: RequestInit): Promise<Response> {
    return this.request(path, { method: 'PUT', body, ...init });
  }

  /**
   * Sends an HTTP DELETE request to the specified relative path.
   *
   * This method is a shortcut for making DELETE requests with the `request` method.
   *
   * @param path - The relative URL (path) to send the request to.
   * The base URL is automatically appended.
   *
   * @param [init] - (Optional) Additional request options such as headers or signals.
   *
   * @returns A `Promise` that resolves to the HTTP Response.
   * It contains the server's reply to the DELETE request.
   *
   * @example
   * // Example usage of the delete method:
   * const client = new HttpClient({ baseURL: 'https://api.example.com' });
   *
   * const response = await client.delete('/users/1');
   * if (response.ok) {
   *   console.log('User deleted successfully.');
   * } else {
   *   console.error('Failed to delete user.');
   * }
   */
  public async delete(path: string, init?: RequestInit): Promise<Response> {
    return this.request(path, { method: 'DELETE', ...init });
  }

  /**
   * Creates a new instance of `HttpClient`, inheriting the current instance's configuration
   * with the option to inherit request and response interceptors.
   *
   * This method is designed to enable the creation of a modified or isolated `HttpClient` instance
   * that preserves the prototype chain, allowing better extensibility for subclasses or testing setups.
   *
   * Defaults to inheriting all interceptors unless specified otherwise.
   *
   * @param [config={}] - An optional configuration object to override the client's existing settings.
   * If a property is not provided, it falls back to the current instance's configuration.
   *
   * @param [inheritInterceptors=true] - Whether to inherit the current instance's request and response interceptors.
   * If `false`, the new instance won't include any interceptors.
   *
   * @returns A new `HttpClient` instance with either the inherited or overridden configuration and interceptors.
   *
   * @throws {Error} If the created instance is not an instance of `HttpClient` (unexpected scenario).
   *
   * @example
   * // Creating a new client with default settings
   * const newClient = httpClient.create();
   *
   * // Creating a new client with custom settings and no inherited interceptors
   * const customClient = httpClient.create({ baseURL: 'https://api.example.com' }, false);
   *
   * @example
   * // Using the new instance for isolated requests
   * const client = httpClient.create({ headers: { Authorization: 'Bearer token' } });
   * const response = await client.get('/data');
   *
   * @see {@link HttpClientConfig} for details on valid configuration options.
   */
  public create(
    config: Partial<HttpClientConfig> = {},
    inheritInterceptors: boolean = true
  ): HttpClient {
    // Object.getPrototypeOf is used here to dynamically retrieve the prototype of the current instance,
    // allowing to invoke the constructor dynamically without explicitly tying the code to the HttpClient class.
    //
    // This provides flexibility and ensures that any subclass of HttpClient
    // that extends its prototype can also use the `create` method properly without being
    // overridden by a hard-coded reference to HttpClient itself.
    //
    // Essentially, it enables inheritance and thus makes mocking the HttpClient easier
    const proto = Object.getPrototypeOf(this);

    const fork = new proto.constructor(
      {
        baseURL: config.baseURL ?? this._baseURL,
        timeout: config.timeout ?? this._timeout,
        headers: config.headers ?? this._headers,
      },
      // Keep the same dependencies reference
      this._urlValidator
    );

    // Unlikely, but this prevents prototype replacement and allows type narrowing as a side effect
    if (!(fork instanceof HttpClient)) {
      throw new Error('The created instance is not an instance of HttpClient');
    }

    if (inheritInterceptors) {
      fork.interceptors.request = this.interceptors.request.clone();
      fork.interceptors.response = this.interceptors.response.clone();
    }

    return fork;
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
  static mapResponseToHTTPError(response: Response, request: Request): HTTPError {
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
