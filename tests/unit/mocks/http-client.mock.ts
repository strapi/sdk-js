import { HttpClient } from '../../../src/http';

import { MockURLValidator } from './url-validator.mock';

import type { HttpClientConfig } from '../../../src/http';
import type { URLValidator } from '../../../src/validators';

export class MockHttpClient extends HttpClient {
  constructor(config: HttpClientConfig, urlValidator: URLValidator = new MockURLValidator()) {
    super(config, urlValidator);
  }

  fetch(_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> {
    return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  }
}
