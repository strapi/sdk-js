interface DocumentData {
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  [key: string]: any;
}

interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

interface Meta {
  pagination?: Pagination;
}

interface GenericResponse<T> {
  data: T;
  meta: Meta;
}

export type GenericDocumentResponse = GenericResponse<DocumentData>;

// This interface outlines the query parameters available for requests to the Strapi content API,
// without requiring specific knowledge about the structure of the content types being queried.

// It is intended for use in the generic form of the SDK when the developer has not supplied
// the content schema of their application during the SDK's initialization.

// When developers provide the SDK with the content schema of their Strapi application,
// we can utilize the supplied types to define the expected inputs and outputs.
// For example, only accepting the locale for content types that have i18n enabled.
export interface BaseQueryParams {
  populate?: string | Record<string, any>;
  fields?: string[];
  filters?: Record<string, any>;
  locale?: string;
  status?: 'published' | 'draft';
  sort?: string | string[];
  pagination?: {
    page?: number;
    pageSize?: number;
    withCount?: boolean;
    start?: number;
    limit?: number;
  };
}
