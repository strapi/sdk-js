import { SingleTypeManager } from '../../../../src/content-types';
import { MockHttpClient } from '../../mocks';

describe('SingleTypeManager CRUD Methods', () => {
  const mockHttpClientFactory = (url: string) => new MockHttpClient({ baseURL: url });
  const config = { baseURL: 'http://localhost:1337/api' };
  const httpClient = mockHttpClientFactory(config.baseURL);
  const singleTypeManager = new SingleTypeManager('homepage', httpClient);

  beforeEach(() => {
    jest
      .spyOn(MockHttpClient.prototype, 'request')
      .mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ data: { id: 1 }, meta: {} }), { status: 200 })
        )
      );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return an object with CRUD methods for a single type', () => {
    expect(singleTypeManager).toHaveProperty('find', expect.any(Function));
    expect(singleTypeManager).toHaveProperty('update', expect.any(Function));
    expect(singleTypeManager).toHaveProperty('delete', expect.any(Function));
  });

  it('should fetch a single document with complex query params in find method', async () => {
    // Arrange
    const expected =
      '/homepage?locale=en&populate=sections&fields%5B0%5D=title&fields%5B1%5D=content';
    const requestSpy = jest.spyOn(MockHttpClient.prototype, 'request');

    // Act
    await singleTypeManager.find({
      locale: 'en',
      populate: 'sections',
      fields: ['title', 'content'],
    });

    // Assert
    expect(requestSpy).toHaveBeenCalledWith(expected, { method: 'GET' });
  });

  it('should update an existing document with update method', async () => {
    // Arrange
    const payload = { title: 'Updated Title' };
    const requestSpy = jest.spyOn(MockHttpClient.prototype, 'request');

    // Act
    await singleTypeManager.update(payload, { locale: 'en' });

    // Assert
    expect(requestSpy).toHaveBeenCalledWith('/homepage?locale=en', {
      method: 'PUT',
      body: JSON.stringify({ data: payload }),
    });
  });

  it('should delete a document with delete method', async () => {
    // Arrange
    const requestSpy = jest.spyOn(MockHttpClient.prototype, 'request');

    // Act
    await singleTypeManager.delete({ locale: 'en' });

    // Assert
    expect(requestSpy).toHaveBeenCalledWith('/homepage?locale=en', { method: 'DELETE' });
  });
});
