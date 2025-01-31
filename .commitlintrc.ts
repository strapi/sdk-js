import { RuleConfigSeverity } from '@commitlint/types';

import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      RuleConfigSeverity.Error,
      'always',
      [
        'chore',
        'ci',
        'docs',
        'enhancement',
        'feat',
        'fix',
        'release',
        'revert',
        'security',
        'test',
      ],
    ],
  },
  // ignore commit messages github uses on their PR buttons, "Update" or "Merge branch"
  ignores: [
    (commitMessage) => {
      // add an exception for github
      return (
        commitMessage.startsWith('Update ') ||
        /^Merge branch '.*' into [a-zA-Z0-9\/\-_]+$/.test(commitMessage)
      );
    },
  ],
};

export default config;
