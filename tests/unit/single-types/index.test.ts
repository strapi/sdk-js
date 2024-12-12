import { SingleTypeManager } from '../../../src/single-types';
import { MockHttpClient, MockStrapiSDKValidator } from '../mocks';

describe('SingleTypeManager CRUD Methods', () => {
  const mockHttpClientFactory = (url: string) => new MockHttpClient(url);
  const config = { baseURL: 'http://localhost:1337' };
  const mockValidator = new MockStrapiSDKValidator();
  const httpClient = mockHttpClientFactory(config.baseURL);
  const singleTypeManager = new SingleTypeManager('homepage', httpClient, mockValidator);

  beforeEach(() => {
    jest
      .spyOn(MockHttpClient.prototype, '_fetch')
      .mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ data: { id: 1 }, meta: {} }), { status: 200 })
        )
      );
  });

  it('should return an object with CRUD methods for a single type', () => {
    expect(singleTypeManager).toHaveProperty('findOne');
    expect(singleTypeManager).toHaveProperty('update');
    expect(singleTypeManager).toHaveProperty('delete');
  });

  it('should fetch a single document with complex query params in findOne method', async () => {
    const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');
    await singleTypeManager.findOne({
      locale: 'en',
      populate: 'sections',
      fields: ['title', 'content'],
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/homepage?locale=en&populate=sections&fields%5B0%5D=title&fields%5B1%5D=content',
      { method: 'GET' }
    );
  });

  it('should update an existing document with update method', async () => {
    const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');
    await singleTypeManager.update({ title: 'Updated Title' }, { locale: 'en' });
    expect(fetchSpy).toHaveBeenCalledWith('/homepage?locale=en', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated Title' }),
    });
  });

  it('should delete a document with delete method', async () => {
    const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');
    await singleTypeManager.delete({ locale: 'en' });
    expect(fetchSpy).toHaveBeenCalledWith('/homepage?locale=en', { method: 'DELETE' });
  });
});
