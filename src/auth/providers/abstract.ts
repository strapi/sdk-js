import { HttpClient } from '../../http';

import type { AuthProvider } from './types';

/**
 * An abstract class that provides a foundational structure for implementing different authentication providers.
 *
 * It is designed to be extended by specific authentication strategies such as
 * API token or users-permissions based authentication.
 *
 * This class implements the {@link AuthProvider} interface, ensuring consistency across
 * authentication strategies in handling authentication processes and headers.
 *
 * @template T - The type of options that the specific authentication provider requires.
 *
 * @example
 * // Example of extending the AbstractAuthProvider
 * class MyAuthProvider extends AbstractAuthProvider<MyOptions> {
 *   constructor(options: MyOptions) {
 *     super(options);
 *   }
 *
 *   authenticate(): Promise<void> {
 *     // Implementation for authentication
 *   }
 *
 *   get headers() {
 *     return {
 *       Authorization: `Bearer ${this._options.token}`,
 *     };
 *   }
 * }
 *
 * @abstract
 */
export abstract class AbstractAuthProvider<T = unknown> implements AuthProvider {
  protected readonly _options: T;

  protected constructor(options: T) {
    this._options = options;

    // Validation
    this.preflightValidation();
  }

  /**
   * Conducts necessary preflight validation checks for the authentication provider.
   *
   * This method validates the options passed during the instantiation of the provider.
   *
   * It is called within the constructor to ensure that all required options adhere
   * to the expected format or values before proceeding with operational methods.
   *
   * @throws {StrapiValidationError} If the validation fails due to invalid or missing options.
   */
  protected abstract preflightValidation(): void;

  public abstract get name(): string;

  public abstract get headers(): Record<string, string>;

  public abstract authenticate(httpClient: HttpClient): Promise<void>;
}
