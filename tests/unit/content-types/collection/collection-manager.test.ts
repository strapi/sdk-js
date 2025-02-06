import { CollectionTypeManager } from '../../../../src/content-types';
import { MockHttpClient } from '../../mocks';

describe('CollectionTypeManager CRUD Methods', () => {
  const mockHttpClient = new MockHttpClient({ baseURL: 'http://localhost:1337' });
  const collectionManager = new CollectionTypeManager('articles', mockHttpClient);

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

  it('should return an object with CRUD methods for a collection type', () => {
    expect(collectionManager).toHaveProperty('find', expect.any(Function));
    expect(collectionManager).toHaveProperty('findOne', expect.any(Function));
    expect(collectionManager).toHaveProperty('create', expect.any(Function));
    expect(collectionManager).toHaveProperty('update', expect.any(Function));
    expect(collectionManager).toHaveProperty('delete', expect.any(Function));
  });

  it('should append complex query params correctly in find method', async () => {
    // Arrange
    const expected =
      '/articles?locale=en&populate=author&fields%5B0%5D=title&fields%5B1%5D=description&filters%5Bpublished%5D=true&sort=createdAt%3Adesc&pagination%5Bpage%5D=1&pagination%5BpageSize%5D=10';
    const requestSpy = jest.spyOn(MockHttpClient.prototype, 'request');

    jest
      .spyOn(MockHttpClient.prototype, 'request')
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(JSON.stringify({ data: [{ id: 1 }, { id: 2 }], meta: {} }), { status: 200 })
        )
      );

    // Act
    await collectionManager.find({
      locale: 'en',
      populate: 'author',
      fields: ['title', 'description'],
      filters: { published: true },
      sort: 'createdAt:desc',
      pagination: { page: 1, pageSize: 10 },
    });

    // Assert
    expect(requestSpy).toHaveBeenCalledWith(expected, { method: 'GET' });
  });

  it('should fetch a single document with complex query params in findOne method', async () => {
    // Arrange
    const expected =
      '/articles/1?locale=en&populate=comments&fields%5B0%5D=title&fields%5B1%5D=content';
    const requestSpy = jest.spyOn(MockHttpClient.prototype, 'request');

    // Act
    await collectionManager.findOne('1', {
      locale: 'en',
      populate: 'comments',
      fields: ['title', 'content'],
    });

    // Assert
    expect(requestSpy).toHaveBeenCalledWith(expected, { method: 'GET' });
  });

  it('should create a new document with create method', async () => {
    // Arrange
    const payload = { title: 'New Article' };
    const requestSpy = jest.spyOn(MockHttpClient.prototype, 'request');

    // Act
    await collectionManager.create(payload, { locale: 'en' });

    // Assert
    expect(requestSpy).toHaveBeenCalledWith('/articles?locale=en', {
      method: 'POST',
      body: JSON.stringify({ data: payload }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should update an existing document with update method', async () => {
    // Arrange
    const payload = { title: 'Updated Title' };
    const requestSpy = jest.spyOn(MockHttpClient.prototype, 'request');

    // Act
    await collectionManager.update('1', payload, { locale: 'en' });

    // Assert
    expect(requestSpy).toHaveBeenCalledWith('/articles/1?locale=en', {
      method: 'PUT',
      body: JSON.stringify({ data: payload }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should delete a document with delete method', async () => {
    // Arrange
    const requestSpy = jest.spyOn(MockHttpClient.prototype, 'request');

    // Act
    await collectionManager.delete('1', { locale: 'en' });

    // Assert
    expect(requestSpy).toHaveBeenCalledWith('/articles/1?locale=en', { method: 'DELETE' });
  });
});
