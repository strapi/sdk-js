import { PathFormatter } from '../../../src/formatters';

import type { FormatterConfig } from '../../../src/formatters';

describe('PathFormatter', () => {
  describe('format', () => {
    it('should format both leading and trailing slashes according to the config', () => {
      // Arrange
      const config = { leadingSlashes: 'single', trailingSlashes: false } satisfies FormatterConfig;

      // Act
      const result = PathFormatter.format('///path///', config);

      // Assert
      expect(result).toBe('/path');
    });

    it('should use default config when no config is provided', () => {
      // Act
      const result = PathFormatter.format('///path///');

      // Assert
      expect(result).toEqual('path');
    });
  });

  describe('formatTrailingSlashes', () => {
    it('should remove all trailing slashes when config is false', () => {
      // Act
      const result = PathFormatter.formatTrailingSlashes('path////', false);

      // Assert
      expect(result).toBe('path');
    });

    it('should ensure a single trailing slash when config is "single"', () => {
      // Act
      const result = PathFormatter.formatTrailingSlashes('path////', 'single');

      // Assert
      expect(result).toBe('path/');
    });

    it('should leave the path unchanged when config is true', () => {
      // Act
      const result = PathFormatter.formatTrailingSlashes('path////', true);

      // Assert
      expect(result).toBe('path////');
    });

    it('should respect the config default when no config is passed', () => {
      // Act
      const result = PathFormatter.formatTrailingSlashes('path///');

      // Assert
      expect(result).toBe('path');
    });
  });

  describe('formatLeadingSlashes', () => {
    it('should remove all leading slashes when config is false', () => {
      // Act
      const result = PathFormatter.formatLeadingSlashes('////path', false);

      // Assert
      expect(result).toBe('path');
    });

    it('should ensure a single leading slash when config is "single"', () => {
      // Act
      const result = PathFormatter.formatLeadingSlashes('////path', 'single');

      // Assert
      expect(result).toBe('/path');
    });

    it('should leave the path unchanged when config is true', () => {
      // Act
      const result = PathFormatter.formatLeadingSlashes('////path', true);

      // Assert
      expect(result).toBe('////path');
    });

    it('should respect the config default when no config is passed', () => {
      // Act
      const result = PathFormatter.formatLeadingSlashes('path');

      // Assert
      expect(result).toBe('path');
    });
  });

  describe('removeTrailingSlashes', () => {
    it('should remove all trailing slashes from the path', () => {
      // Act
      const result = PathFormatter.removeTrailingSlashes('path///');

      // Assert
      expect(result).toBe('path');
    });

    it('should return the path unchanged if there are no trailing slashes', () => {
      // Act
      const result = PathFormatter.removeTrailingSlashes('path');

      // Assert
      expect(result).toBe('path');
    });
  });

  describe('ensureSingleTrailingSlash', () => {
    it('should add a single trailing slash when there are none', () => {
      // Act
      const result = PathFormatter.ensureSingleTrailingSlash('path');

      // Assert
      expect(result).toBe('path/');
    });

    it('should reduce multiple trailing slashes to a single one', () => {
      // Act
      const result = PathFormatter.ensureSingleTrailingSlash('path///');

      // Assert
      expect(result).toBe('path/');
    });
  });

  describe('removeLeadingSlashes', () => {
    it('should remove all leading slashes from the path', () => {
      // Act
      const result = PathFormatter.removeLeadingSlashes('///path');

      // Assert
      expect(result).toBe('path');
    });

    it('should return the path unchanged if there are no leading slashes', () => {
      // Act
      const result = PathFormatter.removeLeadingSlashes('path');

      // Assert
      expect(result).toBe('path');
    });
  });

  describe('ensureSingleLeadingSlash', () => {
    it('should add a single leading slash when there are none', () => {
      // Act
      const result = PathFormatter.ensureSingleLeadingSlash('path');

      // Assert
      expect(result).toBe('/path');
    });

    it('should reduce multiple leading slashes to a single one', () => {
      // Act
      const result = PathFormatter.ensureSingleLeadingSlash('///path');

      // Assert
      expect(result).toBe('/path');
    });
  });
});
