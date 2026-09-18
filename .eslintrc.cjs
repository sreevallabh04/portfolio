/**
 * `npm run lint` was defined in package.json but there was no config file, so
 * the script failed with "ESLint couldn't find a configuration file" on every
 * run (and in CI).
 */
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: 'detect' } },
  ignorePatterns: ['dist', 'node_modules', '*.config.js'],
  rules: {
    // The new JSX transform means React need not be in scope, and prop-types
    // are not used anywhere in this codebase.
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'warn',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-empty': ['error', { allowEmptyCatch: true }],
    // Advisory in this codebase: several effects legitimately seed state from a
    // subscription setup path. Kept visible as warnings rather than blocking.
    'react-hooks/set-state-in-effect': 'warn',
    'react-hooks/purity': 'warn',
    'react-hooks/immutability': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    // react-three-fiber's <primitive> takes an `object` prop that the React
    // plugin does not know about.
    'react/no-unknown-property': ['error', { ignore: ['object'] }],
  },
};
