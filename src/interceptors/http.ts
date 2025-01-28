import { HttpClient } from '../http';

import type { RequestInterceptor, ResponseInterceptor } from '../http';

/**
 * A utility class to manage HTTP interceptors for requests and responses.
 *
 * This class provides static factory methods to create and register interceptors
 * for HTTP clients, ensuring consistent capability like adding default headers
 * to requests and transforming HTTP response errors into standardized exceptions.
 *
 * It is primarily used in conjunction with the {@link HttpClient} class to handle
 * pre- and post-processing of HTTP requests and responses.
 */
export class HttpInterceptors {
  /**
   * Automatically sets default headers for all HTTP requests.
   *
   * This interceptor is typically used to attach headers such as `Content-Type`, or other app-specific metadata.
   *
   * @returns A request interceptor that modifies the request to include the default headers.
   *
   * @example
   * ```typescript
   * httpClient.interceptors.request.use(HttpInterceptors.setDefaultHeaders());
   *```
   */
  public static setDefaultHeaders(): RequestInterceptor {
    const DEFAULT_HEADERS = new Map([['Content-Type', 'application/json']]);

    return ({ request }) => {
      for (const [key, value] of DEFAULT_HEADERS.entries()) {
        const hasHeader = request.headers.has(key);

        if (!hasHeader) {
          request.headers.set(key, value);
        }
      }

      return { request };
    };
  }

  /**
   * Handle HTTP response errors and transform them into
   * more specific and meaningful exceptions (subclasses of `HTTPError`)
   *
   * This interceptor looks at HTTP responses and checks whether it was successful.
   *
   * If the response indicates failure (non-OK status), it maps the response status to a
   * specific `HTTPError` subclass.
   *
   * @returns A response interceptor that transforms errors into custom exceptions.
   *
   * @example
   * ```typescript
   * // Register error transformation in an HTTP client
   * const httpClient = new HttpClient(config);
   * httpClient.interceptors.response.use(HttpInterceptors.transformErrors());
   *```
   *
   * @errors
   * Throws a specific subclass of `HTTPError` if the response is not successful.
   * - `HTTPBadRequestError` (400)
   * - `HTTPAuthorizationError` (401)
   * - `HTTPForbiddenError` (403)
   * - `HTTPNotFoundError` (404)
   * - `HTTPTimeoutError` (408)
   * - `HTTPInternalServerError` (500)
   * - 'HTTPError' (default)
   *
   * @see {@link HttpClient.mapResponseToHTTPError}
   */
  public static transformErrors(): ResponseInterceptor {
    return ({ request, response }) => {
      if (response.ok) {
        return { request, response };
      }

      throw HttpClient.mapResponseToHTTPError(response, request);
    };
  }
}
