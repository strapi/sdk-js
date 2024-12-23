import createDebug from 'debug';

import { StrapiSDKValidationError } from '../../errors';

import { AbstractAuthProvider } from './abstract';

const debug = createDebug('sdk:auth:provider:api-token');

const API_TOKEN_AUTH_STRATEGY_IDENTIFIER = 'api-token';

/**
 * Configuration options for API token authentication.
 */
export interface ApiTokenAuthProviderOptions {
  /**
   * This is the Strapi API token used for authenticating requests.
   *
   * It should be a non-empty string
   */
  token: string;
}

export class ApiTokenAuthProvider extends AbstractAuthProvider<ApiTokenAuthProviderOptions> {
  public static readonly identifier = API_TOKEN_AUTH_STRATEGY_IDENTIFIER;

  constructor(options: ApiTokenAuthProviderOptions) {
    super(options);
  }

  public get name() {
    return ApiTokenAuthProvider.identifier;
  }

  private get token(): string {
    return this._options.token;
  }

  preflightValidation(): void {
    debug('validating provider configuration');

    if ((typeof this.token as unknown) !== 'string' || this.token.trim().length === 0) {
      debug('invalid api token provided: %o (%o)', this.token, typeof this.token);

      throw new StrapiSDKValidationError(
        `A valid API token is required when using the api-token auth strategy. Got "${this.token}"`
      );
    }

    debug('provider configuration validated successfully');
  }

  authenticate(): Promise<void> {
    debug('no authentication step is required for the %o auth strategy, skipping', this.name);
    return Promise.resolve(); // does nothing
  }

  get headers() {
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }
}
