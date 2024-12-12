import { BaseQueryParams } from '../../../src/types/content-api';
import { appendQueryParams } from '../../../src/utilities';

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

  it('should append query parameters with empty string values', () => {
    const url = 'http://example.com';
    const queryParams = { locale: '' };
    expect(appendQueryParams(url, queryParams)).toBe('http://example.com?locale=');
  });

  it('should handle complex nested structures', () => {
    const url = 'http://example.com';
    const queryParams = { filters: { nested: { level1: { level2: 'value' } } } };
    expect(appendQueryParams(url, queryParams)).toBe(
      'http://example.com?filters%5Bnested%5D%5Blevel1%5D%5Blevel2%5D=value'
    );
  });

  it('should handle pagination parameters correctly', () => {
    const url = 'http://example.com';
    const queryParams = { pagination: { page: 1, pageSize: 10, withCount: true } };
    expect(appendQueryParams(url, queryParams)).toBe(
      'http://example.com?pagination%5Bpage%5D=1&pagination%5BpageSize%5D=10&pagination%5BwithCount%5D=true'
    );
  });

  it('should handle mixed types in query parameters', () => {
    const url = 'http://example.com';
    const queryParams = {
      locale: 'en',
      sort: ['createdAt:desc', 'title:asc'],
      filters: { published: true },
      pagination: { page: 1, pageSize: 10 },
    };
    expect(appendQueryParams(url, queryParams)).toBe(
      'http://example.com?locale=en&sort%5B0%5D=createdAt%3Adesc&sort%5B1%5D=title%3Aasc&filters%5Bpublished%5D=true&pagination%5Bpage%5D=1&pagination%5BpageSize%5D=10'
    );
  });
});
