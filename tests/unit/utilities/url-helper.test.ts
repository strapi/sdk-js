import { BaseQueryParams } from '../../../src/types/content-api';
import { URLHelper } from '../../../src/utilities';

describe('URLHelper', () => {
  describe('appendQueryParams', () => {
    it('should return the original URL if no query parameters are provided', () => {
      // Arrange
      const url = 'http://example.com';

      // Act
      const result = URLHelper.appendQueryParams(url);

      // Assert
      expect(result).toBe(url);
    });

    it('should append simple query parameters to the URL', () => {
      // Arrange
      const url = 'http://example.com';
      const queryParams = { locale: 'en', status: 'published' } as BaseQueryParams;

      // Act
      const result = URLHelper.appendQueryParams(url, queryParams);

      // Assert
      expect(result).toBe('http://example.com?locale=en&status=published');
    });

    it('should handle array query parameters correctly', () => {
      // Arrange
      const url = 'http://example.com';
      const queryParams = { sort: ['createdAt:desc', 'title:asc'] };

      // Act
      const result = URLHelper.appendQueryParams(url, queryParams);

      // Assert
      expect(result).toBe(
        'http://example.com?sort%5B0%5D=createdAt%3Adesc&sort%5B1%5D=title%3Aasc'
      );
    });

    it('should handle nested object query parameters correctly', () => {
      // Arrange
      const url = 'http://example.com';
      const queryParams = { filters: { published: true, author: 'John Doe' } };

      // Act
      const result = URLHelper.appendQueryParams(url, queryParams);

      // Assert
      expect(result).toBe(
        'http://example.com?filters%5Bpublished%5D=true&filters%5Bauthor%5D=John+Doe'
      );
    });

    it('should ignore undefined query parameters', () => {
      // Arrange
      const url = 'http://example.com';
      const queryParams = { locale: 'en', status: undefined };

      // Act
      const result = URLHelper.appendQueryParams(url, queryParams);

      // Assert
      expect(result).toBe('http://example.com?locale=en');
    });

    it('should append query parameters with empty string values', () => {
      // Arrange
      const url = 'http://example.com';
      const queryParams = { locale: '' };

      // Act
      const result = URLHelper.appendQueryParams(url, queryParams);

      // Assert
      expect(result).toBe('http://example.com?locale=');
    });

    it('should handle complex nested structures', () => {
      // Arrange
      const url = 'http://example.com';
      const queryParams = { filters: { nested: { level1: { level2: 'value' } } } };

      // Act
      const result = URLHelper.appendQueryParams(url, queryParams);

      // Assert
      expect(result).toBe('http://example.com?filters%5Bnested%5D%5Blevel1%5D%5Blevel2%5D=value');
    });

    it('should handle pagination parameters correctly', () => {
      // Arrange
      const url = 'http://example.com';
      const queryParams = { pagination: { page: 1, pageSize: 10, withCount: true } };

      // Act
      const result = URLHelper.appendQueryParams(url, queryParams);

      // Assert
      expect(result).toBe(
        'http://example.com?pagination%5Bpage%5D=1&pagination%5BpageSize%5D=10&pagination%5BwithCount%5D=true'
      );
    });

    it('should return the original URL when no query params are provided', () => {
      // Arrange
      const url = 'http://example.com';

      // Act
      const result = URLHelper.appendQueryParams(url, {});

      // Assert
      expect(result).toBe('http://example.com');
    });

    it('should handle mixed types in query parameters', () => {
      // Arrange
      const url = 'http://example.com';
      const queryParams = {
        locale: 'en',
        sort: ['createdAt:desc', 'title:asc'],
        filters: { published: true },
        pagination: { page: 1, pageSize: 10 },
      };

      // Act
      const result = URLHelper.appendQueryParams(url, queryParams);

      // Assert
      expect(result).toBe(
        'http://example.com?locale=en&sort%5B0%5D=createdAt%3Adesc&sort%5B1%5D=title%3Aasc&filters%5Bpublished%5D=true&pagination%5Bpage%5D=1&pagination%5BpageSize%5D=10'
      );
    });

    it('should ignore undefined values at every nesting level', () => {
      // Arrange
      const url = 'http://example.com';
      const queryParams = {
        sort: [undefined] as unknown as string[],
        filters: { published: undefined },
        locale: undefined,
      };

      // Act
      const result = URLHelper.appendQueryParams(url, queryParams);

      // Assert
      expect(result).toBe('http://example.com');
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
