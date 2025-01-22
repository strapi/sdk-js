import { StrapiError } from '../../../src';
import { AuthProviderFactory } from '../../../src/auth';
import { MockAuthProvider } from '../mocks';

describe('AuthProviderFactory', () => {
  let factory: AuthProviderFactory;

  beforeEach(() => {
    factory = new AuthProviderFactory();
  });

  it('should throw an error if an unregistered strategy is provided', () => {
    // Arrange
    const invalidStrategyName = '<unregisteredStrategy>';

    // Act & Assert
    expect(() => {
      factory.create(invalidStrategyName, {});
    }).toThrow(StrapiError);
  });

  it('should create a valid instance for registered providers', () => {
    // Arrange
    const mockCreator = jest.fn(() => new MockAuthProvider());

    // Act
    factory.register(MockAuthProvider.identifier, mockCreator);

    const provider = factory.create(MockAuthProvider.identifier, undefined);

    // Assert
    expect(provider).toBeDefined();
    expect(provider).toBeInstanceOf(MockAuthProvider);
  });
});
