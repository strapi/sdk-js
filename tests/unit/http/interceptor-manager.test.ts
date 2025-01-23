import { HttpInterceptorManager } from '../../../src/http/interceptor-manager';

describe('HttpInterceptorManager', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('use()', () => {
    it('should add a fulfilled interceptor to the handler chain', async () => {
      // Arrange
      const manager = new HttpInterceptorManager<number>();

      const mockFulfilled = jest.fn((value) => value + 1);

      // Act
      manager.use(mockFulfilled);

      const result = await manager.execute(1);

      // Assert
      expect(mockFulfilled).toHaveBeenCalledWith(1);
      expect(result).toBe(2);
    });

    it('should add both fulfilled and rejected interceptors to the handler chain', async () => {
      // Arrange
      const manager = new HttpInterceptorManager<number>();

      const mockFulfilled = jest.fn((value) => value + 1);
      const mockRejected = jest.fn((error) => error);

      // Act
      manager.use(mockFulfilled, mockRejected);

      const result = await manager.execute(1);

      // Assert
      expect(mockFulfilled).toHaveBeenCalledWith(1);
      expect(result).toBe(2);
    });
  });

  describe('execute()', () => {
    it('should process value through all fulfilled interceptors sequentially', async () => {
      // Arrange
      const manager = new HttpInterceptorManager<number>();

      manager.use((value) => value + 1);
      manager.use((value) => value * 2);

      // Act
      const result = await manager.execute(1);

      // Assert
      expect(result).toBe(4);
    });

    it('should handle errors with the corresponding rejected interceptor', async () => {
      // Arrange
      const manager = new HttpInterceptorManager<number>();

      const mockRejected = jest.fn(() => 0);

      // Act
      manager.use((value) => {
        if (value === 1) {
          throw new Error('Test error');
        }

        return value;
      }, mockRejected);

      const result = await manager.execute(1);

      // Assert
      expect(mockRejected).toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('should propagate an unhandled error', async () => {
      // Arrange
      const manager = new HttpInterceptorManager<number>();

      // Act
      manager.use((value) => {
        if (value === 1) {
          throw new Error('Test error');
        }

        return value;
      });

      // Assert
      await expect(manager.execute(1)).rejects.toThrow('Test error');
    });
  });

  describe('clone()', () => {
    it('should create a deep clone with the same interceptors', async () => {
      // Arrange
      const manager = new HttpInterceptorManager<number>();

      manager.use((value) => value + 1);

      // Act
      const clone = manager.clone();

      const originalResult = await manager.execute(1);
      const cloneResult = await clone.execute(1);

      // Assert
      expect(originalResult).toBe(2);
      expect(cloneResult).toBe(2);
    });

    it('should not affect the original handler chain when a clone is modified', async () => {
      // Arrange
      const manager = new HttpInterceptorManager<number>();

      manager.use((value) => value + 1);

      const clone = manager.clone();

      // Act
      clone.use((value) => value * 2);

      const originalResult = await manager.execute(1);
      const cloneResult = await clone.execute(1);

      // Assert
      expect(originalResult).toBe(2);
      expect(cloneResult).toBe(4);
    });
  });

  describe('reject()', () => {
    it('should process error through all rejected interceptors sequentially', async () => {
      // Arrange
      const manager = new HttpInterceptorManager<any>();

      const mockRejected1 = jest.fn((error) => `${error}-intercepted1`);
      const mockRejected2 = jest.fn((error) => `${error}-intercepted2`);

      // Act
      manager.use(undefined, mockRejected1);
      manager.use(undefined, mockRejected2);

      const result = await manager.reject('Test error');

      // Assert
      expect(mockRejected1).toHaveBeenCalledWith('Test error');
      expect(mockRejected2).toHaveBeenCalledWith('Test error-intercepted1');

      expect(result).toBe('Test error-intercepted1-intercepted2');
    });
  });
});
