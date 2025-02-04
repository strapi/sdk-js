import { BaseQueryParams } from '../../../src/types/content-api';
import { URLHelper } from '../../../src/utilities';

describe('URLHelper', () => {
  describe('appendQueryParams', () => {
    it('should return the original URL if no query parameters are provided', () => {
      // Arrange
      const url = 'https://example.com';

      // Act
      const result = URLHelper.appendQueryParams(url);

      // Assert
      expect(result).toBe(url);
    });

    it('should return the original URL if an empty query parameters object is provided', () => {
      // Arrange
      const url = 'https://example.com';

      // Act
      const result = URLHelper.appendQueryParams(url, {});

      // Assert
      expect(result).toBe(url);
    });

    it('should append a query string to the URL when query parameters are provided', () => {
      // Arrange
      const url = 'https://example.com';
      const queryParams = { locale: 'en' };

      // Act
      const result = URLHelper.appendQueryParams(url, queryParams);

      // Assert
      expect(result).toBe('https://example.com?locale=en'); // Assuming `stringifyQueryParams` is correct
    });

    it('should correctly handle URLs that already have existing query parameters', () => {
      // Arrange
      const url = 'https://example.com?existingParam=value';
      const queryParams = { populate: 'relation' } satisfies BaseQueryParams;

      // Act
      const result = URLHelper.appendQueryParams(url, queryParams);

      // Assert
      expect(result).toBe('https://example.com?existingParam=value&populate=relation'); // Assuming serialization is correct
    });

    it('should include "?" only when query parameters are appended', () => {
      // Arrange
      const url = 'https://example.com';
      const emptyQueryParams = {};

      // Act
      const result = URLHelper.appendQueryParams(url, emptyQueryParams);

      // Assert
      expect(result).toBe('https://example.com'); // No changes to URL
    });

    it('should correctly append query parameters to a URL that ends with a slash', () => {
      // Arrange
      const url = 'https://example.com/';
      const queryParams = { locale: 'en' };

      // Act
      const result = URLHelper.appendQueryParams(url, queryParams);

      // Assert
      expect(result).toBe('https://example.com/?locale=en'); // Assuming `stringifyQueryParams` handles serialization
    });

    it('should handle empty string URLs (invalid but edge case)', () => {
      // Arrange
      const url = '';
      const queryParams = { populate: 'relation' } satisfies BaseQueryParams;

      // Act
      const result = URLHelper.appendQueryParams(url, queryParams);

      // Assert
      expect(result).toBe('?populate=relation'); // Only query string left if URL is empty
    });

    it('should handle appending to a URL without modifying path fragments', () => {
      // Arrange
      const url = 'https://example.com/path/to/resource/';
      const queryParams = { populate: 'relation' } satisfies BaseQueryParams;

      // Act
      const result = URLHelper.appendQueryParams(url, queryParams);

      // Assert
      expect(result).toBe('https://example.com/path/to/resource/?populate=relation'); // Path untouched
    });

    it('should handle null or undefined queryParams gracefully', () => {
      // Arrange
      const url = 'https://example.com';

      // Act
      const result = URLHelper.appendQueryParams(url, undefined);

      // Assert
      expect(result).toBe(url);
    });
  });

  describe('stringifyQueryParams', () => {
    it('should return an empty string for empty query parameters', () => {
      // Arrange
      const queryParams = {} satisfies BaseQueryParams;

      // Act
      const result = URLHelper.stringifyQueryParams(queryParams);

      // Assert
      expect(result).toBe('');
    });

    it('should stringify simple query parameters', () => {
      // Arrange
      const queryParams = { locale: 'en', status: 'published' } satisfies BaseQueryParams;

      // Act
      const result = URLHelper.stringifyQueryParams(queryParams);

      // Assert
      expect(result).toBe('locale=en&status=published');
    });

    it('should handle array query parameters correctly', () => {
      // Arrange
      const queryParams = { sort: ['createdAt:desc', 'title:asc'] } satisfies BaseQueryParams;

      // Act
      const result = URLHelper.stringifyQueryParams(queryParams);

      // Assert
      expect(result).toBe('sort%5B0%5D=createdAt%3Adesc&sort%5B1%5D=title%3Aasc');
    });

    it('should handle nested object query parameters correctly', () => {
      // Arrange
      const queryParams = {
        filters: { published: true, author: 'John Doe' },
      } satisfies BaseQueryParams;

      // Act
      const result = URLHelper.stringifyQueryParams(queryParams);

      // Assert
      expect(result).toBe('filters%5Bpublished%5D=true&filters%5Bauthor%5D=John%20Doe');
    });

    it('should ignore undefined query parameters', () => {
      // Arrange
      const queryParams = { locale: 'en', status: undefined } satisfies BaseQueryParams;

      // Act
      const result = URLHelper.stringifyQueryParams(queryParams);

      // Assert
      expect(result).toBe('locale=en');
    });

    it('should stringify query parameters with empty string values', () => {
      // Arrange
      const queryParams = { locale: '' } satisfies BaseQueryParams;

      // Act
      const result = URLHelper.stringifyQueryParams(queryParams);

      // Assert
      expect(result).toBe('locale=');
    });

    it('should handle complex nested structures', () => {
      // Arrange
      const queryParams = {
        filters: { nested: { level1: { level2: 'value' } } },
      } satisfies BaseQueryParams;

      // Act
      const result = URLHelper.stringifyQueryParams(queryParams);

      // Assert
      expect(result).toBe('filters%5Bnested%5D%5Blevel1%5D%5Blevel2%5D=value');
    });

    it('should handle complex nested structures with multiple conditions', () => {
      // Arrange
      const queryParams = {
        filters: {
          $or: [{ name: { $containsi: 'tech' } }, { description: { $containsi: 'tech' } }],
        },
      } satisfies BaseQueryParams;

      // Act
      const result = URLHelper.stringifyQueryParams(queryParams);

      // Assert
      expect(result).toBe(
        'filters%5B%24or%5D%5B0%5D%5Bname%5D%5B%24containsi%5D=tech&filters%5B%24or%5D%5B1%5D%5Bdescription%5D%5B%24containsi%5D=tech'
      );
    });

    it('should handle pagination parameters correctly', () => {
      // Arrange
      const queryParams = {
        pagination: { page: 1, pageSize: 10, withCount: true },
      } satisfies BaseQueryParams;

      // Act
      const result = URLHelper.stringifyQueryParams(queryParams);

      // Assert
      expect(result).toBe(
        'pagination%5Bpage%5D=1&pagination%5BpageSize%5D=10&pagination%5BwithCount%5D=true'
      );
    });

    it('should return an empty string when no query params are provided', () => {
      // Arrange
      const queryParams = {} satisfies BaseQueryParams;

      // Act
      const result = URLHelper.stringifyQueryParams(queryParams);

      // Assert
      expect(result).toBe('');
    });

    it('should handle mixed types in query parameters', () => {
      // Arrange
      const queryParams = {
        locale: 'en',
        sort: ['createdAt:desc', 'title:asc'],
        filters: { published: true },
        pagination: { page: 1, pageSize: 10 },
      } satisfies BaseQueryParams;

      // Act
      const result = URLHelper.stringifyQueryParams(queryParams);

      // Assert
      expect(result).toBe(
        'locale=en&sort%5B0%5D=createdAt%3Adesc&sort%5B1%5D=title%3Aasc&filters%5Bpublished%5D=true&pagination%5Bpage%5D=1&pagination%5BpageSize%5D=10'
      );
    });

    it('should ignore undefined values at every nesting level', () => {
      // Arrange
      const queryParams = {
        sort: [undefined] as unknown as string[],
        filters: { published: undefined },
        locale: undefined,
      } satisfies BaseQueryParams;

      // Act
      const result = URLHelper.stringifyQueryParams(queryParams);

      // Assert
      expect(result).toBe('');
    });
  });

  describe('toReadablePath', () => {
    it('should format string-like URLs', () => {
      // Arrange
      const url = 'https://example.com/articles/1?param1=a&param2=b&param3=c';

      // Act
      const out = URLHelper.toReadablePath(url);

      // Assert
      expect(out).toBe('https://example.com/articles/1');
    });

    it('should format URL instances', () => {
      // Arrange
      const url = new URL('https://example.com/articles/1?param1=a&param2=b&param3=c');

      // Act
      const out = URLHelper.toReadablePath(url);

      // Assert
      expect(out).toBe('https://example.com/articles/1');
    });
  });
});
