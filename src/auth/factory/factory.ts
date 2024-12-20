import createDebug from 'debug';

import { StrapiSDKError } from '../../errors';

import type { AuthProviderCreator, AuthProviderMap, CreateAuthProviderParams } from './types';
import type { AuthProvider } from '../providers';

const debug = createDebug('sdk:auth:factory');

/**
 * A factory class responsible for creating and managing authentication providers.
 *
 * It facilitates the registration and creation of different authentication
 * strategies which implement the AuthProvider interface.
 *
 * @template T_Providers Defines a map for authentication strategy names to their corresponding creator functions.
 */
export class AuthProviderFactory<T_Providers extends AuthProviderMap = {}> {
  private readonly _registry = new Map<StringKeysOf<T_Providers>, AuthProviderCreator>();

  /**
   * Creates an instance of an authentication provider based on the specified strategy.
   *
   * @param authStrategy The authentication strategy name to be used for creating the provider.
   * @param options Configuration options required to initialize the authentication provider.
   *
   * @returns An instance of an AuthProvider initialized with the given options.
   *
   * @throws {StrapiSDKError} Throws an error if the specified strategy is not registered in the factory.
   *
   * @example
   * ```typescript
   * const factory = new AuthProviderFactory();
   *
   * factory.register(
   *   'api-token',
   *   (options: ApiTokenAuthProviderOptions) => new ApiTokenAuthProvider(options)
   * );
   *
   * const provider = factory.create('api-token', { jwt: 'token' });
   * ```
   */
  create<T_Strategy extends StringKeysOf<T_Providers> | string>(
    authStrategy: T_Strategy,
    options: CreateAuthProviderParams<T_Providers, T_Strategy>
  ): AuthProvider {
    const creator = this._registry.get(authStrategy);

    if (!creator) {
      debug('the %o auth strategy is not registered, skipping', authStrategy);
      throw new StrapiSDKError(`Auth strategy "${authStrategy}" is not supported.`);
    }

    const instance = creator(options);

    debug('successfully instantiated a new %o provider', authStrategy);

    return instance;
  }

  /**
   * Registers a new authentication strategy with the factory.
   *
   * @param strategy The name of the authentication strategy to register.
   * @param creator A function that creates an instance of an authentication provider for the specified strategy.
   *
   * @returns The instance of AuthProviderFactory, for chaining purpose.
   *
   * @example
   * ```typescript
   * const factory = new AuthProviderFactory();
   *
   * factory
   *  .register(
   *    'api-token',
   *    (options: ApiTokenAuthProviderOptions) => new ApiTokenAuthProvider(options)
   *  )
   *  .register(
   *    'users-permissions',
   *    (options: UsersPermissionsAuthProviderOptions) => new UsersPermissionsAuthProvider(options)
   *  );
   * ```
   */
  register<T_Strategy extends string, T_Creator extends AuthProviderCreator>(
    strategy: T_Strategy,
    creator: T_Creator
  ) {
    this._registry.set(strategy, creator);

    debug('registered a new auth strategy: %o', strategy);

    return this as AuthProviderFactory<T_Providers & { [key in T_Strategy]: typeof creator }>;
  }
}
