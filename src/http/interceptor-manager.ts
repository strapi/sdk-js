export type Interceptor<T> = (value: T) => Promise<T> | T;

export interface Handler<T> {
  fulfilled?: Interceptor<T>;
  rejected?: Interceptor<any>;
}

export type Handlers<T> = Handler<T>[];

/**
 * A utility class for managing and executing a series of interceptors on a
 * provided value, such as requests or responses, in an HTTP client.
 *
 * @template T - The type of the value to be processed by the interceptors.
 *
 * @example
 * // Creating an instance of HttpInterceptorManager
 * const requestInterceptors = new HttpInterceptorManager<{ request: Request }>();
 *
 * // Adding interceptors
 * requestInterceptors.use(async (value) => {
 *   console.log('Processing request: ', value);
 *   return value; // Required to continue the chain
 * }, async (error) => {
 *   console.error('Handling request error:', error);
 *   throw error; // If not re-thrown, the chain continues
 * });
 *
 * // Executing interceptors
 * const processedValue = await requestInterceptors.execute({ request: new Request('http://example.com') });
 */
export class HttpInterceptorManager<T> {
  private readonly _handlers: Handlers<T>;

  constructor(handlers: Handlers<T> = []) {
    this._handlers = handlers;
  }

  /**
   * Registers a new fulfilled and/or rejected interceptor to the handler chain.
   *
   * @param fulfilled - A function to process the input value when the operation succeeds.
   * This is required and must return the value or a transformed version of it.
   *
   * @param [rejected] - (Optional) A function to handle errors that may occur in the chain.
   * This function should either throw an error or return a transformed value.
   *
   * @returns The current instance of `HttpInterceptorManager` for method chaining.
   *
   * @example
   * const manager = new HttpInterceptorManager<Request>();
   *
   * manager.use(
   *   async (value) => {
   *     console.log('Processing:', value);
   *     return value;
   *   },
   *   async (error) => {
   *     console.error('Error:', error);
   *     return error;
   *   }
   * );
   */
  public use(fulfilled?: Interceptor<T>, rejected?: Interceptor<unknown>): this {
    this._handlers.push({ fulfilled, rejected });
    return this;
  }

  /**
   * Creates a deep clone of the current `HttpInterceptorManager` instance,
   * including all currently registered interceptors.
   *
   * @returns A new `HttpInterceptorManager` instance with identical interceptors in the same order.
   *
   * @example
   * const originalManager = new HttpInterceptorManager();
   * const clonedManager = originalManager.clone();
   */
  public clone(): HttpInterceptorManager<T> {
    return new HttpInterceptorManager([...this._handlers]);
  }

  /**
   * Executes the registered interceptors sequentially, processing the provided
   * input value through the fulfilled and optional rejected interceptors.
   *
   * If any fulfilled interceptor throws an error and a corresponding rejected
   * interceptor is defined, the rejected interceptor handles the error.
   * Otherwise, the error propagates up the chain.
   *
   * @param value - The initial value to be processed through the interceptor chain.
   *
   * @returns A promise resolving to the processed value after all interceptors have been executed.
   *
   * @throws - Any error that is not handled by a rejected interceptor is re-thrown.
   *
   * @example
   * const interceptors = new HttpInterceptorManager<{ request: Request }>();
   *
   * interceptors.use(async (value) => {
   *   value.request.headers.set('Authorization', 'Bearer token');
   *   return value;
   * });
   *
   * const result = await interceptors.execute({ request: new Request('http://example.com') });
   */
  public async execute(value: T): Promise<T> {
    let out = value;

    for (const handler of this._handlers) {
      try {
        if (handler.fulfilled) {
          out = await handler.fulfilled(out);
        }
      } catch (error) {
        if (handler.rejected) {
          out = await handler.rejected(error);
        } else {
          throw error;
        }
      }
    }
    return out;
  }

  /**
   * Executes only the rejected interceptors sequentially with an initial error value.
   *
   * This method is useful for propagating errors through a chain of rejection handlers.
   *
   * @param error - The initial error to be processed by the rejected interceptors.
   *
   * @returns A promise resolving to the final processed error value, which may be transformed
   * by the rejection handlers.
   *
   * @example
   * const interceptors = new HttpInterceptorManager<any>();
   *
   * interceptors.use(
   *   null,
   *   async (error) => {
   *     console.log('Handling error:', error);
   *     return { handled: true };
   *   }
   * );
   *
   * const result = await interceptors.reject(new Error('Sample error'));
   */
  public async reject(error: unknown): Promise<unknown> {
    let out = error;
    for (const handler of this._handlers) {
      if (handler.rejected) {
        out = await handler.rejected(out);
      }
    }
    return out;
  }
}
