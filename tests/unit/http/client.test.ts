import { HttpClient } from '../../../src/http';
import { HTTP_ERROR_ASSOCIATIONS } from '../../fixtures/http-error-associations';
import { MockHttpClient, MockURLValidator } from '../mocks';

import type { RequestInterceptor, ResponseInterceptor } from '../../../src/http';

describe('HttpClient', () => {
  let mockURLValidator: MockURLValidator;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    mockURLValidator = new MockURLValidator();

    fetchSpy = jest
      // Mock the global fetch implementation since this is testing the HTTP client capabilities
      .spyOn(globalThis, 'fetch')
      .mockImplementation(() => {
        return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should validate baseURL in constructor', () => {
      // Arrange & Act
      const spy = jest.spyOn(mockURLValidator, 'validate');
      const httpClient = new HttpClient({ baseURL: 'https://example.com' }, mockURLValidator);

      // Assert
      expect(httpClient).toBeInstanceOf(HttpClient);
      expect(spy).toHaveBeenCalledWith('https://example.com');
    });

    it('should format the baseURL in constructor', () => {
      // Arrange & Act
      const httpClient = new HttpClient({ baseURL: 'https://example.com/' }, mockURLValidator);

      // Assert
      expect(httpClient).toBeInstanceOf(HttpClient);
      expect(httpClient).toHaveProperty('baseURL', 'https://example.com');
    });
  });

  describe('setBaseURL', () => {
    it('should validate and update baseURL', () => {
      // Arrange
      const baseURL = 'https://example.com';
      const newBaseURL = 'https://newurl.com';

      const spy = jest.spyOn(mockURLValidator, 'validate');

      const httpClient = new HttpClient({ baseURL }, mockURLValidator);

      // Act
      httpClient.setBaseURL(newBaseURL);

      // Assert
      expect(spy).toHaveBeenCalledWith(newBaseURL);
      expect(httpClient.baseURL).toBe(newBaseURL);
    });

    it('should format and update baseURL', () => {
      // Arrange
      const baseURL = 'https://example.com';
      const newBaseURL = 'https://newurl.com/';

      const httpClient = new HttpClient({ baseURL }, mockURLValidator);

      // Act
      httpClient.setBaseURL(newBaseURL);

      // Assert
      expect(httpClient.baseURL).toBe('https://newurl.com');
    });
  });

  describe('setTimeout', () => {
    it('should set the request timeout', () => {
      // Arrange
      const timeout = 500;
      const httpClient = new HttpClient({ baseURL: 'https://example.com' }, mockURLValidator);

      // Act
      httpClient.setTimeout(timeout);

      // Assert
      expect(httpClient).toHaveProperty('timeout', timeout);
    });

    it.each(['foo', 4.2, true, {}, [], null, undefined])(
      'should throw on invalid timeout: %s',
      (timeout: unknown) => {
        // Arrange
        const httpClient = new HttpClient({ baseURL: 'https://example.com' }, mockURLValidator);

        // Act & Assert
        // @ts-expect-error the given timeout is purposefully invalid
        expect(() => httpClient.setTimeout(timeout)).toThrow(
          new TypeError('Timeout must be a safe integer')
        );
      }
    );
  });

  describe('CRUD Shorthands', () => {
    const methods = ['get', 'post', 'put', 'delete'] as const;

    it.each(methods)(
      'should forward the %s request to the base request with the correct method and config',
      async (method) => {
        // Arrange
        const httpClient = new HttpClient({ baseURL: 'https://example.com' }, mockURLValidator);

        const requestSpy = jest.spyOn(HttpClient.prototype, 'request');

        // Assert
        await httpClient[method]('/');

        expect(requestSpy).toHaveBeenCalledWith(
          '/',
          expect.objectContaining({ method: method.toUpperCase() })
        );
      }
    );

    it.each(['get', 'delete'] as const)(
      'should forward the given configuration for %s',
      async (method) => {
        // Arrange
        const headers = { 'Content-Type': 'application/json' };
        const httpClient = new HttpClient({ baseURL: 'https://example.com' }, mockURLValidator);

        const requestSpy = jest.spyOn(HttpClient.prototype, 'request');

        // Assert
        await httpClient[method]('/', { headers });

        expect(requestSpy).toHaveBeenCalledWith(
          '/',
          expect.objectContaining({ method: method.toUpperCase(), headers })
        );
      }
    );

    it.each(['post', 'put'] as const)(
      'should forward the given configuration for %s',
      async (method) => {
        // Arrange
        const headers = { 'Content-Type': 'application/json' };
        const body = JSON.stringify({ payload: 'foobar' });
        const httpClient = new HttpClient({ baseURL: 'https://example.com' }, mockURLValidator);

        const requestSpy = jest.spyOn(HttpClient.prototype, 'request');

        // Assert
        await httpClient[method]('/', body, { headers });

        expect(requestSpy).toHaveBeenCalledWith(
          '/',
          expect.objectContaining({ method: method.toUpperCase(), body, headers })
        );
      }
    );
  });

  it('fetch should forward valid responses', async () => {
    // Arrange
    const payload = { ok: true };

    fetchSpy.mockImplementationOnce(() => {
      return Promise.resolve(new Response(JSON.stringify(payload), { status: 200 }));
    });

    const httpClient = new HttpClient({ baseURL: 'https://example.com' }, mockURLValidator);

    // Act
    const response = await httpClient.request('/');

    // Assert
    await expect(response.json()).resolves.toEqual(payload);
  });

  describe('Map Response To HTTP Error', () => {
    const payload = JSON.stringify({ ok: false });

    it.each(HTTP_ERROR_ASSOCIATIONS)(
      'should map the response status to the correct exception',
      (context, errorClass) => {
        // Arrange
        const request = new Request('https://example.com/resource', { method: 'GET' });
        const response = new Response(payload, context);

        // Act
        const error = HttpClient.mapResponseToHTTPError(response, request);

        // Assert
        expect(error).toBeInstanceOf(errorClass);
        expect(error.message).toBe(
          `Request failed with status code ${context.status} ${context.statusText}: GET https://example.com/resource`
        );
        expect(error.response).toBe(response);
        expect(error.request).toBe(request);
      }
    );
  });

  describe('Create', () => {
    const baseURL = 'https://example.com';
    const timeout = 5000;

    it('should create a copy of the existing http client and preserve its config', () => {
      // Arrange
      const httpClient = new HttpClient({ baseURL, timeout }, mockURLValidator);

      // Act
      const fork = httpClient.create();

      // Assert
      expect(fork).toBeInstanceOf(HttpClient);
      expect(fork).not.toBe(httpClient);
      expect(fork).toHaveProperty('baseURL', baseURL);
      expect(fork).toHaveProperty('timeout', httpClient.timeout);
    });

    it('should not mutate the original object when updating properties in the fork', () => {
      // Arrange
      const httpClient = new HttpClient({ baseURL, timeout }, mockURLValidator);

      const newURL = 'https://newurl.com';
      const newTimeout = 1000;

      // Act
      const fork = httpClient.create();

      fork.setTimeout(1000);
      fork.setBaseURL(newURL);

      // Assert
      expect(fork).toBeInstanceOf(HttpClient);
      expect(fork).not.toBe(httpClient);

      expect(fork).toHaveProperty('baseURL', newURL);
      expect(fork).toHaveProperty('timeout', newTimeout);

      expect(httpClient).toHaveProperty('baseURL', baseURL);
      expect(httpClient).toHaveProperty('timeout', timeout);
    });

    it.each([
      ['baseURL', 'https://newurl.com'],
      ['timeout', 1000],
      ['headers', { 'Content-Type': 'application/json' }],
    ] as const)(
      'should override the %s property when specified in the params',
      (property, value) => {
        // Arrange
        const httpClient = new HttpClient({ baseURL, timeout }, mockURLValidator);

        // Act
        const fork = httpClient.create({ [property]: value });

        // Assert
        expect(fork).toBeInstanceOf(HttpClient);
        expect(fork).not.toBe(httpClient);

        expect(fork).toHaveProperty(property, value);
      }
    );

    it('should inherit the interceptors if specified', () => {
      // Arrange
      const request = new Request('https://example.com/resource', { method: 'GET' });
      const response = new Response(JSON.stringify({ ok: true }), { status: 200 });

      const requestInterceptor: RequestInterceptor = jest.fn();
      const responseInterceptor: ResponseInterceptor = jest.fn();

      const httpClient = new HttpClient({ baseURL, timeout }, mockURLValidator);

      httpClient.interceptors.request.use(requestInterceptor);
      httpClient.interceptors.response.use(responseInterceptor);

      // Act
      const fork = httpClient.create(undefined, true);

      fork.interceptors.request.execute({ request });
      fork.interceptors.response.execute({ request, response });

      // Assert
      expect(fork).toBeInstanceOf(HttpClient);
      expect(fork).not.toBe(httpClient);

      expect(requestInterceptor).toHaveBeenCalledWith({ request });
      expect(responseInterceptor).toHaveBeenCalledWith({ request, response });
    });

    it('should not inherit the interceptors if specified', () => {
      // Arrange
      const request = new Request('https://someothersite.com/resource', { method: 'GET' });
      const response = new Response(JSON.stringify({ ok: false }), { status: 400 });

      const requestInterceptor: RequestInterceptor = jest.fn();
      const responseInterceptor: ResponseInterceptor = jest.fn();

      const httpClient = new HttpClient({ baseURL, timeout }, mockURLValidator);

      httpClient.interceptors.request.use(requestInterceptor);
      httpClient.interceptors.response.use(responseInterceptor);

      // Act
      const fork = httpClient.create(undefined, false);

      fork.interceptors.request.execute({ request });
      fork.interceptors.response.execute({ request, response });

      // Assert
      expect(fork).toBeInstanceOf(HttpClient);
      expect(fork).not.toBe(httpClient);

      expect(requestInterceptor).not.toHaveBeenCalledWith({ request });
      expect(responseInterceptor).not.toHaveBeenCalledWith({ request, response });
    });

    it('should use the same constructor as the current instance', () => {
      // Arrange
      const instance = new MockHttpClient({ baseURL, timeout }, mockURLValidator);

      // Act
      const fork = instance.create();

      // Assert
      expect(fork).toBeInstanceOf(MockHttpClient);
      expect(fork).toBeInstanceOf(HttpClient);

      expect(fork.constructor).toBe(instance.constructor);
    });

    it('should throw on invalid base instance', () => {
      // Arrange

      // Simulates a failure case where the base prototype is manipulated or replaced
      jest.spyOn(Object, 'getPrototypeOf').mockReturnValueOnce(Date.prototype);

      const instance = new HttpClient({ baseURL, timeout }, mockURLValidator);

      // Act & Assert
      expect(() => instance.create()).toThrow(
        new Error('The created instance is not an instance of HttpClient')
      );
    });

    it('should correctly retrieve prototype when creating a new instance', () => {
      // Arrange
      const httpClient = new HttpClient({ baseURL, timeout }, mockURLValidator);

      // Spy on Object.getPrototypeOf
      const getPrototypeOfSpy = jest.spyOn(Object, 'getPrototypeOf');

      // Act
      httpClient.create();

      // Assert
      expect(getPrototypeOfSpy).toHaveBeenCalledWith(httpClient);
    });
  });

  describe('Request', () => {
    const baseURL = 'https://example.com';
    const timeout = 5000;
    const headers = { 'Content-Type': 'application/json' };

    let client: HttpClient;
    let fetchSpy: jest.SpyInstance<
      Promise<Response>,
      [input: RequestInfo | URL, init?: RequestInit | undefined]
    >;

    beforeEach(() => {
      fetchSpy = jest.spyOn(globalThis, 'fetch');
      client = new HttpClient({ baseURL, timeout, headers });
    });

    it('should make a GET request to the correct URL', async () => {
      // Arrange
      const mockResponse = new Response('{"message":"success"}', { status: 200 });
      const expectedURL = `${baseURL}/test`;

      fetchSpy.mockResolvedValue(mockResponse);

      // Act
      const response = await client.request('/test', { method: 'GET' });

      // Assert
      expect(fetchSpy).toHaveBeenCalled();
      expect(response).toBe(mockResponse);

      const [request] = fetchSpy.mock.lastCall ?? [];

      expect(request).toBeInstanceOf(Request);
      expect(request).toHaveProperty('url', expectedURL);
      expect(request).toHaveProperty('method', 'GET');
    });

    it('should process request and response interceptors', async () => {
      // Arrange
      fetchSpy.mockResolvedValue(new Response('{"message":"response"}', { status: 200 }));

      const requestInterceptor: RequestInterceptor = jest.fn(({ request }) => {
        request.headers.set('X-Request-Interceptor', 'Intercepted');

        return { request };
      });

      const responseInterceptor: ResponseInterceptor = jest.fn(({ response, request }) => {
        const newResponse = new Response('{"message":"modified response"}', {
          status: response.status,
          headers: response.headers,
        });

        return { response: newResponse, request };
      });

      client.interceptors.request.use(requestInterceptor);
      client.interceptors.response.use(responseInterceptor);

      // Act
      const response = await client.request('/test', {});
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseBody).toEqual({ message: 'modified response' });

      expect(requestInterceptor).toHaveBeenCalled();
      expect(responseInterceptor).toHaveBeenCalled();
    });

    it.each(['/path', 'path', '///path'])(
      'should handle different paths format: %s',
      async (path) => {
        // Arrange
        fetchSpy.mockResolvedValue(new Response('{"message":"success"}', { status: 200 }));
        const expectedURL = `${baseURL}/path`;

        // Act
        await client.request(path);

        // Assert
        expect(fetchSpy).toHaveBeenCalled();

        const [request] = fetchSpy.mock.lastCall ?? [];

        expect(request).toBeInstanceOf(Request);
        expect(request).toHaveProperty('url', expectedURL);
      }
    );

    test('should abort the request if it exceeds the specified timeout', async () => {
      // Arrange
      const baseURL = 'https://example.com';
      const timeout = 0;
      const httpClient = new HttpClient({ baseURL, timeout }, mockURLValidator);

      jest.spyOn(globalThis, 'setTimeout');
      jest.spyOn(AbortController.prototype, 'abort');

      jest.spyOn(globalThis, 'fetch').mockImplementationOnce((input, init) => {
        const request = input instanceof Request ? input : init;

        if (!request?.signal) {
          // Make the test fail by resolving with a response in case no signal is defined in the request
          return Promise.resolve(new Response());
        }

        const { signal } = request;

        return new Promise((resolve, reject) => {
          // Make sure the test is not waiting to time out to fail
          // If it waited for more than 0 ms (the timeout set), it failed already
          const failSafeID = setTimeout(() => resolve(new Response()), 50);

          signal.addEventListener('abort', () => {
            clearTimeout(failSafeID);
            reject(signal.reason);
          });
        });
      });

      // Act & Assert
      await expect(() => httpClient.request('/slow-resource')).rejects.toThrow();

      expect(AbortController.prototype.abort).toHaveBeenCalled();
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), timeout);
    });
  });
});
