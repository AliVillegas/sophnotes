import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'app/**/*.{ts,tsx}',
    'app/**/page.tsx',
    'app/**/layout.tsx',
    'next.config.{js,ts}',
    'jest.config.{js,ts}',
    'jest.setup.{js,ts}',
    'postcss.config.{js,mjs}',
  ],
  project: ['**/*.{ts,tsx}'],
  ignore: [
    '**/__tests__/**',
    '**/*.test.{ts,tsx}',
    '.next/**',
    'node_modules/**',
    'public/**',
  ],
  ignoreDependencies: [
    'ts-jest',
    'eslint-config-next',
    'eslint-config-prettier',
    'eslint-plugin-import',
    'eslint-plugin-jsx-a11y',
    'eslint-plugin-prettier',
    'lint-staged',
    'tailwindcss',
    'tw-animate-css',
    'postcss',
  ],
  ignoreIssues: {
    'components/ui/badge.tsx': ['exports', 'types'],
    'components/ui/button.tsx': ['exports'],
    'components/ui/toast.tsx': ['exports'],
    'hooks/use-toast.ts': ['exports'],
  },
};

export default config;
