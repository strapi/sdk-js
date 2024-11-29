import { HttpClient } from '../../../src/http';

import { MockAuthManager } from './auth-manager.mock';
import { MockAuthProviderFactory } from './auth-provider-factory.mock';
import { MockURLValidator } from './url-validator.mock';

import type { AuthManager } from '../../../src/auth';
import type { URLValidator } from '../../../src/validators';

export class MockHttpClient extends HttpClient {
  constructor(
    baseURL: string,
    authManager: AuthManager = new MockAuthManager(new MockAuthProviderFactory()),
    urlValidator: URLValidator = new MockURLValidator()
  ) {
    super(baseURL, authManager, urlValidator);
  }

  fetch() {
    return this._fetch();
  }

  _fetch() {
    return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  }
}
