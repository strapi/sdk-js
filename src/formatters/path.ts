const DEFAULT_CONFIG = {
  trailingSlashes: false,
  leadingSlashes: false,
} satisfies FormatterConfig;

type SlashConfig = 'single' | true | false;

export interface FormatterConfig {
  trailingSlashes?: SlashConfig;
  leadingSlashes?: SlashConfig;
}

export class PathFormatter {
  public static format(path: string, config: FormatterConfig = DEFAULT_CONFIG): string {
    // Trailing Slashes
    path = PathFormatter.formatTrailingSlashes(path, config.trailingSlashes);

    // Leading Slashes
    path = PathFormatter.formatLeadingSlashes(path, config.leadingSlashes);

    return path;
  }

  public static formatTrailingSlashes(
    path: string,
    config: SlashConfig = DEFAULT_CONFIG.trailingSlashes
  ): string {
    // Single means making sure there is exactly one trailing slash
    if (config === 'single') {
      return PathFormatter.ensureSingleTrailingSlash(path);
    }

    // False means removing all trailing slashes
    else if (!config) {
      return PathFormatter.removeTrailingSlashes(path);
    }

    // False or anything else
    else {
      return path;
    }
  }

  public static removeTrailingSlashes(path: string) {
    return path.replace(/\/+$/, '');
  }

  public static ensureSingleTrailingSlash(path: string) {
    return `${this.removeTrailingSlashes(path)}/`;
  }

  public static formatLeadingSlashes(
    path: string,
    config: SlashConfig = DEFAULT_CONFIG.leadingSlashes
  ): string {
    // Single means making sure there is exactly one leading slash
    if (config === 'single') {
      return PathFormatter.ensureSingleLeadingSlash(path);
    }

    // False means removing all leading slashes
    else if (!config) {
      return PathFormatter.removeLeadingSlashes(path);
    }

    // False or anything else
    else {
      return path;
    }
  }

  public static removeLeadingSlashes(path: string) {
    return path.replace(/^\/+/, '');
  }

  public static ensureSingleLeadingSlash(path: string) {
    return `/${this.removeLeadingSlashes(path)}`;
  }
}
