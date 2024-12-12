import { CollectionTypeManager } from '../../../src/collection-types';
import { MockHttpClient, MockStrapiSDKValidator } from '../mocks';

describe('CollectionTypeManager CRUD Methods', () => {
  const mockHttpClient = new MockHttpClient('http://localhost:1337');
  const mockValidator = new MockStrapiSDKValidator();
  const collectionManager = new CollectionTypeManager('articles', mockHttpClient, mockValidator);

  beforeEach(() => {
    jest
      .spyOn(MockHttpClient.prototype, '_fetch')
      .mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ data: { id: 1 }, meta: {} }), { status: 200 })
        )
      );
  });

  it('should append complex query params correctly in find method', async () => {
    const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');

    jest
      .spyOn(MockHttpClient.prototype, '_fetch')
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(JSON.stringify({ data: [{ id: 1 }, { id: 2 }], meta: {} }), { status: 200 })
        )
      );

    await collectionManager.find({
      locale: 'en',
      populate: 'author',
      fields: ['title', 'description'],
      filters: { published: true },
      sort: 'createdAt:desc',
      pagination: { page: 1, pageSize: 10 },
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/articles?locale=en&populate=author&fields%5B0%5D=title&fields%5B1%5D=description&filters%5Bpublished%5D=true&sort=createdAt%3Adesc&pagination%5Bpage%5D=1&pagination%5BpageSize%5D=10',
      { method: 'GET' }
    );
  });

  it('should fetch a single document with complex query params in findOne method', async () => {
    const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');
    await collectionManager.findOne('1', {
      locale: 'en',
      populate: 'comments',
      fields: ['title', 'content'],
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/articles/1?locale=en&populate=comments&fields%5B0%5D=title&fields%5B1%5D=content',
      { method: 'GET' }
    );
  });

  it('should create a new document with create method', async () => {
    const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');
    await collectionManager.create({ title: 'New Article' }, { locale: 'en' });
    expect(fetchSpy).toHaveBeenCalledWith('/articles?locale=en', {
      method: 'POST',
      body: JSON.stringify({ title: 'New Article' }),
    });
  });

  it('should update an existing document with update method', async () => {
    const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');
    await collectionManager.update('1', { title: 'Updated Title' }, { locale: 'en' });
    expect(fetchSpy).toHaveBeenCalledWith('/articles/1?locale=en', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated Title' }),
    });
  });

  it('should delete a document with delete method', async () => {
    const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');
    await collectionManager.delete('1', { locale: 'en' });
    expect(fetchSpy).toHaveBeenCalledWith('/articles/1?locale=en', { method: 'DELETE' });
  });
});
