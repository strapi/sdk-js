import { HttpInterceptorManager } from './interceptor-manager';

import type { Interceptor } from './interceptor-manager';

export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// Payloads

export type RequestInterceptorPayload = { request: Request };
export type ResponseInterceptorPayload = { response: Response; request: Request };

// Interceptors

export type RequestInterceptor = Interceptor<RequestInterceptorPayload>;
export type ResponseInterceptor = Interceptor<ResponseInterceptorPayload>;

// Interceptor Managers

export type RequestInterceptorManager = HttpInterceptorManager<RequestInterceptorPayload>;
export type ResponseInterceptorManager = HttpInterceptorManager<ResponseInterceptorPayload>;

// MISC

export interface InterceptorManagerMap {
  request: RequestInterceptorManager;
  response: ResponseInterceptorManager;
}
