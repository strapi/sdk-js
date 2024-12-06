import type { HttpClient } from '../../http';

/**
 * Provides an interface for implementing various authentication providers, allowing integration
 * of different authentication schemes in a consistent manner.
 *
 * It enables setting custom headers required by authentication schemes.
 *
 * @example
 * const authProvider = new MyAuthProvider('my-secret-token');
 *
 * authProvider.authenticate();
 *
 * console.log(authProvider.headers); // Retrieves auth headers to attach them to requests
 */
export interface AuthProvider {
  /**
   * The identifying name of the authentication provider.
   *
   * This can be used for differentiating between multiple auth strategies.
   */
  get name(): string;

  /**
   * Object containing the headers that should be included in requests authenticated by this provider.
   *
   * Typically, these headers include tokens or keys required by the auth scheme.
   */
  get headers(): Record<string, string>;

  /**
   * Authenticates by executing any required authentication steps such as
   * fetching tokens or setting the necessary state for future requests.
   *
   * @param httpClient - The {@link HttpClient} instance used to perform the necessary HTTP requests to authenticate
   *
   * @returns A promise that resolves when the authentication process has completed.
   *
   * @throws {Error} If an error occurs that prevents successful authentication.
   */
  authenticate(httpClient: HttpClient): Promise<void>;
}
