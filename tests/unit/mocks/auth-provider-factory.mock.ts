import { AuthProviderFactory } from '../../../src/auth';

import { MockAuthProvider } from './auth-provider.mock';

export class MockAuthProviderFactory extends AuthProviderFactory {
  constructor() {
    super();

    this.register(MockAuthProvider.identifier, () => new MockAuthProvider());
  }
}
