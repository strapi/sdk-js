import { AuthManager } from '../auth';
import { HTTPAuthorizationError } from '../errors';
import { HttpClient, StatusCode } from '../http';

import type { RequestInterceptor, ResponseInterceptor } from '../http';
import type { Interceptor } from '../http/interceptor-manager';

/**
 * A utility class providing a set of HTTP interceptors for managing authentication lifecycle operations.
 *
 * It includes methods to:
 * - Ensure pre-authentication before making any HTTP requests.
 * - Automatically authenticate outgoing HTTP requests by injecting authentication headers.
 * - Handle unauthorized HTTP responses and notify the authentication manager.
 *
 * This class is primarily used in combination with an {@link AuthManager} and an {@link HttpClient} to enable seamless
 * integration of authentication capability within HTTP workflows.
 */
export class AuthInterceptors {
  /**
   * Ensures the user is pre-authenticated before an HTTP request is sent.
   *
   * This interceptor checks if the authentication manager has a configured strategy but the
   * user is not yet authenticated. If so, it triggers the authentication process.
   *
   * @param authManager - The `AuthManager` instance that handles the authentication process.
   * @param httpClient - The `HttpClient` instance used during the authentication process.
   *
   * @returns A request interceptor that ensures pre-authentication.
   *
   * @example
   * ```typescript
   * httpClient.interceptors.request.use(
   *   AuthInterceptors.ensurePreAuthentication(authManager, httpClient)
   * );
   * ```
   *
   * @throws - An error if the authentication process fails.
   *
   * @note The provided http client should **NOT** have auth interceptors attached to it as it might lead to infinite authentication loops
   */
  public static ensurePreAuthentication(
    authManager: AuthManager,
    httpClient: HttpClient
  ): RequestInterceptor {
    return async ({ request }) => {
      const { strategy, isAuthenticated } = authManager;

      if (strategy && !isAuthenticated) {
        await authManager.authenticate(httpClient);
      }

      return { request };
    };
  }

  /**
   * Authenticates outgoing HTTP requests by injecting authentication-specific headers.
   *
   * This interceptor updates HTTP requests with the necessary authentication information,
   * such as tokens, sourced from the current authentication provider.
   *
   * @param authManager - The `AuthManager` instance that manages request authentication.
   *
   * @returns A request interceptor that injects authentication headers into outgoing requests.
   *
   * @example
   * ```typescript
   * httpClient.interceptors.request.use(
   *   AuthInterceptors.authenticateRequests(authManager)
   * );
   * ```
   *
   * @throws - An error if the headers in the HTTP request are invalid or unavailable.
   */
  public static authenticateRequests(authManager: AuthManager): RequestInterceptor {
    return ({ request }) => {
      authManager.authenticateRequest(request);

      return { request };
    };
  }

  /**
   * Notifies the authentication manager upon receiving an unauthorized HTTP response.
   *
   * This interceptor detects `401 Unauthorized` errors in HTTP responses, indicating
   * that the current authentication session has become invalid and resets the
   * authentication state.
   *
   * @param authManager - The `AuthManager` instance that manages the authentication state and errors.
   *
   * @returns A response interceptor that handles unauthorized responses.
   *
   * @example
   * ```typescript
   * httpClient.interceptors.response.use(
   *   AuthInterceptors.notifyOnUnauthorizedResponse(authManager)
   * );
   * ```
   */
  public static notifyOnUnauthorizedResponse(
    authManager: AuthManager
  ): [fulfillment: ResponseInterceptor, rejection: Interceptor<unknown>] {
    const notify = () => authManager.handleUnauthorizedError();

    // Intercepts successful unauthorized requests and notifies the auth manager
    const fulfillment: ResponseInterceptor = ({ request, response }) => {
      const isUnauthorized = !response.ok && response.status === StatusCode.UNAUTHORIZED;

      if (isUnauthorized) {
        notify();
      }

      return { request, response };
    };

    // Intercepts HTTPAuthorizationError errors and notifies the auth manager
    const rejection: Interceptor<unknown> = (payload) => {
      if (payload instanceof HTTPAuthorizationError) {
        notify();
      }

      return payload;
    };

    return [fulfillment, rejection];
  }
}
