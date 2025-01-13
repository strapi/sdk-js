import createDebug from 'debug';

import { StrapiValidationError } from '../../errors';
import { HttpClient } from '../../http';

import { AbstractAuthProvider } from './abstract';

const debug = createDebug('strapi:auth:provider:users-permissions');

const USERS_PERMISSIONS_AUTH_STRATEGY_IDENTIFIER = 'users-permissions';
const LOCAL_AUTH_ENDPOINT = '/auth/local';

/**
 * Configuration options for Users & Permissions authentication.
 */
export interface UsersPermissionsAuthProviderOptions {
  /**
   * The unique user identifier used for authentication.
   */
  identifier: string;

  /**
   * The secret passphrase associated with the user's identifier
   */
  password: string;
}

/**
 * Payload required for the Users & Permissions authentication process.
 */
export type UsersPermissionsAuthPayload = Pick<
  UsersPermissionsAuthProviderOptions,
  'identifier' | 'password'
>;

/**
 * @experimental
 * Authentication through users and permissions is experimental for the MVP of
 * the Strapi SDK.
 */
export class UsersPermissionsAuthProvider extends AbstractAuthProvider<UsersPermissionsAuthProviderOptions> {
  public static readonly identifier = USERS_PERMISSIONS_AUTH_STRATEGY_IDENTIFIER;

  private _token: string | null = null;

  constructor(options: UsersPermissionsAuthProviderOptions) {
    super(options);
  }

  public get name() {
    return UsersPermissionsAuthProvider.identifier;
  }

  private get _credentials(): UsersPermissionsAuthPayload {
    return {
      identifier: this._options.identifier,
      password: this._options.password,
    };
  }

  preflightValidation() {
    debug('validating provider configuration');

    if (
      this._options === undefined ||
      this._options === null ||
      typeof this._options !== 'object'
    ) {
      debug('invalid options provided: %s (%s)', this._options, typeof this._options);

      throw new StrapiValidationError(
        'Missing valid options for initializing the Users & Permissions auth provider.'
      );
    }

    const { identifier, password } = this._options;

    if ((typeof identifier as unknown) !== 'string') {
      debug('invalid identifier provided: %s (%s)', identifier, typeof identifier);

      throw new StrapiValidationError(
        `The "identifier" option must be a string, but got "${typeof identifier}"`
      );
    }

    if ((typeof password as unknown) !== 'string') {
      debug('invalid password provided: %s (%s)', password, typeof password);

      throw new StrapiValidationError(
        `The "password" option must be a string, but got "${typeof password}"`
      );
    }

    debug('provider configuration validated successfully');
  }

  get headers(): Record<string, string> {
    if (this._token === null) {
      return {};
    }

    return { Authorization: `Bearer ${this._token}` };
  }

  async authenticate(httpClient: HttpClient): Promise<void> {
    const { identifier, password } = this._credentials;

    debug(
      'trying to authenticate with %o as %o at %o ',
      this.name,
      identifier,
      LOCAL_AUTH_ENDPOINT
    );

    const response = await httpClient.post(
      LOCAL_AUTH_ENDPOINT,
      JSON.stringify({ identifier, password }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();

    const obfuscatedToken = data.jwt.slice(0, 5) + '...' + data.jwt.slice(-5);
    debug('authentication successful for %o (%o)', identifier, obfuscatedToken);

    this._token = data.jwt;
  }
}
