module.exports = {
  root: true,  // Mark this as the root ESLint config to prevent looking up
  extends: ['react-app'],
  plugins: ['react'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Add any custom rules here
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
};
