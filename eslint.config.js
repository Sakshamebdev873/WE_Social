const expoConfig = require('eslint-config-expo/flat');
const tseslint = require('@typescript-eslint/eslint-plugin');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    // Repository pattern, enforced: only files inside a module's
    // repository/ folder (or the sync engine, which drains straight into
    // repositories on the kernel's behalf) may import the Supabase client.
    // Everything else — screens, hooks, stores — must go through a
    // repository/hook, never Supabase directly.
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/repository/**', 'core/supabase/**', 'core/offline/syncEngine.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@core/supabase/client',
              message: 'UI/hooks/stores must not call Supabase directly — go through a module repository.',
            },
          ],
        },
      ],
    },
  },
];
