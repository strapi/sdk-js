import { StrapiSDKError, StrapiSDKValidationError } from '../../errors';
import { HttpClient } from '../../http';

import { AbstractAuthProvider } from './abstract';

const USERS_PERMISSIONS_AUTH_STRATEGY_IDENTIFIER = 'users-permissions';

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

  private get credentials(): UsersPermissionsAuthPayload {
    return {
      identifier: this._options.identifier,
      password: this._options.password,
    };
  }

  preflightValidation() {
    if (
      this._options === undefined ||
      this._options === null ||
      typeof this._options !== 'object'
    ) {
      throw new StrapiSDKValidationError(
        'Missing valid options for initializing the Users & Permissions auth provider.'
      );
    }

    const { identifier, password } = this._options;

    if ((typeof identifier as unknown) !== 'string') {
      throw new StrapiSDKValidationError(
        `The "identifier" option must be a string, but got "${typeof identifier}"`
      );
    }

    if ((typeof password as unknown) !== 'string') {
      throw new StrapiSDKValidationError(
        `The "password" option must be a string, but got "${typeof password}"`
      );
    }
  }

  get headers(): Record<string, string> {
    if (this._token === null) {
      return {};
    }

    return { Authorization: `Bearer ${this._token}` };
  }

  async authenticate(httpClient: HttpClient): Promise<void> {
    try {
      const { baseURL } = httpClient;
      const localAuthURL = `${baseURL}/auth/local`;

      const request = new Request(localAuthURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.credentials),
      });

      // Make sure to use the HttpClient's "_fetch" method to not perform authentication in an infinite loop.
      const response = await httpClient._fetch(request);

      if (!response.ok) {
        // TODO: use dedicated exceptions
        throw new Error(response.statusText);
      }

      const data = await response.json();
      this._token = data.jwt;
    } catch (error) {
      // TODO: use dedicated exceptions
      throw new StrapiSDKError(error, 'Failed to authenticate with Strapi server.');
    }
  }
}
