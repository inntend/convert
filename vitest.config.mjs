export default {
  test: {
    coverage: {
      thresholds: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
};
