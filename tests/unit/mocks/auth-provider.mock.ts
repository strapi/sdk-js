import { AbstractAuthProvider } from '../../../src/auth';

export class MockAuthProvider extends AbstractAuthProvider<{ jwt: string }> {
  public static readonly identifier = 'mock-jwt';

  constructor() {
    super({ jwt: '<token>' });
  }

  authenticate(): Promise<void> {
    return Promise.resolve();
  }

  get headers(): Record<string, string> {
    return { Authorization: 'Bearer <token>' };
  }

  get name(): string {
    return MockAuthProvider.identifier;
  }

  protected preflightValidation(): void {
    // does nothing
  }
}
