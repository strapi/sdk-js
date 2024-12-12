import type { BaseQueryParams } from '../types/content-api';

/**
 * Utility function to append query parameters to a URL.
 *
 * @param url - The base URL to which query parameters will be appended.
 * @param queryParams - An optional object representing query parameters as key-value pairs.
 *
 * @returns The URL with appended query parameters if any are provided.
 */
export function appendQueryParams(url: string, queryParams?: BaseQueryParams): string {
  if (!queryParams) {
    return url;
  }

  const params = new URLSearchParams();

  const appendParam = (key: string, value: any) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        params.append(`${key}[${index}]`, String(item));
      });
    } else if (typeof value === 'object' && value !== null) {
      for (const [subKey, subValue] of Object.entries(value)) {
        appendParam(`${key}[${subKey}]`, subValue);
      }
    } else {
      params.append(key, String(value));
    }
  };

  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined) {
      appendParam(key, value);
    }
  }

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}
