module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Disable some strict rules for build
    'react/no-unescaped-entities': 'off',
    '@next/next/no-img-element': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
};
