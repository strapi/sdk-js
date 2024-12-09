export const mockRequest = (method: string, url: string): Request => ({
  method,
  url,
  headers: new Headers(),
  redirect: 'follow',
  clone: jest.fn(),
  body: null,
  bodyUsed: false,
  cache: 'default',
  credentials: 'same-origin',
  integrity: '',
  keepalive: false,
  mode: 'same-origin',
  referrer: '',
  referrerPolicy: 'no-referrer',
  destination: '',
  signal: AbortSignal.any([]), // Mocked property
  arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)), // Mocked function
  blob: jest.fn().mockResolvedValue(new Blob()), // Mocked function
  formData: jest.fn().mockResolvedValue(new FormData()), // Mocked function
  text: jest.fn().mockResolvedValue(''), // Mocked function
  json: jest.fn().mockResolvedValue({}), // Mocked function
});
