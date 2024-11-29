import { HttpClient } from '../../../src/http';
import { MockAuthManager, MockAuthProvider, MockURLValidator } from '../mocks';

describe('HttpClient', () => {
  let mockAuthManager: MockAuthManager;
  let mockURLValidator: MockURLValidator;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    mockAuthManager = new MockAuthManager();
    mockURLValidator = new MockURLValidator();

    fetchSpy = jest.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
        })
      )
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should validate baseURL in constructor', () => {
    // Arrange & Act
    const spy = jest.spyOn(mockURLValidator, 'validate');
    const httpClient = new HttpClient('https://example.com', mockAuthManager, mockURLValidator);

    // Assert
    expect(httpClient).toBeInstanceOf(HttpClient);
    expect(spy).toHaveBeenCalledWith('https://example.com');
  });

  it('setBaseURL should validate and update baseURL', () => {
    // Arrange
    const baseURL = 'https://example.com';
    const newBaseURL = 'https://newurl.com';

    const spy = jest.spyOn(mockURLValidator, 'validate');

    const httpClient = new HttpClient(baseURL, mockAuthManager, mockURLValidator);

    // Act
    httpClient.setBaseURL(newBaseURL);

    // Assert
    expect(spy).toHaveBeenCalledWith(newBaseURL);
    expect(httpClient.baseURL).toBe(newBaseURL);
  });

  it('setAuthStrategy should configure the authentication strategy', () => {
    // Arrange
    const strategy = MockAuthProvider.identifier;
    const strategyOptions = {};

    const spy = jest.spyOn(mockAuthManager, 'setStrategy');

    const httpClient = new HttpClient('https://example.com', mockAuthManager, mockURLValidator);

    // Act
    httpClient.setAuthStrategy(MockAuthProvider.identifier, {});

    // Assert
    expect(spy).toHaveBeenCalledWith(strategy, strategyOptions);
    expect(mockAuthManager.strategy).toBe(strategy);
  });

  it('should try to authenticate before making a request if not already authenticated', async () => {
    // Arrange
    const authenticateSpy = jest.spyOn(mockAuthManager, 'authenticate');

    const httpClient = new HttpClient('https://example.com', mockAuthManager, mockURLValidator);
    httpClient.setAuthStrategy(MockAuthProvider.identifier, {});

    // Act
    await httpClient.fetch('/');

    // Assert
    expect(authenticateSpy).toHaveBeenCalled();
  });

  it('fetch should add auth headers to the http request if authenticated', async () => {
    // Arrange
    const authenticateRequestSpy = jest.spyOn(mockAuthManager, 'authenticateRequest');

    const httpClient = new HttpClient('https://example.com', mockAuthManager, mockURLValidator);
    httpClient.setAuthStrategy(MockAuthProvider.identifier, {});

    // Act
    await httpClient.fetch('/');

    const authorizationHeader = authenticateRequestSpy.mock.lastCall
      ?.at(0)
      ?.headers.get('Authorization');

    // Assert
    expect(authenticateRequestSpy).toHaveBeenCalled();
    expect(authorizationHeader).toBe('Bearer <token>');
  });

  it('fetch should add an application/json Content-Type header to each request', async () => {
    // Arrange
    const httpClient = new HttpClient('https://example.com', mockAuthManager, mockURLValidator);

    // Act
    await httpClient.fetch('/');

    const contentTypeHeader = fetchSpy.mock.lastCall?.at(0)?.headers.get('Content-Type');

    // Assert
    expect(contentTypeHeader).toBe('application/json');
  });

  it('fetch should not add auth headers to the http request if not authenticated', async () => {
    // Arrange
    const authenticateRequestSpy = jest.spyOn(mockAuthManager, 'authenticateRequest');

    const httpClient = new HttpClient('https://example.com', mockAuthManager, mockURLValidator);

    // Act
    await httpClient.fetch('/');

    const authorizationHeader = fetchSpy.mock.lastCall?.at(0)?.headers.get('Authorization');

    // Assert
    expect(authenticateRequestSpy).toHaveBeenCalled();
    expect(authorizationHeader).toBeNull();
  });

  it('fetch should forward valid responses', async () => {
    // Arrange
    const payload = { ok: true };

    fetchSpy.mockImplementationOnce(() => {
      return Promise.resolve(new Response(JSON.stringify(payload), { status: 200 }));
    });

    const httpClient = new HttpClient('https://example.com', mockAuthManager, mockURLValidator);
    httpClient.setAuthStrategy(MockAuthProvider.identifier, {});

    // Act
    const response = await httpClient.fetch('/');

    // Assert
    expect(mockAuthManager.isAuthenticated).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith(expect.any(Request), undefined);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(payload);
  });

  it('fetch should handle 401 unauthorized responses', async () => {
    // Arrange
    const handleUnauthorizedErrorSpy = jest.spyOn(mockAuthManager, 'handleUnauthorizedError');

    fetchSpy.mockImplementationOnce(() => {
      return Promise.resolve(new Response('Unauthorized', { status: 401 }));
    });

    const httpClient = new HttpClient('https://example.com', mockAuthManager, mockURLValidator);
    httpClient.setAuthStrategy(MockAuthProvider.identifier, {});

    // Act
    const response = await httpClient.fetch('/');

    // Assert
    expect(handleUnauthorizedErrorSpy).toHaveBeenCalled();
    expect(mockAuthManager.isAuthenticated).toBe(false);
    expect(fetchSpy).toHaveBeenCalledWith(expect.any(Request), undefined);
    expect(response.status).toBe(401);
  });
});
