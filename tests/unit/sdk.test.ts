import { StrapiSDKInitializationError } from '../../src/errors';
import { StrapiSDK, appendQueryParams } from '../../src/sdk';
import { StrapiSDKValidator, URLValidator } from '../../src/validators';

import { MockAuthProvider, MockHttpClient, MockStrapiSDKValidator } from './mocks';

import type { StrapiSDKConfig } from '../../src/sdk';
import type { BaseQueryParams } from '../../src/types/content-api';

/**
 * Class representing a FlakyURLValidator which extends URLValidator.
 *
 * This validator is designed to throw an error unexpectedly upon validation and should only be used in test suites.
 */
class FlakyURLValidator extends URLValidator {
  validate() {
    throw new Error('Unexpected error');
  }
}

describe('StrapiSDK', () => {
  const mockHttpClientFactory = (url: string) => new MockHttpClient(url);

  beforeEach(() => {
    jest
      .spyOn(MockHttpClient.prototype, '_fetch')
      .mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ data: { id: 1 }, meta: {} }), { status: 200 })
        )
      );
  });

  describe('Initialization', () => {
    it('should initialize with valid config', () => {
      // Arrange
      const config = {
        baseURL: 'http://localhost:1337',
        auth: { strategy: MockAuthProvider.identifier, options: {} },
      };

      const mockValidator = new MockStrapiSDKValidator();

      const sdkValidatorSpy = jest.spyOn(mockValidator, 'validateConfig');
      const httpSetAuthStrategySpy = jest.spyOn(MockHttpClient.prototype, 'setAuthStrategy');

      // Act
      const sdk = new StrapiSDK(config, mockValidator, mockHttpClientFactory);

      // Assert

      // instance
      expect(sdk).toBeInstanceOf(StrapiSDK);
      // internal Validation
      expect(sdkValidatorSpy).toHaveBeenCalledWith(config);
      // internal setup
      expect(httpSetAuthStrategySpy).toHaveBeenCalledWith(MockAuthProvider.identifier, {});
    });

    it('should throw an error on invalid baseURL', () => {
      // Arrange
      const config = { baseURL: 'invalid-url' };

      const mockValidator = new MockStrapiSDKValidator();

      const validateConfigSpy = jest.spyOn(mockValidator, 'validateConfig');

      // Act & Assert
      expect(() => new StrapiSDK(config, mockValidator)).toThrow(StrapiSDKInitializationError);
      expect(validateConfigSpy).toHaveBeenCalledWith(config);
    });

    it('should fail to create and SDK instance if there is an unexpected error', () => {
      // Arrange
      let sdk!: StrapiSDK;

      const baseURL = 'http://example.com';
      const config: StrapiSDKConfig = { baseURL };
      const expectedError = new StrapiSDKInitializationError(new Error('Unexpected error'));

      const validateSpy = jest.spyOn(FlakyURLValidator.prototype, 'validate');

      // Act
      const createSDK = () => {
        sdk = new StrapiSDK(config, new StrapiSDKValidator(new FlakyURLValidator()));
      };

      // Assert
      expect(createSDK).toThrow(expectedError);

      expect(sdk).toBeUndefined();

      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(validateSpy).toHaveBeenCalledWith(baseURL);
    });

    it('should initialize correctly with the default validator', () => {
      // Arrange
      const sdk = new StrapiSDK({ baseURL: 'http://localhost:1337' });

      // Act & Assert
      expect(sdk).toBeInstanceOf(StrapiSDK);
    });
  });

  // todo implement validation capabilities for providers (e.g. checks if the provided auth strategy exists before trying to create a provider instance)
  it.todo('should throw an error on invalid auth configuration');

  it('should fetch data correctly with fetch method', async () => {
    // Arrange
    const config = { baseURL: 'http://localhost:1337' };

    const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');

    const mockValidator = new MockStrapiSDKValidator();
    const sdk = new StrapiSDK(config, mockValidator, mockHttpClientFactory);

    // Act
    const response = await sdk.fetch('/data');

    // Assert
    expect(fetchSpy).toHaveBeenCalledWith('/data', undefined);
    await expect(response.json()).resolves.toEqual({ data: { id: 1 }, meta: {} });
  });

  it('should retrieve baseURL correctly from config', () => {
    // Arrange
    const config = { baseURL: 'http://localhost:1337' };

    const mockValidator = new MockStrapiSDKValidator();

    const sdk = new StrapiSDK(config, mockValidator, mockHttpClientFactory);

    // Act
    const { baseURL } = sdk;

    // Assert
    expect(baseURL).toBe(config.baseURL);
  });

  describe('StrapiSDK Collection and Single Methods', () => {
    const mockHttpClientFactory = (url: string) => new MockHttpClient(url);
    const config = { baseURL: 'http://localhost:1337' };
    const mockValidator = new MockStrapiSDKValidator();
    const sdk = new StrapiSDK(config, mockValidator, mockHttpClientFactory);

    describe('Collection Method', () => {
      it('should return an object with CRUD methods for a collection type', () => {
        const articles = sdk.collection('articles');
        expect(articles).toHaveProperty('find');
        expect(articles).toHaveProperty('findOne');
        expect(articles).toHaveProperty('create');
        expect(articles).toHaveProperty('update');
        expect(articles).toHaveProperty('delete');
      });

      it('should append complex query params correctly in find method', async () => {
        const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');
        const articles = sdk.collection('articles');
        await articles.find({
          locale: 'en',
          populate: 'author',
          fields: ['title', 'description'],
          filters: { published: true },
          sort: 'createdAt:desc',
          pagination: { page: 1, pageSize: 10 },
        });
        expect(fetchSpy).toHaveBeenCalledWith(
          '/articles?locale=en&populate=author&fields%5B0%5D=title&fields%5B1%5D=description&filters%5Bpublished%5D=true&sort=createdAt%3Adesc&pagination%5Bpage%5D=1&pagination%5BpageSize%5D=10',
          { method: 'GET' }
        );
      });

      it('should fetch a single document with complex query params in findOne method', async () => {
        const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');
        const articles = sdk.collection('articles');
        await articles.findOne('1', {
          locale: 'en',
          populate: 'comments',
          fields: ['title', 'content'],
        });
        expect(fetchSpy).toHaveBeenCalledWith(
          '/articles/1?locale=en&populate=comments&fields%5B0%5D=title&fields%5B1%5D=content',
          { method: 'GET' }
        );
      });

      it('should create a new document with create method', async () => {
        const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');
        const articles = sdk.collection('articles');
        await articles.create({ title: 'New Article' }, { locale: 'en' });
        expect(fetchSpy).toHaveBeenCalledWith('/articles?locale=en', {
          method: 'POST',
          body: JSON.stringify({ title: 'New Article' }),
        });
      });

      it('should update an existing document with update method', async () => {
        const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');
        const articles = sdk.collection('articles');
        await articles.update('1', { title: 'Updated Title' }, { locale: 'en' });
        expect(fetchSpy).toHaveBeenCalledWith('/articles/1?locale=en', {
          method: 'PUT',
          body: JSON.stringify({ title: 'Updated Title' }),
        });
      });

      it('should delete a document with delete method', async () => {
        const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');
        const articles = sdk.collection('articles');
        await articles.delete('1', { locale: 'en' });
        expect(fetchSpy).toHaveBeenCalledWith('/articles/1?locale=en', { method: 'DELETE' });
      });
    });

    describe('Single Method', () => {
      it('should return an object with CRUD methods for a single type', () => {
        const homepage = sdk.single('homepage');
        expect(homepage).toHaveProperty('findOne');
        expect(homepage).toHaveProperty('create');
        expect(homepage).toHaveProperty('update');
        expect(homepage).toHaveProperty('delete');
      });

      it('should fetch a single document with complex query params in findOne method', async () => {
        const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');
        const homepage = sdk.single('homepage');
        await homepage.findOne({
          locale: 'en',
          populate: 'sections',
          fields: ['title', 'content'],
        });
        expect(fetchSpy).toHaveBeenCalledWith(
          '/homepage?locale=en&populate=sections&fields%5B0%5D=title&fields%5B1%5D=content',
          { method: 'GET' }
        );
      });

      it('should create a new document with create method', async () => {
        const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');
        const homepage = sdk.single('homepage');
        await homepage.create({ title: 'Welcome to our site' }, { locale: 'en' });
        expect(fetchSpy).toHaveBeenCalledWith('/homepage?locale=en', {
          method: 'POST',
          body: JSON.stringify({ title: 'Welcome to our site' }),
        });
      });

      it('should update an existing document with update method', async () => {
        const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');
        const homepage = sdk.single('homepage');
        await homepage.update({ title: 'Updated Title' }, { locale: 'en' });
        expect(fetchSpy).toHaveBeenCalledWith('/homepage?locale=en', {
          method: 'PUT',
          body: JSON.stringify({ title: 'Updated Title' }),
        });
      });

      it('should delete a document with delete method', async () => {
        const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');
        const homepage = sdk.single('homepage');
        await homepage.delete({ locale: 'en' });
        expect(fetchSpy).toHaveBeenCalledWith('/homepage?locale=en', { method: 'DELETE' });
      });
    });
  });
});

describe('appendQueryParams', () => {
  it('should return the original URL if no query parameters are provided', () => {
    const url = 'http://example.com';
    expect(appendQueryParams(url)).toBe(url);
  });

  it('should append simple query parameters to the URL', () => {
    const url = 'http://example.com';
    const queryParams = { locale: 'en', status: 'published' } as BaseQueryParams;

    expect(appendQueryParams(url, queryParams)).toBe(
      'http://example.com?locale=en&status=published'
    );
  });

  it('should handle array query parameters correctly', () => {
    const url = 'http://example.com';
    const queryParams = { sort: ['createdAt:desc', 'title:asc'] };
    expect(appendQueryParams(url, queryParams)).toBe(
      'http://example.com?sort%5B0%5D=createdAt%3Adesc&sort%5B1%5D=title%3Aasc'
    );
  });

  it('should handle nested object query parameters correctly', () => {
    const url = 'http://example.com';
    const queryParams = { filters: { published: true, author: 'John Doe' } };
    expect(appendQueryParams(url, queryParams)).toBe(
      'http://example.com?filters%5Bpublished%5D=true&filters%5Bauthor%5D=John+Doe'
    );
  });

  it('should ignore undefined query parameters', () => {
    const url = 'http://example.com';
    const queryParams = { locale: 'en', status: undefined };
    expect(appendQueryParams(url, queryParams)).toBe('http://example.com?locale=en');
  });
});
