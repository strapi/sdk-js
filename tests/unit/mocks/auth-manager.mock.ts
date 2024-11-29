import { AuthManager, AuthProviderFactory } from '../../../src/auth';

import { MockAuthProviderFactory } from './auth-provider-factory.mock';

export class MockAuthManager extends AuthManager {
  constructor(authProviderFactory: AuthProviderFactory = new MockAuthProviderFactory()) {
    super(authProviderFactory);
  }

  registerDefaultProviders() {
    // does nothing
  }
}
