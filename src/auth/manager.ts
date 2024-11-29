import { HttpClient } from '../http';

import { AuthProviderFactory } from './factory';
import { ApiTokenAuthProvider, UsersPermissionsAuthProvider } from './providers';

import type {
  ApiTokenAuthProviderOptions,
  AuthProvider,
  UsersPermissionsAuthProviderOptions,
} from './providers';

/**
 * Manages authentication by using different authentication providers and strategies.
 *
 * Responsible for the registration and management of multiple authentication strategies.
 *
 * It allows for setting the current strategy, authenticating requests, and tracking authentication status.
 */
export class AuthManager {
  protected readonly _authProviderFactory: AuthProviderFactory;

  protected _authProvider?: AuthProvider;
  protected _isAuthenticated: boolean = false;

  constructor(
    // Dependencies
    authProviderFactory: AuthProviderFactory = new AuthProviderFactory()
  ) {
    // Initialization
    this._authProviderFactory = authProviderFactory;

    // Setup
    this.registerDefaultProviders();
  }

  /**
   * Retrieves the strategy name of the currently active authentication provider.
   *
   * @returns The name of the current authentication strategy, or undefined if no provider is set.
   */
  get strategy(): string | undefined {
    return this._authProvider?.name;
  }

  /**
   * Checks if the last authentication was successful and if the current provider can authenticate HTTP requests.
   *
   * @returns A boolean indicating whether the user is currently authenticated.
   */
  get isAuthenticated() {
    return this._isAuthenticated;
  }

  /**
   * Resets the authentication status to unauthenticated when an unauthorized error is encountered.
   *
   * @example
   * ```typescript
   * authManager.handleUnauthorizedError();
   *
   * console.log(authManager.isAuthenticated); // false
   * ```
   */
  handleUnauthorizedError() {
    this._isAuthenticated = false;
  }

  /**
   * Sets the current authentication strategy with configuration options.
   *
   * @param strategy - The name of the authentication strategy to be set.
   * @param options - Configuration options required to initialize the strategy.
   *
   * @example
   * ```typescript
   * authManager.setStrategy('api-token', { jwt: 'my-token' });
   * ```
   */
  setStrategy(strategy: string, options: unknown) {
    this._authProvider = this._authProviderFactory.create(strategy, options);
  }

  /**
   * Performs authentication by using the current authentication provider.
   *
   * @param http - The HttpClient instance that can be used for the authentication process.
   *
   * @returns A promise that resolves when the authentication process is complete.
   *
   * @example
   * ```typescript
   * await authManager.authenticate(httpClient);
   *
   * console.log(authManager.isAuthenticated); // true or false depending on success
   * ```
   */
  async authenticate(http: HttpClient) {
    if (this._authProvider === undefined) {
      this._isAuthenticated = false;

      return;
    }

    try {
      await this._authProvider.authenticate(http);

      this._isAuthenticated = true;
    } catch {
      this._isAuthenticated = false;
    }
  }

  /**
   * Adds authentication headers to an HTTP request using the current authentication provider.
   *
   * @param request - The HTTP request to which authentication headers are added.
   *
   * @example
   * ```typescript
   * const request = new Request('https://api.example.com/data');
   *
   * authManager.authenticateRequest(request);
   *
   * console.log(request.headers.get('Authorization')) // 'Bearer <token>'
   * ```
   */
  authenticateRequest(request: Request) {
    if (this._authProvider) {
      const { headers } = this._authProvider;

      for (const [key, value] of Object.entries(headers)) {
        request.headers.set(key, value);
      }
    }
  }

  /**
   * Registers the SDK default authentication providers in the factory so that they can be later selected.
   *
   * The default authentication providers are:
   * - API Token ({@link ApiTokenAuthProvider})
   * - Users Permissions ({@link UsersPermissionsAuthProvider})
   *
   * @note This method is called internally during initialization to set up the available strategies.
   */
  protected registerDefaultProviders() {
    this._authProviderFactory
      // API Token
      .register(
        ApiTokenAuthProvider.identifier,
        (options: ApiTokenAuthProviderOptions) => new ApiTokenAuthProvider(options)
      )
      // Users and Permissions
      .register(
        UsersPermissionsAuthProvider.identifier,
        (options: UsersPermissionsAuthProviderOptions) => new UsersPermissionsAuthProvider(options)
      );
  }
}
