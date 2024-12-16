import { SingleTypeManager } from '../../../../src/content-types';
import { MockHttpClient } from '../../mocks';

describe('SingleTypeManager CRUD Methods', () => {
  const mockHttpClientFactory = (url: string) => new MockHttpClient(url);
  const config = { baseURL: 'http://localhost:1337/api' };
  const httpClient = mockHttpClientFactory(config.baseURL);
  const singleTypeManager = new SingleTypeManager('homepage', httpClient);

  beforeEach(() => {
    jest
      .spyOn(MockHttpClient.prototype, '_fetch')
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
    const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');

    // Act
    await singleTypeManager.find({
      locale: 'en',
      populate: 'sections',
      fields: ['title', 'content'],
    });

    // Assert
    expect(fetchSpy).toHaveBeenCalledWith(expected, { method: 'GET' });
  });

  it('should update an existing document with update method', async () => {
    // Arrange
    const payload = { title: 'Updated Title' };
    const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');

    // Act
    await singleTypeManager.update(payload, { locale: 'en' });

    // Assert
    expect(fetchSpy).toHaveBeenCalledWith('/homepage?locale=en', {
      method: 'PUT',
      body: JSON.stringify({ data: payload }),
    });
  });

  it('should delete a document with delete method', async () => {
    // Arrange
    const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');

    // Act
    await singleTypeManager.delete({ locale: 'en' });

    // Assert
    expect(fetchSpy).toHaveBeenCalledWith('/homepage?locale=en', { method: 'DELETE' });
  });
});
